"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminNotifications(){
  const [title, setTitle] = useState('Reminder: Event Starts Soon')
  const [body, setBody] = useState("We're excited to see you at Dinner N' Awards Night!")
  const [resp, setResp] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [sendingRem, setSendingRem] = useState(false)

  async function sendPush(){
    setSending(true)
    setResp('')
    try {
      const r = await fetch('/api/push/broadcast', { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ title, body }) })
      const d = await r.json()
      setResp(r.ok? `Push sent: ${d.sent} success, ${d.failed} failed` : d.error || 'Failed')
    } catch(e:any){ setResp(e?.message || 'Failed') } finally { setSending(false) }
  }

  async function sendReminders(){
    setSendingRem(true)
    setResp('')
    try {
      const r = await fetch('/api/reminders/send', { method:'POST' })
      const d = await r.json()
      setResp(r.ok? `Reminders sent: ${d.sent}` : d.error || 'Failed')
    } catch(e:any){ setResp(e?.message || 'Failed') } finally { setSendingRem(false) }
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 border-accent/20">
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="grid gap-3 max-w-xl">
          <input className="border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
          <textarea className="border rounded px-3 py-2" value={body} onChange={e=>setBody(e.target.value)} placeholder="Body" />
          <Button onClick={sendPush} disabled={sending}>{sending? 'Sending…':'Send Test Push'}</Button>
        </div>
      </Card>

      <Card className="p-6 border-accent/20">
        <h3 className="text-lg font-semibold mb-4">Email Reminders</h3>
        <p className="text-sm text-foreground/60 mb-3">Sends reminder to attendees who haven't received a reminder yet.</p>
        <Button onClick={sendReminders} disabled={sendingRem}>{sendingRem? 'Sending…':'Send Reminder Emails'}</Button>
      </Card>

      {resp && <p className="text-sm mt-2">{resp}</p>}
    </div>
  )
}
