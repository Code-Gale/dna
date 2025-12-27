import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serialNumber, fullName, email, backgroundImage } = body

    if (!serialNumber || !fullName || !email || !backgroundImage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate QR code with ticket data
    const qrData = JSON.stringify({
      serialNumber,
      fullName,
      email,
    })

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Return QR code and background image data
    // The client will composite them using canvas for preview
    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      backgroundImage,
      serialNumber,
      fullName,
      email,
    })
  } catch (error) {
    console.error("Preview generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    )
  }
}

