'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Home() {
  const [domain, setDomain] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
  }

  const handleScan = async () => {
    // Fix UI flicker - set loading first
    setIsScanning(true);
    
    try {
      console.log("🚀 SCAN STARTED");

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain }),
        cache: "no-store"
      });

      console.log("📡 FETCH SENT");

      const data = await res.json();

      console.log("📦 RESPONSE:", data);
      console.log("TOTAL:", data.data?.subdomains?.length || 0);

      if (data.success) {
        toast.success(`Scan completed! Found ${data.data.total} subdomains`);
        router.push(`/dashboard?domain=${encodeURIComponent(domain)}&scanId=${data.data.scanId}`);
      } else {
        toast.error(data.error || 'Scan failed');
      }

    } catch (err) {
      console.error("❌ SCAN ERROR:", err);
      toast.error('Scan failed. Please try again.');
    } finally {
      // Fix UI flicker - set loading last
      setIsScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Secure<span className="text-primary">Axis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Advanced Subdomain Reconnaissance Platform
          </p>
          <p className="text-sm text-gray-500">
            Professional-grade subdomain enumeration with multiple tools
          </p>
        </div>

        <div className="card card-hover">
          <div className="mb-6">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Target Domain
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="example.com"
              className="input-field"
              disabled={isScanning}
            />
          </div>

          <button
            onClick={() => {
              console.log("🔥 BUTTON CLICKED");
              handleScan();
            }}
            disabled={isScanning || !domain.trim()}
            className="btn-primary w-full text-lg py-4"
          >
            {isScanning ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Scanning...
              </div>
            ) : (
              'Start Reconnaissance'
            )}
          </button>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Amass Integration
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Subfinder Support
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Certificate Transparency
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              DNS Brute Force
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by OWASP reconnaissance methodology</p>
        </div>
      </div>
    </main>
  );
}
