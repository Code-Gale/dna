"use client"

import TicketScanner from '@/components/ticket-scanner'

export default function KioskPage(){
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Kiosk Check-in</h1>
        <p className="text-foreground/70 mb-6">Large controls, sound/haptics, and duplicate warnings are enabled.</p>
        <TicketScanner />
      </div>
    </div>
  )
}
