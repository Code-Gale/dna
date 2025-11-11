"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Download, Share2 } from "lucide-react"

export default function TicketConfirmation() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      if (!reference) return
      try {
        const res = await fetch("/api/korapay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        })
        const data = await res.json()
        if (data?.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-accent/5 pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading your ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/5 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-accent" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">Payment Successful!</h1>
          <p className="text-lg text-foreground/70">Your e-ticket has been sent to your email</p>
        </div>

        {/* Ticket Card */}
        <Card className="p-8 border-accent/20 mb-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">Your E-Ticket{tickets.length > 1 ? 's' : ''}</h2>
            <p className="text-sm text-foreground/70">Reference: {reference}</p>
          </div>

          {/* Ticket Details */}
          <div className="bg-primary/5 border border-accent/20 rounded-lg p-6 mb-8">
            <div className="text-sm mb-6 text-foreground/70">
              <p>We sent your tickets to your email. You can also save them below.</p>
            </div>
          </div>

          {/* QR Codes */}
          <div className="space-y-6 mb-8">
            {tickets.map((t) => (
              <div key={t.id} className="text-center">
                <p className="text-sm text-foreground/70 mb-2">Ticket ID: {t.id}</p>
                <div className="bg-white border-2 border-accent/20 rounded-lg p-4 inline-block">
                  <img src={t.qrCode || "/placeholder.svg"} alt="Ticket QR Code" className="w-64 h-64" />
                </div>
              </div>
            ))}
          </div>

          {/* Important Info */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-foreground mb-3">Important Information:</p>
            <ul className="text-sm text-foreground/70 space-y-2">
              <li>✓ Arrive 30 minutes early for check-in</li>
              <li>✓ Bring valid ID and formal attire</li>
              <li>✓ Keep this ticket safe - it's your entry pass</li>
              <li>✓ Check-in opens at 5:30 PM</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.print()}
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Print/Save
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5 bg-transparent py-3 flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Share
            </Button>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 border-accent/20">
          <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
          <ol className="space-y-3 text-sm text-foreground/70">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Check your email for the e-ticket confirmation</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Save or print your ticket for easy access</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Arrive early on March 15 for smooth check-in</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Present your QR code at the entrance</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
