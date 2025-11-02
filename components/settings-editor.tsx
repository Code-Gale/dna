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
  contactEmail: string
  contactPhone: string
  outfitInspiration: { title: string; imageUrl?: string }[]
  faqs: { question: string; answer: string }[]
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
        contactEmail: String(data.contactEmail || 'lp38arfamily@gmail.com'),
        contactPhone: String(data.contactPhone || '+2348149603848'),
  outfitInspiration: Array.isArray(data.outfitInspiration) ? data.outfitInspiration : [],
        faqs: Array.isArray(data.faqs) ? data.faqs : [],
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
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
  outfitInspiration: settings.outfitInspiration.map(({ title, imageUrl }) => ({ title, imageUrl })),
        faqs: settings.faqs,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Contact Phone</label>
          <input
            type="text"
            value={settings.contactPhone}
            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Outfit Inspiration Editor */}
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold">Outfit Inspiration</h4>
          <p className="text-sm text-foreground/60">Cards in the “Outfit Inspiration” section. Upload an image and set a title. Section shows only when at least one card exists.</p>
        </div>
        {settings.outfitInspiration.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e)=>{
                  const list = settings.outfitInspiration.slice(); list[idx] = { ...list[idx], title: e.target.value }; setSettings({ ...settings, outfitInspiration: list })
                }}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e)=>{
                    const file = e.target.files?.[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append('file', file)
                    const res = await fetch('/api/uploads/image', { method: 'POST', body: fd })
                    const data = await res.json()
                    if (!res.ok) { alert(data?.error||'Upload failed'); return }
                    const list = settings.outfitInspiration.slice();
                    list[idx] = { ...list[idx], imageUrl: data.url }
                    setSettings({ ...settings, outfitInspiration: list })
                  }}
                  className="block w-full text-sm"
                />
              </div>
              <div className="mt-2">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="Preview" className="h-20 w-16 object-cover rounded border border-accent/20" />
                ) : (
                  <span className="text-xs text-foreground/60">No image selected</span>
                )}
              </div>
            </div>
            <div className="md:col-span-3">
              <Button type="button" variant="outline" onClick={()=>{
                const list = settings.outfitInspiration.slice(); list.splice(idx,1); setSettings({ ...settings, outfitInspiration: list })
              }}>Remove</Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={()=> setSettings({ ...settings, outfitInspiration: [...settings.outfitInspiration, { title: '' }] })}>Add Card</Button>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-semibold">FAQs</h4>
          <p className="text-sm text-foreground/60">Manage questions shown on the homepage FAQ section.</p>
        </div>
        {settings.faqs.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Question</label>
              <input
                type="text"
                value={item.question}
                onChange={(e)=>{
                  const faqs = settings.faqs.slice(); faqs[idx] = { ...faqs[idx], question: e.target.value }; setSettings({ ...settings, faqs })
                }}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Answer</label>
              <textarea
                rows={3}
                value={item.answer}
                onChange={(e)=>{
                  const faqs = settings.faqs.slice(); faqs[idx] = { ...faqs[idx], answer: e.target.value }; setSettings({ ...settings, faqs })
                }}
                className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="button" variant="outline" onClick={()=>{
                const faqs = settings.faqs.slice(); faqs.splice(idx,1); setSettings({ ...settings, faqs })
              }}>Remove</Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={()=> setSettings({ ...settings, faqs: [...settings.faqs, { question: '', answer: '' }] })}>Add FAQ</Button>
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
