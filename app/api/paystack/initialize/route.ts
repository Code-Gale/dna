import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { getActivePricing } from "@/lib/pricing"
import { TicketModel } from "@/models/Ticket"
import { SettingModel } from "@/models/Setting"
import { grossUpNGNLocal, parseBooleanEnv } from "@/lib/fees"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, quantity = 1 } = body

    await dbConnect()
  const { price, ticketType, setting } = await getActivePricing()
    const sold = await TicketModel.countDocuments({ paymentStatus: "success" })
    const remaining = Math.max((setting?.totalTickets ?? 100) - sold, 0)
    if (quantity > remaining) {
      return NextResponse.json({ error: `Only ${remaining} tickets left` }, { status: 400 })
    }

    // Determine charge amount (in Naira). If passing fees to customer, gross-up.
    const passFees = parseBooleanEnv(process.env.PASS_FEES_TO_CUSTOMER)
    const netTotal = price * quantity
    const chargeAmountNaira = passFees ? grossUpNGNLocal(netTotal) : netTotal

    // Initialize Paystack payment
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(chargeAmountNaira * 100),
        currency: "NGN",
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/ticket-confirmation`,
        metadata: {
          firstName,
          lastName,
          phone,
          quantity,
          ticketType,
          passFees,
          netTotal,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Paystack initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
