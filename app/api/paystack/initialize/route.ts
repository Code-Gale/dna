import { NextResponse } from "next/server"

// Deprecated: Paystack routes have been replaced by Korapay equivalents.
// This endpoint intentionally returns 410 to guide callers to update to /api/korapay/initialize
export async function POST() {
  return NextResponse.json({ error: "Paystack integration removed. Use /api/korapay/initialize instead." }, { status: 410 })
}
