"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminStorage(){
  const [health, setHealth] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  async function refresh(){
    setLoading(true)
    setError(null)
    try {
      const h = await fetch('/api/storage/health', { cache: 'no-store' }).then(r=>r.json())
      setHealth(h)
      const list = await fetch('/api/gallery/list', { cache: 'no-store' }).then(r=>r.json())
      setItems(list.items||[])
    } catch(e:any){
      setError(e?.message||'Failed to load storage info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ refresh() }, [])

  return (
    <div className="space-y-8">
      <Card className="p-6 border-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">MinIO Storage</h3>
            <p className="text-sm text-foreground/60">Bucket: {health?.bucket || '—'} {health?.exists? '(exists)': ''}</p>
          </div>
          <Button onClick={refresh} disabled={loading}>{loading? 'Refreshing…':'Refresh'}</Button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>

      <Card className="p-6 border-accent/20">
        <h3 className="text-lg font-semibold mb-4">Recent Files</h3>
        {items.length===0 ? (
          <p className="text-sm text-foreground/60">No files found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((it)=> (
              <a key={it.key} href={it.url} target="_blank" rel="noreferrer" className="block group">
                <img src={it.url} alt="Object" className="aspect-square object-cover rounded-lg border border-accent/20 group-hover:opacity-90" />
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
