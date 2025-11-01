"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Search, Download, Send, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TicketsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const [tickets, setTickets] = useState<any[]>([])
  const [busyEmail, setBusyEmail] = useState<string | null>(null)
  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/tickets/list")
      const data = await res.json()
      if (Array.isArray(data.tickets)) setTickets(data.tickets)
    }
    run()
  }, [])

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const name = `${t.firstName} ${t.lastName}`.trim()
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticketId?.toLowerCase().includes(searchTerm.toLowerCase())
      const typeLabel = (t.ticketType === "early-bird" ? "Early Bird" : "Regular")
      const matchesFilter = filterType === "all" || typeLabel === filterType
      return matchesSearch && matchesFilter
    })
  }, [tickets, searchTerm, filterType])

  function exportCSV() {
    const rows = [
      ["ticketId", "firstName", "lastName", "email", "phone", "ticketType", "amountPaid", "paymentStatus", "checkedIn", "createdAt"],
      ...filteredTickets.map((t) => [
        t.ticketId,
        t.firstName,
        t.lastName,
        t.email,
        t.phone,
        t.ticketType,
        t.amountPaid,
        t.paymentStatus,
        t.checkedIn,
        t.createdAt,
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tickets.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6 border-accent/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search by name, email, or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              <option value="Regular">Regular</option>
              <option value="Early Bird">Early Bird</option>
            </select>
            <Button onClick={exportCSV} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 bg-transparent gap-2"
              onClick={async () => {
                const email = prompt("Enter email to resend all tickets")
                if (!email) return
                try {
                  setBusyEmail(email)
                  const res = await fetch("/api/tickets/resend-by-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  })
                  if (res.ok) alert("E-tickets resent")
                  else alert("Failed to resend")
                } finally {
                  setBusyEmail(null)
                }
              }}
            >
              <Mail size={18} />
              <span className="hidden sm:inline">Resend by Email</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="border-accent/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-accent/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ticket Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ticket ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t, index) => (
                <tr key={index} className="border-b border-accent/10 hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{`${t.firstName} ${t.lastName}`}</td>
                  <td className="px-6 py-4 text-sm text-foreground/70">{t.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (t.ticketType === "early-bird" ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary")
                      }`}
                    >
                      {t.ticketType === "early-bird" ? "Early Bird" : "Regular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        t.checkedIn ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.checkedIn ? "Checked In" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span>{t.ticketId}</span>
                      <button
                        title="Resend e-ticket"
                        onClick={async () => {
                          const res = await fetch("/api/tickets/resend", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ticketId: t.ticketId }),
                          })
                          if (res.ok) alert("E-ticket resent")
                          else alert("Failed to resend")
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 border-accent/20">
        <p className="text-sm text-foreground/70">
          Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong> tickets
        </p>
      </Card>
    </div>
  )
}
