import { NextResponse } from "next/server"

// Deprecated: Paystack verification has been replaced by Korapay verification.
// This endpoint intentionally returns 410 to guide callers to update to /api/korapay/verify
export async function POST() {
  return NextResponse.json({ error: "Paystack integration removed. Use /api/korapay/verify instead." }, { status: 410 })
}

 

