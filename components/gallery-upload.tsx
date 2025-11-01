"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function GalleryUpload() {
  const [items, setItems] = useState<{ key: string; url: string }[]>([])
  const [uploading, setUploading] = useState(false)

  async function refresh() {
    const res = await fetch('/api/gallery/list', { cache: 'no-store' })
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { refresh() }, [])

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/gallery/upload', { method: 'POST', body: fd })
    setUploading(false)
    if (res.ok) refresh()
  }

  return (
    <section id="uploads" className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Community Gallery</h3>
          <div>
            <input id="galleryFile" type="file" accept="image/*" className="hidden" onChange={onChange} />
            <Button onClick={() => document.getElementById('galleryFile')?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <a key={it.key} href={it.url} target="_blank" rel="noreferrer" className="block group">
              <img src={it.url} alt="Gallery item" className="aspect-square object-cover rounded-lg border border-accent/20 group-hover:opacity-90" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
