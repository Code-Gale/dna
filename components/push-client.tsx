"use client"

import { useEffect, useState } from 'react'

export default function PushClient() {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
  }, [])

  async function subscribe() {
    try {
      if (!('serviceWorker' in navigator)) return
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error('Missing VAPID public key')
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) })
      await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
      alert('Notifications enabled')
    } catch (e: any) {
      alert(e?.message || 'Subscription failed')
    }
  }

  // Hide the prompt by default; only show if explicitly enabled via env flag
  const showPrompt = supported && (process.env.NEXT_PUBLIC_SHOW_PUSH_PROMPT === 'true')
  if (!showPrompt) return null
  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <button onClick={subscribe} className="px-4 py-2 rounded bg-primary text-white">Enable Notifications</button>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
