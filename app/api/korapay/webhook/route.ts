import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// Simple webhook bridge: accept Korapay webhook payload, extract reference and
// forward to our internal verify endpoint so server-side processing (idempotent)
// runs in one place. This file intentionally keeps signature verification as a
// stub — enable it with KORAPAY_WEBHOOK_SECRET if you have one and follow
// Korapay's docs to compute/verifiy signatures.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    // Try a few locations for reference depending on Korapay payload shape
    const reference = body?.data?.reference || body?.reference || body?.data?.metadata?.reference || body?.data?.metadata?.reference_id || null

    if (!reference) {
      return NextResponse.json({ error: "Missing reference in webhook payload" }, { status: 400 })
    }

    // Optional: signature verification stub
    const webhookSecret = process.env.KORAPAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const receivedSig = request.headers.get("x-korapay-signature") || request.headers.get("x-signature")
      // TODO: compute HMAC and compare. Leaving as a no-op for now.
      if (!receivedSig) {
        console.warn("Korapay webhook: missing signature header while KORAPAY_WEBHOOK_SECRET is set")
      }
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const verifyUrl = `${base.replace(/\/$/, "")}/api/korapay/verify`

    // Forward to our verify endpoint which will perform idempotent processing
    const resp = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })

    const data = await resp.json().catch(() => ({}))
    return NextResponse.json({ success: true, forwarded: true, status: resp.status, data })
  } catch (err) {
    console.error("Korapay webhook error:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
