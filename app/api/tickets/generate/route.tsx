import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

// In-memory ticket storage (replace with database in production)
const tickets: Record<
  string,
  {
    id: string
    firstName: string
    lastName: string
    email: string
    ticketType: string
    qrCode: string
    createdAt: string
    verified: boolean
  }
> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, ticketType, paymentReference } = body

    // Generate unique ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Generate QR code containing ticket ID and email
    const qrData = JSON.stringify({
      ticketId,
      email,
      firstName,
      lastName,
      ticketType,
    })

    const qrCode = await QRCode.toDataURL(qrData)

    // Store ticket
    tickets[ticketId] = {
      id: ticketId,
      firstName,
      lastName,
      email,
      ticketType,
      qrCode,
      createdAt: new Date().toISOString(),
      verified: false,
    }

    // Send email with e-ticket (integrate with email service)
    await sendTicketEmail(email, {
      ticketId,
      firstName,
      lastName,
      ticketType,
      qrCode,
    })

    return NextResponse.json({
      success: true,
      ticketId,
      message: "E-ticket generated and sent to email",
    })
  } catch (error) {
    console.error("Ticket generation error:", error)
    return NextResponse.json({ error: "Failed to generate ticket" }, { status: 500 })
  }
}

async function sendTicketEmail(
  email: string,
  ticketData: {
    ticketId: string
    firstName: string
    lastName: string
    ticketType: string
    qrCode: string
  },
) {
  // This is a placeholder for email service integration
  // In production, use services like SendGrid, Resend, or AWS SES
  console.log(`Sending e-ticket to ${email}:`, ticketData)

  // Example with Resend (uncomment and configure):
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'tickets@dinnerawards.com',
  //   to: email,
  //   subject: 'Your Dinner N\' Awards Night E-Ticket',
  //   html: generateEmailHTML(ticketData),
  // });
}

function generateEmailHTML(ticketData: {
  ticketId: string
  firstName: string
  lastName: string
  ticketType: string
  qrCode: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6B3FA0 0%, #D4AF37 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .ticket { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 300px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dinner N' Awards Night</h1>
            <p>Your E-Ticket</p>
          </div>
          
          <div class="ticket">
            <h2>Hello ${ticketData.firstName} ${ticketData.lastName},</h2>
            <p>Thank you for purchasing your ticket! Your e-ticket is ready.</p>
            
            <p><strong>Ticket Details:</strong></p>
            <ul>
              <li>Ticket ID: ${ticketData.ticketId}</li>
              <li>Ticket Type: ${ticketData.ticketType.toUpperCase()}</li>
              <li>Date: Saturday, March 15, 2025</li>
              <li>Time: 6:00 PM - 11:00 PM</li>
              <li>Location: Grand Ballroom, Provincial Convention Center</li>
            </ul>
            
            <p><strong>Your QR Code:</strong></p>
            <div class="qr-code">
              <img src="${ticketData.qrCode}" alt="Ticket QR Code" />
            </div>
            
            <p>Please present this QR code at the entrance for check-in.</p>
            
            <p><strong>What to Bring:</strong></p>
            <ul>
              <li>This email or printed ticket</li>
              <li>Valid ID</li>
              <li>Formal attire (Black Tie)</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>If you have any questions, contact us at info@dinnerawards.com</p>
            <p>&copy; 2025 Dinner N' Awards Night. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
