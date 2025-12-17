import { Calendar, MapPin, Clock, Users } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function EventDetails() {
  const details = [
    {
      icon: Calendar,
      label: "Date",
      value: "Wednesday, December 19, 2025",
    },
    {
      icon: Clock,
      label: "Time",
      value: "Red Carpet 2:00 PM · Main Event 3:00 PM",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Victory House",
    },
    {
      icon: Users,
      label: "Dress Code",
      value: "Royal Elegance",
    },
  ]

  return (
    <section id="details" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Event Details</h2>
          <p className="text-lg text-foreground/70">Everything you need to know</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {details.map((detail, index) => {
            const Icon = detail.icon
            return (
              <Card key={index} className="p-6 border-accent/20 hover:border-accent/50 transition-colors">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-1">
                      {detail.label}
                    </p>
                    <p className="font-serif text-lg font-semibold text-primary">{detail.value}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Event Description */}
        <div className="mt-16 bg-primary/5 border border-accent/20 rounded-2xl p-8 sm:p-12">
          <h3 className="font-serif text-2xl font-bold text-primary mb-4">The Great Banquet</h3>
          <p className="text-foreground/70 leading-relaxed mb-4">
            A regal evening of honor, celebration, and fellowship. Join us as we recognize excellence and share an
            unforgettable banquet experience.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            Theme: <span className="font-semibold">The Great Banquet</span>. Dress Code: <span className="font-semibold">Royal Elegance</span>.
            Come ready for a memorable night of class and celebration.
          </p>
        </div>
      </div>
    </section>
  )
}
