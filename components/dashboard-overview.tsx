import { Card } from "@/components/ui/card"
import { Users, Ticket, TrendingUp, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function DashboardOverview() {
  const [sold, setSold] = useState(0)
  const [total, setTotal] = useState(100)
  const [checkedIn, setCheckedIn] = useState(0)
  const [revenue, setRevenue] = useState(0)

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
          {[
            { name: "Sarah Johnson", type: "VIP", time: "2 minutes ago" },
            { name: "Michael Chen", type: "Standard", time: "15 minutes ago" },
            { name: "Emma Rodriguez", type: "VIP", time: "1 hour ago" },
            { name: "James Thompson", type: "Student", time: "2 hours ago" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-accent/10 last:border-0">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-foreground/60">{item.type} Ticket</p>
              </div>
              <p className="text-xs text-foreground/50">{item.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
