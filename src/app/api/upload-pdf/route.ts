import { NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api"

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sessionId = formData.get("sessionId") as string
    const authToken = formData.get("authToken") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication token required" },
        { status: 401 }
      )
    }

    // Upload PDF to external API
    const pdfUploadUrl = `${API_CONFIG.EXTERNAL_API_URLS.PDF_UPLOAD}/${sessionId}/upload-pdf`
    console.log("Uploading PDF to:", pdfUploadUrl)
    console.log("File details:", { name: file.name, size: file.size, type: file.type })
    
    const pdfFormData = new FormData()
    pdfFormData.append("file", file, file.name)

    const pdfResponse = await fetch(pdfUploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "accept": "application/json",
      },
      body: pdfFormData,
    })

    console.log("PDF upload response status:", pdfResponse.status)

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text()
      console.error("PDF upload error:", errorText)
      return NextResponse.json(
        { error: `PDF upload failed: ${pdfResponse.status} - ${errorText}` },
        { status: pdfResponse.status }
      )
    }

    const pdfData = await pdfResponse.json()
    console.log("PDF upload success:", pdfData)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "PDF uploaded successfully",
      data: pdfData
    })

  } catch (error) {
    console.error("PDF upload API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to upload PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
