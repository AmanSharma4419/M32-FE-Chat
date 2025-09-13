import { NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api"

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData()
    const message = formData.get("message") as string
    const sessionId = formData.get("sessionId") as string
    const authToken = formData.get("authToken") as string

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication token required" },
        { status: 401 }
      )
    }


    // Send chat message
    const chatUrl = API_CONFIG.EXTERNAL_API_URLS.CHAT
    const chatPayload = {
      user_input: message,
      session_id: sessionId || "" 
    }

    console.log("Sending chat message to:", chatUrl)
    console.log("Chat payload:", chatPayload)

    const chatResponse = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify(chatPayload),
    })

    console.log("Chat response status:", chatResponse.status)

    if (!chatResponse.ok) {
      throw new Error(`Chat API error: ${chatResponse.status}`)
    }

    const chatData = await chatResponse.json()

    // Extract session ID from response if provided
    const responseSessionId = chatData.session_id || sessionId

    // Return the response from external server
    return NextResponse.json({
      success: true,
      response: chatData.response || chatData.message || "Message received",
      sessionId: responseSessionId,
      data: chatData
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
