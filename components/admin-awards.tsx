"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Category { _id?: string; name: string; options: string[]; enabled: boolean }

export default function AdminAwards() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/awards/categories', { cache: 'no-store' })
      const data = await res.json()
      setCategories(Array.isArray(data.categories) ? data.categories : [])
    } catch (e: any) {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  function addCategory() {
    setCategories(prev => [...prev, { name: '', options: [''], enabled: false }])
  }

  function updateCategory(idx: number, patch: Partial<Category>) {
    setCategories(prev => prev.map((c, i) => i===idx ? { ...c, ...patch } : c))
  }

  function updateOption(idx: number, optIdx: number, value: string) {
    setCategories(prev => prev.map((c, i)=>{
      if (i!==idx) return c
      const options = [...c.options]
      options[optIdx] = value
      return { ...c, options }
    }))
  }

  function addOption(idx: number) {
    setCategories(prev => prev.map((c, i)=> i===idx ? { ...c, options: [...c.options, ''] } : c))
  }

  function removeOption(idx: number, optIdx: number) {
    setCategories(prev => prev.map((c, i)=>{
      if (i!==idx) return c
      const options = c.options.filter((_, j)=> j!==optIdx)
      return { ...c, options }
    }))
  }

  async function saveCategory(cat: Category) {
    setSaving(true)
    setError(null)
    const payload = { name: cat.name, options: cat.options.filter(Boolean), enabled: !!cat.enabled }
    const res = await fetch('/api/awards/categories', {
      method: cat._id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat._id ? { ...payload, id: cat._id } : payload),
    })
    if (!res.ok) {
      const d = await res.json().catch(()=>({}))
      setError(d.error || 'Failed to save')
    } else {
      await load()
    }
    setSaving(false)
  }

  async function deleteCategory(id?: string) {
    if (!id) return load()
    setSaving(true)
    await fetch(`/api/awards/categories?id=${id}`, { method: 'DELETE' })
    await load()
    setSaving(false)
  }

  return (
    <Card className="p-8 border-accent/20 space-y-6">
      <div>
        <h3 className="font-serif text-2xl font-bold text-primary mb-2">Awards & Voting</h3>
        <p className="text-sm text-foreground/60">Create categories and options. Toggle “Enabled” to show them on the homepage.</p>
      </div>

      {loading ? (
        <p className="text-foreground/70">Loading…</p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat, idx) => (
            <Card key={cat._id || idx} className="p-6 border-accent/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Category Name</label>
                  <input value={cat.name} onChange={(e)=>updateCategory(idx, { name: e.target.value })} className="w-full px-4 py-2 border border-accent/20 rounded-lg" placeholder="Best Dressed" />
                </div>
                <div className="flex items-center gap-2 mt-6 md:mt-0">
                  <input type="checkbox" checked={!!cat.enabled} onChange={(e)=>updateCategory(idx, { enabled: e.target.checked })} />
                  <span className="text-sm">Enabled</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Options</label>
                <div className="space-y-2">
                  {cat.options.map((opt, j)=>(
                    <div key={j} className="flex items-center gap-2">
                      <input value={opt} onChange={(e)=>updateOption(idx, j, e.target.value)} className="flex-1 px-4 py-2 border border-accent/20 rounded-lg" placeholder={`Nominee ${j+1}`} />
                      <Button type="button" variant="outline" onClick={()=>removeOption(idx, j)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button type="button" variant="outline" onClick={()=>addOption(idx)}>Add Option</Button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button disabled={saving} onClick={()=>saveCategory(cat)} className="bg-primary hover:bg-primary/90 text-white">{cat._id ? 'Update' : 'Create'}</Button>
                <Button disabled={saving} variant="outline" onClick={()=>deleteCategory(cat._id)}>Delete</Button>
              </div>
            </Card>
          ))}
          <Button onClick={addCategory} variant="outline">Add Category</Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Card>
  )
}
