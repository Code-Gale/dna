"use client"
import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    const enable = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_PWA === 'true'
    if ('serviceWorker' in navigator && enable) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{})
    }
  }, [])
  return null
}
