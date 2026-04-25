'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/utils/supabase/client'

interface ScanResult {
  domain: string
  subdomains: string[]
  alive: string[]
  total: number
  aliveCount: number
  timestamp: string
  scanTime?: string
  tools?: {
    amass: number
    subfinder: number
    crtsh: number
    dns: number
    additional: number
  }
}

export default function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [scanData, setScanData] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [locked, setLocked] = useState(false)
  const [filter, setFilter] = useState<'all' | 'alive' | 'dead'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const domain = searchParams.get('domain')
  const scanId = searchParams.get('scanId')

  useEffect(() => {
    if (!domain) {
      router.push('/')
      return
    }

    // ONLY run scan if no data exists - NO DB FETCH TO PREVENT OVERWRITE
    if (!scanData && !isScanning) {
      console.log('No scan data found, running fresh scan for:', domain)
      
      // LOCK STATE: Prevent other updates during scan
      setIsScanning(true)
      setLoading(true)
      
      const runScan = async () => {
        try {
          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain }),
            cache: 'no-store', // MUST ADD - disable fetch caching
          })

          if (response.ok) {
            const result = await response.json()
            console.log("DEBUG: Full API result:", result)
            console.log("DEBUG: result.success:", result.success)
            console.log("DEBUG: result.data:", result.data)
            console.log("DEBUG: result.data.subdomains:", result.data?.subdomains)
            
            if (result.success) {
              console.log(`Scan completed: ${result.data.total} subdomains found`)
              console.log("RECEIVED:", result.data.subdomains.length)
              console.log("TOTAL:", result.data.subdomains.length)
              console.log("FINAL RESULT:", result.data.subdomains.length)
              
              if (result.data.databaseSaveSuccess) {
                console.log('Scan data saved to database successfully')
              } else if (result.data.databaseError) {
                console.warn('Database save failed:', result.data.databaseError)
              }
              
              // PREVENT OVERWRITE: Lock data after scan completes
              if (!locked) {
                console.log("SET DATA CALLED: From scan (ONLY)")
                const newScanData = {
                  ...result.data,
                  subdomains: [...result.data.subdomains], // force new array reference
                  alive: [...(result.data.alive || [])] // force new array reference
                }
                
                setScanData(newScanData)
                setLocked(true) // LOCK DATA TO PREVENT OVERWRITE
              } else {
                console.log("SKIP UPDATE: Data is locked, preventing overwrite")
              }
            } else {
              console.error('Scan failed:', result.error)
              // Don't set fallback data on error - keep loading state
            }
          } else {
            throw new Error('Failed to run scan')
          }
        } catch (error) {
          console.error('Error running scan:', error)
        } finally {
          setLoading(false)
          setIsScanning(false) // UNLOCK STATE
        }
      }

      runScan()
    }
  }, [domain, scanId, scanData, isScanning, router])

  const exportResults = () => {
    if (!scanData) return

    const dataStr = JSON.stringify(scanData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `secureaxis_${scanData.domain}_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Results exported successfully!')
  }

  const getFilteredSubdomains = () => {
    console.log("DEBUG: getFilteredSubdomains called")
    console.log("DEBUG: scanData:", scanData)
    console.log("DEBUG: scanData.subdomains:", scanData?.subdomains)
    
    if (!scanData) {
      console.log("DEBUG: No scanData, returning empty array")
      return []
    }
    
    let filtered = scanData.subdomains
    console.log("DEBUG: Initial filtered:", filtered)
    
    if (filter === 'alive') {
      filtered = scanData.alive
      console.log("DEBUG: Filtered to alive:", filtered)
    } else if (filter === 'dead') {
      filtered = scanData.subdomains.filter(sub => !scanData.alive.includes(sub))
      console.log("DEBUG: Filtered to dead:", filtered)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log("DEBUG: Filtered by search term:", filtered)
    }
    
    const result = filtered.sort()
    console.log("DEBUG: Final result:", result)
    return result
  }

  const handleNewScan = async () => {
    if (!domain || isScanning) return
    
    try {
      console.log('Starting new scan for:', domain)
      
      // UNLOCK DATA FOR NEW SCAN
      setLocked(false)
      
      // LOCK STATE: Prevent other updates during scan
      setIsScanning(true)
      setLoading(true)
      
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
        cache: 'no-store', // MUST ADD - disable fetch caching
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`New scan completed: ${result.data.total} subdomains found`)
          console.log("RECEIVED:", result.data.subdomains.length)
          console.log("FINAL RESULT:", result.data.subdomains.length)
          
          // PREVENT OVERWRITE: Lock data after scan completes
          if (!locked) {
            console.log("SET DATA CALLED: From new scan (ONLY)")
            setScanData({
              ...result.data,
              subdomains: [...result.data.subdomains], // force new array reference
              alive: [...(result.data.alive || [])] // force new array reference
            })
            setLocked(true) // LOCK DATA TO PREVENT OVERWRITE
          } else {
            console.log("SKIP UPDATE: Data is locked, preventing overwrite")
          }
        } else {
          console.error('Scan failed:', result.error)
        }
      }
    } catch (error) {
      console.error('New scan error:', error)
    } finally {
      setLoading(false)
      setIsScanning(false) // UNLOCK STATE
    }
  }

  const getStatusBadge = (subdomain: string) => {
    const isAlive = scanData?.alive.includes(subdomain)
    return isAlive ? 
      <span className="badge-success">Alive</span> : 
      <span className="badge-error">Dead</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scan results...</p>
        </div>
      </div>
    )
  }

  if (!scanData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No scan data found</h2>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const filteredSubdomains = getFilteredSubdomains()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Scan Results: <span className="text-primary">{scanData.domain}</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Scanned on {new Date(scanData.timestamp).toLocaleString()}
                {scanData.scanTime && ` • Duration: ${scanData.scanTime}`}
              </p>
            </div>
            <button 
              onClick={() => {
                // UNLOCK DATA FOR NEW SCAN - allow button to work even if locked
                if (!isScanning) {
                  setLocked(false)
                  setIsScanning(true)
                  setLoading(true)
                  // Trigger new scan for same domain
                  setTimeout(() => {
                    handleNewScan()
                  }, 100)
                }
              }}
              disabled={isScanning || loading}
              className="btn-primary"
            >
              {isScanning || loading ? 'Scanning...' : 'Scan Again'}
            </button>
            <button 
              onClick={() => router.push('/')}
              className="btn-secondary"
            >
              New Domain
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subdomains</p>
                <p className="text-2xl font-bold text-gray-900">{scanData.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alive Subdomains</p>
                <p className="text-2xl font-bold text-green-600">{scanData.aliveCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✗</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dead Subdomains</p>
                <p className="text-2xl font-bold text-red-600">{scanData.total - scanData.aliveCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {scanData.total > 0 ? Math.round((scanData.aliveCount / scanData.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Statistics */}
        {scanData.tools && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Amass</div>
                <div className="text-xl font-bold text-purple-600">{scanData.tools.amass}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Subfinder</div>
                <div className="text-xl font-bold text-blue-600">{scanData.tools.subfinder}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">crt.sh</div>
                <div className="text-xl font-bold text-green-600">{scanData.tools.crtsh}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">DNS Brute</div>
                <div className="text-xl font-bold text-orange-600">{scanData.tools.dns}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Additional</div>
                <div className="text-xl font-bold text-indigo-600">{scanData.tools.additional || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search subdomains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({scanData.total})
                </button>
                <button
                  onClick={() => setFilter('alive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'alive' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Alive ({scanData.aliveCount})
                </button>
                <button
                  onClick={() => setFilter('dead')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'dead' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dead ({scanData.total - scanData.aliveCount})
                </button>
              </div>
            </div>
            
            <button
              onClick={exportResults}
              className="btn-primary whitespace-nowrap"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Results Table - Force re-render with dynamic key */}
        <div key={scanData?.total || 0} className="card">
          <div className="table-container">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-cell text-left font-medium text-gray-900">Subdomain</th>
                  <th className="table-cell text-left font-medium text-gray-900">Status</th>
                  <th className="table-cell text-left font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                    console.log("DEBUG: Rendering - filteredSubdomains.length:", filteredSubdomains.length)
                    console.log("DEBUG: filteredSubdomains:", filteredSubdomains)
                    if (filteredSubdomains.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3} className="table-cell text-center text-gray-500 py-8">
                            No subdomains found matching your criteria
                          </td>
                        </tr>
                      )
                    } else {
                      console.log("DEBUG: Rendering subdomains map")
                      return filteredSubdomains.map((subdomain: string, index: number) => (
                        <tr key={`${subdomain}-${index}`} className="table-row">
                          <td className="table-cell font-mono text-sm">
                            {subdomain}
                          </td>
                          <td className="table-cell">
                            {getStatusBadge(subdomain)}
                          </td>
                          <td className="table-cell">
                            <div className="flex gap-2">
                              <a
                                href={`http://${subdomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                HTTP
                              </a>
                              <a
                                href={`https://${subdomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                HTTPS
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
