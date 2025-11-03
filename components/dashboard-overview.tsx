import { Card } from "@/components/ui/card"
import { Users, Ticket, TrendingUp, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

export default function DashboardOverview() {
  const [sold, setSold] = useState(0)
  const [total, setTotal] = useState(100)
  const [checkedIn, setCheckedIn] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [recentTickets, setRecentTickets] = useState<any[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          fetch("/api/tickets/stats"),
          fetch("/api/tickets/list"),
        ])
        const stats = await statsRes.json()
        const list = await listRes.json()
        setSold(stats.sold || 0)
        setTotal(stats.total || 100)
        const tickets = Array.isArray(list.tickets) ? list.tickets : []
        setCheckedIn(tickets.filter((t: any) => t.checkedIn).length)
        setRevenue(tickets.reduce((sum: number, t: any) => sum + (t.paymentStatus === "success" ? (t.amountPaid || 0) : 0), 0))
        // Keep most recent successful payments for display
        const recent = tickets
          .filter((t: any) => t.paymentStatus === "success")
          .slice(0, 8)
        setRecentTickets(recent)
      } catch {}
    }
    run()
  }, [])

  const stats = [
    { icon: Ticket, label: "Total Tickets Sold", value: String(sold), change: `${Math.round((sold / total) * 100) || 0}% of ${total}`, color: "text-primary" },
    { icon: Users, label: "Registered Attendees", value: String(sold), change: `${total - sold} remaining`, color: "text-accent" },
    { icon: CheckCircle, label: "Checked In", value: String(checkedIn), change: `${sold ? Math.round((checkedIn / sold) * 100) : 0}% of sold`, color: "text-green-600" },
    { icon: TrendingUp, label: "Revenue", value: `₦${revenue.toLocaleString()}`, change: "", color: "text-blue-600" },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6 border-accent/20">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
              <p className="font-serif text-3xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-xs text-foreground/50">{stat.change}</p>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-accent/20">
        <h3 className="font-semibold text-foreground mb-4">Recent Ticket Sales</h3>
        <div className="space-y-4">
          {recentTickets.length === 0 && (
            <p className="text-sm text-foreground/60">No recent sales yet.</p>
          )}
          {recentTickets.map((t: any, index: number) => {
            const fullName = `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.email
            const typeLabel = (t.ticketType === "early-bird" ? "Early Bird" : t.ticketType === "regular" ? "Regular" : String(t.ticketType || "Ticket")).toString()
            const timeAgo = t.createdAt ? formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }) : ""
            return (
              <div key={t.ticketId ?? index} className="flex items-center justify-between py-3 border-b border-accent/10 last:border-0">
                <div>
                  <p className="font-medium text-foreground">{fullName}</p>
                  <p className="text-xs text-foreground/60">{typeLabel} Ticket</p>
                </div>
                <p className="text-xs text-foreground/50">{timeAgo}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
