import { NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Use configured external API URL
    const EXTERNAL_API_URL = API_CONFIG.EXTERNAL_API_URLS.LOGIN
    
    // Forward request to external server
    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the response from external server
    return NextResponse.json(data)

  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process login request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
