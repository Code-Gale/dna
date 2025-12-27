import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { TicketModel } from "@/models/Ticket"
import { sendMail } from "@/lib/mailer"
import { dbConnect } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { serialNumber, fullName, email, recipientEmail, emailMessage, backgroundImage } = body

    if (!serialNumber || !fullName || !email || !recipientEmail || !backgroundImage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate unique ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Generate QR code with ticket data
    const qrData = JSON.stringify({
      serialNumber,
      fullName,
      email,
      ticketId,
    })

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Save ticket to database
    await TicketModel.create({
      ticketId,
      firstName,
      lastName,
      email,
      phone: "", // Not required for manual tickets
      amountPaid: 0, // Manual tickets may not have payment
      paymentStatus: "success",
      ticketType: "regular", // Default type
      qrCode: qrCodeDataUrl,
      reference: `MANUAL-${serialNumber}`,
    })

    // Create email HTML with ticket
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 640px;
              margin: 0 auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .email-container {
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #6B3FA0 0%, #D4AF37 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 20px;
            }
            .message {
              margin-bottom: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-left: 3px solid #6B3FA0;
              border-radius: 4px;
            }
            .ticket-container {
              position: relative;
              width: 100%;
              aspect-ratio: 3/1;
              background-image: url(${backgroundImage});
              background-size: cover;
              background-position: center;
              border-radius: 8px;
              overflow: hidden;
              margin: 20px 0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .qr-overlay {
              position: absolute;
              top: 0;
              right: 0;
              width: 35%;
              height: 100%;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              box-sizing: border-box;
            }
            .qr-overlay img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .ticket-details {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .ticket-details p {
              margin: 8px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Dinner N' Awards Night</h1>
              <p style="margin: 8px 0 0;">Your Digital Ticket</p>
            </div>
            <div class="content">
              <p>Hello ${fullName},</p>
              ${emailMessage ? `<div class="message">${emailMessage.replace(/\n/g, "<br>")}</div>` : ""}
              
              <div class="ticket-container">
                <div class="qr-overlay">
                  <img src="${qrCodeDataUrl}" alt="QR Code" />
                </div>
              </div>

              <div class="ticket-details">
                <p><strong>Ticket Holder:</strong> ${fullName}</p>
                <p><strong>Ticket ID:</strong> ${ticketId}</p>
                <p><strong>Serial Number:</strong> ${serialNumber}</p>
              </div>

              <div class="ticket-details">
                <p><strong>Ticket Information:</strong></p>
                <p>• Present this QR code at the entrance for check-in</p>
                <p>• This ticket is non-transferable</p>
                <p>• Please arrive on time</p>
              </div>

              <div class="footer">
                <p>If you have any questions, please contact us.</p>
                <p>&copy; 2025 Dinner N' Awards Night. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Prepare email attachments (QR code as image)
    const qrBase64 = qrCodeDataUrl.split(",")[1] || ""
    const attachments = [
      {
        filename: `${ticketId}-qr.png`,
        content: Buffer.from(qrBase64, "base64"),
        contentType: "image/png",
        cid: `qr-${ticketId}@tickets`,
      },
    ]

    // Send email
    await sendMail({
      to: recipientEmail,
      subject: `Your Dinner N' Awards Night Ticket - ${serialNumber}`,
      html: emailHtml,
      attachments,
    })

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Ticket generated and sent successfully",
    })
  } catch (error) {
    console.error("Manual ticket generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate ticket", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

