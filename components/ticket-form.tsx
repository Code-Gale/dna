"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TicketFormProps {
  step: number
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    ticketType: string
    quantity: number
    guestName: string
    dietaryRestrictions: string
  }
  ticketPrices: Record<string, number>
  isEarlyBird: boolean
  onFormChange: (field: string, value: string | number) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

export default function TicketForm({ step, formData, ticketPrices, isEarlyBird, onFormChange, onNextStep, onPreviousStep }: TicketFormProps) {
  const [paying, setPaying] = useState(false)
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 20000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      return res
    } finally {
      clearTimeout(id)
    }
  }
  const currentPrice = ticketPrices[formData.ticketType] || ticketPrices.standard || 5000
  const ticketOptions = [
    {
      id: "standard",
      name: "General Admission",
      price: `₦${currentPrice.toLocaleString()}${isEarlyBird ? " (Early Bird)" : ""}`,
      description: "Admission with dinner and entertainment",
      features: ["3-course dinner", "Entertainment", "Awards ceremony access"],
    },
  ]

  return (
    <div>
      {/* Step 1: Ticket Selection */}
      {step === 1 && (
        <Card className="p-8 border-accent/20 transition-transform duration-200 hover:scale-[1.01]">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Step 1: Select Your Ticket</h2>

          <div className="space-y-4 mb-8">
            {ticketOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => onFormChange("ticketType", option.id)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.ticketType === option.id
                    ? "border-primary bg-primary/5"
                    : "border-accent/20 hover:border-accent/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{option.name}</h3>
                    <p className="text-sm text-foreground/70">{option.description}</p>
                  </div>
                  <span className="font-serif text-xl font-bold text-primary">{option.price}</span>
                </div>
                <ul className="text-sm text-foreground/70 space-y-1">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-3">Number of Tickets</label>
            <select
              value={formData.quantity}
              onChange={(e) => onFormChange("quantity", Number.parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Ticket" : "Tickets"}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={onNextStep} className="w-full bg-primary hover:bg-primary/90 text-white py-3">
            Continue to Attendee Info
          </Button>
        </Card>
      )}

      {/* Step 2: Attendee Information */}
      {step === 2 && (
        <Card className="p-8 border-accent/20 transition-transform duration-200 hover:scale-[1.01]">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Step 2: Your Information</h2>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => onFormChange("firstName", e.target.value)}
                  className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => onFormChange("lastName", e.target.value)}
                  className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormChange("phone", e.target.value)}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {formData.quantity > 1 && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Guest Name</label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => onFormChange("guestName", e.target.value)}
                  className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Guest name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Dietary Restrictions</label>
              <textarea
                value={formData.dietaryRestrictions}
                onChange={(e) => onFormChange("dietaryRestrictions", e.target.value)}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Any dietary restrictions or allergies?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={onPreviousStep}
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5 bg-transparent"
            >
              Back
            </Button>
            <Button onClick={onNextStep} className="flex-1 bg-primary hover:bg-primary/90 text-white">
              Continue to Payment
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <Card className="p-8 border-accent/20 transition-transform duration-200 hover:scale-[1.01]">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Step 3: Payment</h2>

          <div className="bg-primary/5 border border-accent/20 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Attendee:</span>
                <span className="font-semibold text-foreground">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Email:</span>
                <span className="font-semibold text-foreground">{formData.email}</span>
              </div>
              <div className="flex justify-between border-t border-accent/20 pt-2 mt-2">
                <span className="text-foreground/70">Ticket Type:</span>
                <span className="font-semibold text-foreground capitalize">{formData.ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Quantity:</span>
                <span className="font-semibold text-foreground">{formData.quantity}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-8">
            <p className="text-sm text-foreground/70 mb-4">
              Click the button below to proceed to secure payment via Korapay. You'll receive your e-ticket via email
              after successful payment.
            </p>
            <Button
              disabled={paying}
              onClick={async () => {
                try {
                  setPaying(true)
                  const res = await fetchWithTimeout("/api/korapay/initialize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      phone: formData.phone,
                      quantity: formData.quantity,
                    }),
                  })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) {
                    const message = (data as any)?.error || (data as any)?.message || "Failed to initialize payment"
                    console.error("Initialize payment failed:", { status: res.status, data })
                    throw new Error(message)
                  }
                  const payload = data?.data
                  if (!payload) throw new Error("Invalid initialization response")

                  const publicKey = payload.publicKey
                  if (!publicKey) throw new Error("Payment public key not configured")

                  // Dynamically load Korapay Checkout script if not already loaded
                  async function loadKorapayScript() {
                    if ((window as any).Korapay) return
                    await new Promise<void>((resolve, reject) => {
                      const s = document.createElement("script")
                      s.src = "https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js"
                      s.async = true
                      s.onload = () => resolve()
                      s.onerror = (e) => reject(e)
                      document.head.appendChild(s)
                    })
                  }

                  try {
                    await loadKorapayScript()
                  } catch (err) {
                    console.error("Failed to load Korapay script", err)
                    throw new Error("Unable to load payment UI")
                  }

                  // Initialize Korapay Checkout Standard
                  try {
                    ;(window as any).Korapay.initialize({
                      key: publicKey,
                      reference: payload.reference,
                      amount: payload.amount,
                      currency: payload.currency || "NGN",
                      customer: payload.customer || { name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email },
                      notification_url: payload.notification_url,
                      onClose: function () {
                        setPaying(false)
                      },
                      onSuccess: function (resp: any) {
                        // Redirect to ticket confirmation where server verifies and issues tickets
                        window.location.href = `/ticket-confirmation?reference=${payload.reference}`
                      },
                      onFailed: function (resp: any) {
                        console.error("Korapay reported failure:", resp)
                        alert("Payment failed. Please try again.")
                        setPaying(false)
                      },
                    })
                  } catch (err) {
                    console.error("Korapay initialization error", err)
                    throw new Error("Failed to open payment modal")
                  }
                } catch (e) {
                  console.error("Payment init error:", e)
                  alert((e as Error).message)
                } finally {
                  setPaying(false)
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
            >
              {paying ? "Redirecting…" : "Pay with Korapay"}
            </Button>
          </div>

          <Button
            onClick={onPreviousStep}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/5 bg-transparent"
          >
            Back
          </Button>
        </Card>
      )}
    </div>
  )
}
