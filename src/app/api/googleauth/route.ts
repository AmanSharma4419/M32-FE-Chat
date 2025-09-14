import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const EXTERNAL_API_URL = API_CONFIG.EXTERNAL_API_URLS.GOOGLE_AUTH;

    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "External API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Auth API error:", error);
    return NextResponse.json({ error: "Google auth failed" }, { status: 500 });
  }
}
