import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Fetching all scans from database")
    
    // Fetch ALL scans - NO LIMITS, NO FILTERING
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Supabase Error:", error.message)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    console.log(`Successfully fetched ${data?.length || 0} scans`)
    
    return NextResponse.json({
      success: true,
      data: data || []
    })
    
  } catch (error) {
    console.error("Scans API error:", error)
    
    let errorMessage = 'Unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
