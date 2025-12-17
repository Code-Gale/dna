"use client"

import { useEffect, useState } from "react"
import TicketForm from "@/components/ticket-form"
import PaymentSummary from "@/components/payment-summary"

export default function TicketsPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ticketType: "standard",
    quantity: 1,
    guestName: "",
    dietaryRestrictions: "",
  })

  const [step, setStep] = useState(1)

  const [ticketPrices, setTicketPrices] = useState<Record<string, number>>({ standard: 5000, vip: 7500, student: 5000 })
  const [isEarlyBird, setIsEarlyBird] = useState<boolean>(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/tickets/stats", { cache: "no-store" })
        const data = await res.json()
        const early = new Date() <= new Date(data.earlyBirdDeadline)
        setIsEarlyBird(!!early)
        // Use prices from settings
        const price = early ? (data.earlyBirdPrice ?? 5000) : (data.regularPrice ?? 7500)
        setTicketPrices({ standard: price, vip: price, student: price })
      } catch {}
    }
    run()
  }, [])

  const totalPrice = ticketPrices[formData.ticketType] * formData.quantity

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/5 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Get Your Tickets</h1>
          <p className="text-lg text-foreground/70">Secure your spot at Dinner N' Awards Night</p>
          <p className="text-sm text-foreground/60 mt-2">{isEarlyBird ? "Early Bird pricing in effect" : "Regular pricing active"} — ₦{ticketPrices.standard.toLocaleString()} per ticket</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-4 mb-12">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= stepNum ? "bg-primary text-white" : "bg-accent/20 text-foreground/60"
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-12 h-1 transition-colors ${step > stepNum ? "bg-primary" : "bg-accent/20"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <TicketForm
              step={step}
              formData={formData}
              ticketPrices={ticketPrices}
              isEarlyBird={isEarlyBird}
              onFormChange={handleFormChange}
              onNextStep={handleNextStep}
              onPreviousStep={handlePreviousStep}
            />
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <PaymentSummary formData={formData} totalPrice={totalPrice} ticketPrices={ticketPrices} />
          </div>
        </div>
      </div>
    </div>
  )
}
