"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Settings = {
  totalTickets: number
  earlyBirdPrice: number
  regularPrice: number
  earlyBirdDeadline: string
  eventDate: string
}

export default function SettingsEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/settings/get", { cache: "no-store" })
      const data = await res.json()
      setSettings({
        totalTickets: Number(data.totalTickets || 100),
        earlyBirdPrice: Number(data.earlyBirdPrice || 5000),
        regularPrice: Number(data.regularPrice || 7500),
        earlyBirdDeadline: new Date(data.earlyBirdDeadline).toISOString().slice(0, 16),
        eventDate: new Date(data.eventDate).toISOString().slice(0, 16),
      })
      setLoading(false)
    }
    run()
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    setMessage(null)
    const res = await fetch("/api/settings/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalTickets: settings.totalTickets,
        earlyBirdPrice: settings.earlyBirdPrice,
        regularPrice: settings.regularPrice,
        earlyBirdDeadline: new Date(settings.earlyBirdDeadline).toISOString(),
        eventDate: new Date(settings.eventDate).toISOString(),
      }),
    })
    const ok = res.ok
    setSaving(false)
    setMessage(ok ? "Settings saved" : "Failed to save settings")
  }

  if (loading || !settings) {
    return (
      <Card className="p-8 border-accent/20">
        <p className="text-foreground/70">Loading settings…</p>
      </Card>
    )
  }

  return (
    <Card className="p-8 border-accent/20 space-y-6">
      <div>
        <h3 className="font-serif text-2xl font-bold text-primary mb-2">Event Settings</h3>
        <p className="text-sm text-foreground/60">Update capacity, pricing, and dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Total Tickets</label>
          <input
            type="number"
            value={settings.totalTickets}
            onChange={(e) => setSettings({ ...settings, totalTickets: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Early Bird Price (₦)</label>
          <input
            type="number"
            value={settings.earlyBirdPrice}
            onChange={(e) => setSettings({ ...settings, earlyBirdPrice: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Regular Price (₦)</label>
          <input
            type="number"
            value={settings.regularPrice}
            onChange={(e) => setSettings({ ...settings, regularPrice: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Early Bird Deadline</label>
          <input
            type="datetime-local"
            value={settings.earlyBirdDeadline}
            onChange={(e) => setSettings({ ...settings, earlyBirdDeadline: e.target.value })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Event Date</label>
          <input
            type="datetime-local"
            value={settings.eventDate}
            onChange={(e) => setSettings({ ...settings, eventDate: e.target.value })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
          {saving ? "Saving…" : "Save Settings"}
        </Button>
        {message && <span className="text-sm text-foreground/60">{message}</span>}
      </div>
    </Card>
  )
}
