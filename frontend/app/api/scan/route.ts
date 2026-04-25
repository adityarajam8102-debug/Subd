import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { createClient } from '@/utils/supabase/server'

// Force dynamic API - no caching
export const dynamic = "force-dynamic"

const execAsync = promisify(exec)

interface ScanResult {
  domain: string
  subdomains: string[]
  alive: string[]
  total: number
  aliveCount: number
  timestamp: string
  scanTime: string
  tools: {
    amass: number
    subfinder: number
    crtsh: number
    dns: number
    additional: number
  }
}

export async function POST(request: NextRequest) {
  console.log("🔥 API HIT - Real scanning started");
  
  try {
    const { domain } = await request.json()
    console.log("� Request body parsed:", domain);

    if (!domain) {
      console.log("❌ No domain provided");
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
    if (!domainRegex.test(domain)) {
      console.log("❌ Invalid domain format:", domain);
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    // Call REAL backend scanner
    const backendPath = "d:\\New folder (6)\\SUBDOMAIN\\backend\\scanner.js"
    console.log(`[API] Calling REAL scanner at: ${backendPath}`)
    console.log(`[API] Domain to scan: ${domain}`)
    
    try {
      console.log("[API] Executing REAL scanner command...")
      const { stdout, stderr } = await execAsync(`node "${backendPath}" "${domain}"`, {
        timeout: 300000, // 5 minutes timeout for real scanning
      })
      
      console.log(`[API] Scanner stdout length: ${stdout.length}`)
      if (stderr) {
        console.log(`[API] Scanner stderr: ${stderr}`)
      }

      console.log("[API] Parsing REAL scanner output...")
      let result: ScanResult
      try {
        result = JSON.parse(stdout)
        console.log("[API] Successfully parsed REAL JSON")
        console.log("TOTAL:", result.subdomains.length)
        console.log("AMASS:", result.tools.amass)
        console.log("SUBFINDER:", result.tools.subfinder)
        console.log("CRTSH:", result.tools.crtsh)
        console.log("DNS:", result.tools.dns)
        console.log("ADDITIONAL:", result.tools.additional)
        
        // FAILSAFE CHECK - if results < 10, log failure
        if (result.subdomains.length < 10) {
          console.log("SCAN FAILURE: Only", result.subdomains.length, "results found")
          console.log("Check tool execution and installation")
        }
        
      } catch (parseError) {
        console.error('[API] Failed to parse scanner output:', parseError)
        return NextResponse.json(
          { success: false, error: 'Failed to parse scan results' },
          { status: 500 }
        )
      }

      // Save to Supabase with proper error handling
      let databaseSaveSuccess = false
      let databaseError = null
      
      try {
        const supabase = createClient()
        
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Saving scan:", domain)
        console.log("TOTAL:", result.total)
        console.log("SUBDOMAINS LENGTH:", result.subdomains.length)
        
        const { data, error } = await supabase
          .from("scans")
          .insert([{
            domain: result.domain,
            total: result.total,
            alive: result.aliveCount,
            subdomains: result.subdomains, // FULL DATA - NO LIMITS
            created_at: new Date().toISOString()
          }])
          .select()
        
        if (error) {
          console.error("Insert error:", error.message)
          databaseError = error.message
          databaseSaveSuccess = false
        } else {
          console.log("Database save successful:", data)
          databaseSaveSuccess = true
        }
        
      } catch (dbError) {
        console.error("Database connection error:", dbError)
        databaseError = dbError instanceof Error ? dbError.message : 'Unknown database error'
        databaseSaveSuccess = false
      }

      // Return REAL results with database status
      const response = {
        success: true,
        data: {
          ...result,
          scanId: Date.now().toString(),
          databaseSaveSuccess,
          databaseError: databaseError || null
        }
      }
      
      if (databaseError) {
        console.log("Database save failed, but returning scan results anyway")
      }
      
      return NextResponse.json(response)

    } catch (execError) {
      console.error('[API] Scanner execution error:', execError)
      console.log('[API] Returning failsafe response due to scanner error')
      return NextResponse.json({
        success: false,
        error: 'Scanner execution failed',
        subdomains: [] // FAILSAFE - always return array
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[API] Scan API error:', error)
    console.log('[API] Returning failsafe response due to API error')
    
    let errorMessage = 'Unknown error occurred'
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Scan timeout. Please try again.'
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Scanner not found. Please check backend setup.'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      subdomains: [] // FAILSAFE - always return array
    }, { status: 500 })
  }
}
