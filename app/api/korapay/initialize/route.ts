import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { getActivePricing } from "@/lib/pricing"
import { TicketModel } from "@/models/Ticket"
import { grossUpNGNLocal, parseBooleanEnv } from "@/lib/fees"

export const runtime = "nodejs"

// Initialize a Korapay checkout session and return the authorization URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, quantity = 1 } = body

    await dbConnect()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!process.env.KORAPAY_SECRET_KEY) {
      console.error("KORAPAY_SECRET_KEY is not set")
      return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 500 })
    }

    const { price, ticketType, setting } = await getActivePricing()
    const sold = await TicketModel.countDocuments({ paymentStatus: "success" })
    const remaining = Math.max((setting?.totalTickets ?? 100) - sold, 0)
    if (quantity > remaining) {
      return NextResponse.json({ error: `Only ${remaining} tickets left` }, { status: 400 })
    }

    const passFees = parseBooleanEnv(process.env.PASS_FEES_TO_CUSTOMER)
    const netTotal = price * quantity
    const chargeAmountNaira = passFees ? grossUpNGNLocal(netTotal) : netTotal

    // For Checkout Standard we'll return a server-generated reference and the amount
    // The client will load Korapay's script and call window.Korapay.initialize(...) with the public key
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const reference = `DNA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  // Korapay expects amounts in Naira (base units) for Checkout Standard — return amount as a decimal number
  const amountNaira = Number(chargeAmountNaira.toFixed(2))

    const publicKey = process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY || process.env.KORAPAY_PUBLIC_KEY || null

    // Korapay requires webhook/notification URLs to be HTTPS in production.
    // When developing on localhost, avoid sending an HTTP notification_url because some providers reject non-HTTPS callbacks.
    const maybeNotificationUrl = baseUrl.startsWith("https") ? `${baseUrl}/api/korapay/webhook` : undefined

    const payload: any = {
      reference,
      amount: amountNaira,
      currency: "NGN",
      // Korapay expects customer.phone_number (not customer.phone). Send only allowed fields.
      customer: { email, name: `${firstName || ""} ${lastName || ""}`.trim() },
      publicKey,
    }
    if (maybeNotificationUrl) payload.notification_url = maybeNotificationUrl

    return NextResponse.json({ success: true, data: payload })

  } catch (error) {
    console.error("Korapay initialization error:", error)
    const isAbort = (error as any)?.name === "AbortError"
    return NextResponse.json(
      { error: isAbort ? "Payment initialization timed out. Please try again." : "Failed to initialize payment" },
      { status: 500 },
    )
  }
}
