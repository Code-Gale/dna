"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [stats, setStats] = useState<{ total: number; sold: number; remaining: number } | null>(null)
  const [eventDate, setEventDate] = useState<string | null>(null)

  useEffect(() => {
    const calculateTimeLeft = (eventDateStr?: string | null) => {
      const dateToUse = eventDateStr || eventDate
      const eventDateTimestamp = dateToUse ? new Date(dateToUse).getTime() : new Date("2025-12-19T18:00:00+01:00").getTime()
      const now = new Date().getTime()
      const difference = eventDateTimestamp - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    let countdownTimer: any
    let refreshTimer: any
    let mounted = true
    
    const init = async () => {
      try {
        const res = await fetch(`/api/tickets/stats?t=${Date.now()}`, { 
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        if (!mounted) return
        const data = await res.json()
        setStats({ total: data.total, sold: data.sold, remaining: data.remaining })
        if (data.eventDate) {
          setEventDate(data.eventDate)
          calculateTimeLeft(data.eventDate)
        }
      } catch {}
    }
    
    init()
    
    // Update countdown every second
    countdownTimer = setInterval(() => {
      if (mounted) {
        calculateTimeLeft()
      }
    }, 1000)
    
    // Re-fetch event date from server every 30 seconds to catch admin changes
    refreshTimer = setInterval(() => {
      if (mounted) {
        fetch(`/api/tickets/stats?t=${Date.now()}`, { 
          cache: "no-store",
          headers: { 'Cache-Control': 'no-cache' }
        })
          .then(res => res.json())
          .then(data => {
            if (mounted && data.eventDate) {
              setEventDate(data.eventDate)
              calculateTimeLeft(data.eventDate)
            }
          })
          .catch(() => {})
      }
    }, 30000)
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        init()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      mounted = false
      clearInterval(countdownTimer)
      clearInterval(refreshTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [eventDate])

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-white to-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-primary leading-tight">
              Dinner N' Awards Night
            </h1>
            <p className="font-serif text-2xl sm:text-3xl text-primary/80">The Great Banquet</p>
            <p className="text-sm sm:text-base text-foreground/60">Venue: Victory House · Dress Code: Royal Elegance</p>
          </motion.div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Celebrate excellence and achievement at our prestigious provincial awards ceremony. An evening of elegance,
            recognition, and unforgettable memories.
          </p>

          {/* Countdown Timer */}
          <motion.div
            className="bg-primary/5 border border-accent/30 rounded-2xl p-8 my-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-semibold text-primary/60 mb-4 uppercase tracking-wider">Event Starts In</p>
            <div className="grid grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item) => (
                <motion.div key={item.label} className="text-center" whileHover={{ scale: 1.03 }}>
                  <div className="bg-white border-2 border-accent rounded-lg p-3 sm:p-4 mb-2">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                      {String(item.value).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground/60">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={() => router.push("/tickets")} className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">Get Tickets Now</Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
