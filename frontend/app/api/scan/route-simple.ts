import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Return demo results for now
    const demoResult = {
      domain: domain,
      subdomains: [
        `www.${domain}`,
        `api.${domain}`,
        `mail.${domain}`,
        `admin.${domain}`,
        `test.${domain}`
      ],
      alive: [`api.${domain}`, `mail.${domain}`],
      total: 5,
      aliveCount: 2,
      timestamp: new Date().toISOString(),
      scanTime: "2.5s",
      tools: {
        amass: 0,
        subfinder: 0,
        crtsh: 0,
        dns: 5
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...demoResult,
        scanId: Date.now().toString()
      }
    })

  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json(
      { success: false, error: 'API error occurred' },
      { status: 500 }
    )
  }
}
