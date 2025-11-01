// Helpers to compute Paystack fees and optionally gross-up the amount
// Defaults target Nigeria local card/transfer fees: 1.5% + ₦100, ₦100 waived below ₦2,500, fee capped at ₦2,000

export type NGNLocalFeeParams = {
  rate?: number // percentage as decimal, default 0.015
  flat?: number // flat fee in Naira, default 100
  flatWaiverBelow?: number // waive flat below this charge amount, default 2500
  cap?: number // maximum fee per transaction, default 2000
}

const defaultNGNLocal: Required<NGNLocalFeeParams> = {
  rate: 0.015,
  flat: 100,
  flatWaiverBelow: 2500,
  cap: 2000,
}

// Compute the gross charge so that after fees the merchant nets `net` (Naira)
export function grossUpNGNLocal(net: number, params: NGNLocalFeeParams = {}): number {
  const { rate, flat, flatWaiverBelow, cap } = { ...defaultNGNLocal, ...params }
  if (net <= 0) return 0

  // First pass: assume flat applies
  const g1 = (net + flat) / (1 - rate)
  const fee1 = rate * g1 + flat
  if (fee1 > cap) {
    // Cap reached; gross is net + cap
    return net + cap
  }
  if (g1 < flatWaiverBelow) {
    // Flat should be waived; recompute without flat
    const g2 = net / (1 - rate)
    return g2
  }
  return g1
}

export function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false
  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}
