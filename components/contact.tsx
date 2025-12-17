import { Mail, Phone, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Contact() {
  const [email, setEmail] = useState("lp38arfamily@gmail.com")
  const [phone, setPhone] = useState("+2348149603848")

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await fetch(`/api/settings/get?t=${Date.now()}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        if (!mounted) return
        const data = await res.json()
        if (data.contactEmail) setEmail(String(data.contactEmail))
        if (data.contactPhone) setPhone(String(data.contactPhone))
      } catch {}
    }
    run()
    
    // Refresh contact info every 60 seconds to catch admin changes
    const interval = setInterval(run, 60000)
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        run()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Get In Touch</h2>
          <p className="text-lg text-foreground/70">Have questions? We're here to help</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Mail,
              label: "Email",
              value: email,
              href: `mailto:${email}`,
            },
            {
              icon: Phone,
              label: "Phone",
              value: phone,
              href: `tel:${phone}`,
            },
            {
              icon: MapPin,
              label: "Address",
              value: "20, Alhaja Adetutu Street, via Baale Bus Stop, Egbed, Lagos.",
              href: "#",
            },
          ].map((contact, index) => {
            const Icon = contact.icon
            return (
              <Card key={index} className="p-6 border-accent/20 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{contact.label}</h3>
                <a href={contact.href} className="text-primary hover:text-primary/80 transition-colors">
                  {contact.value}
                </a>
              </Card>
            )
          })}
        </div>

        {/* Contact Form */}
        <Card className="p-8 border-accent/20 max-w-2xl mx-auto">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Your message here..."
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3">Send Message</Button>
          </form>
        </Card>
      </div>
    </section>
  )
}
