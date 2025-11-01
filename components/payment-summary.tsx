import { Card } from "@/components/ui/card"

interface PaymentSummaryProps {
  formData: {
    ticketType: string
    quantity: number
  }
  totalPrice: number
  ticketPrices: Record<string, number>
}

export default function PaymentSummary({ formData, totalPrice, ticketPrices }: PaymentSummaryProps) {
  const unitPrice = ticketPrices[formData.ticketType]
  const finalTotal = totalPrice

  return (
    <Card className="p-6 border-accent/20 sticky top-24">
      <h3 className="font-serif text-xl font-bold text-primary mb-6">Order Summary</h3>

      <div className="space-y-4 mb-6 pb-6 border-b border-accent/20">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/70">
            {formData.quantity}x {formData.ticketType.charAt(0).toUpperCase() + formData.ticketType.slice(1)} Ticket
            {formData.quantity > 1 ? "s" : ""}
          </span>
          <span className="font-semibold text-foreground">₦{unitPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground/70">Subtotal</span>
          <span className="font-semibold text-foreground">₦{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="font-semibold text-foreground">Total</span>
        <span className="font-serif text-2xl font-bold text-primary">₦{finalTotal.toLocaleString()}</span>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-xs text-foreground/70 space-y-2">
        <p>
          <strong>What's Included:</strong>
        </p>
        <ul className="space-y-1 ml-2">
          <li>✓ 3-course gourmet dinner</li>
          <li>✓ Beverages & entertainment</li>
          <li>✓ Awards ceremony access</li>
          <li>✓ E-ticket with QR code</li>
        </ul>
      </div>
    </Card>
  )
}
