import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function Analytics() {
  const salesData = [
    { date: "Mar 1", sales: 12, revenue: 1800 },
    { date: "Mar 2", sales: 19, revenue: 2850 },
    { date: "Mar 3", sales: 15, revenue: 2250 },
    { date: "Mar 4", sales: 25, revenue: 3750 },
    { date: "Mar 5", sales: 22, revenue: 3300 },
    { date: "Mar 6", sales: 18, revenue: 2700 },
    { date: "Mar 7", sales: 28, revenue: 4200 },
  ]

  const ticketTypeData = [
    { name: "Standard", value: 35, color: "#6B3FA0" },
    { name: "VIP", value: 40, color: "#D4AF37" },
    { name: "Student", value: 12, color: "#8B7355" },
  ]

  return (
    <div className="space-y-8">
      {/* Sales Chart */}
      <Card className="p-6 border-accent/20">
        <h3 className="font-semibold text-foreground mb-6">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#6B3FA0" strokeWidth={2} name="Tickets Sold" />
            <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Ticket Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-accent/20">
          <h3 className="font-semibold text-foreground mb-6">Ticket Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-accent/20">
          <h3 className="font-semibold text-foreground mb-6">Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "Total Revenue", value: "$13,050", change: "+15% vs last week" },
              { label: "Avg Ticket Price", value: "$150", change: "Stable" },
              { label: "Conversion Rate", value: "8.7%", change: "+2.1% vs last week" },
              { label: "Refund Rate", value: "2.3%", change: "-0.5% vs last week" },
            ].map((metric, index) => (
              <div
                key={index}
                className="flex justify-between items-start py-3 border-b border-accent/10 last:border-0"
              >
                <div>
                  <p className="text-sm text-foreground/60">{metric.label}</p>
                  <p className="font-semibold text-foreground">{metric.value}</p>
                </div>
                <p className="text-xs text-foreground/50">{metric.change}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hourly Check-ins */}
      <Card className="p-6 border-accent/20">
        <h3 className="font-semibold text-foreground mb-6">Hourly Check-ins (Event Day)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { time: "5:00 PM", checkins: 0 },
              { time: "5:30 PM", checkins: 5 },
              { time: "6:00 PM", checkins: 18 },
              { time: "6:30 PM", checkins: 12 },
              { time: "7:00 PM", checkins: 8 },
              { time: "7:30 PM", checkins: 3 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="checkins" fill="#6B3FA0" name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
