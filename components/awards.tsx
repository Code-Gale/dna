"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Category = { _id: string; name: string; options: string[] }

export default function Awards() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/awards/public/categories', { cache: 'no-store' })
        const data = await res.json()
        setCategories(Array.isArray(data.categories) ? data.categories : [])
      } catch {
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) return null
  if (!categories.length) return null // show nothing unless configured in admin

  async function submitVote(e: React.FormEvent<HTMLFormElement>, categoryId: string) {
    e.preventDefault()
    setMessage(null)
    const fd = new FormData(e.currentTarget)
    const option = String(fd.get('option') || '')
    const email = String(fd.get('email') || '')
    if (!option || !email) { setMessage('Please select an option and enter your email.'); return }
    const res = await fetch('/api/awards/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId, option, email }) })
    const ok = res.ok
    const data = await res.json().catch(()=>({}))
    setMessage(ok ? 'Thanks! Your vote has been recorded.' : (data.error || 'Failed to submit vote'))
  }

  return (
    <section id="awards" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">People’s Choice Awards</h2>
          <p className="text-lg text-foreground/70">Cast your votes for the categories below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Card key={cat._id} className="p-6 border-accent/20">
              <h3 className="text-xl font-semibold text-primary mb-4">{cat.name}</h3>
              <form onSubmit={(e)=>submitVote(e, cat._id)} className="space-y-4">
                <div className="space-y-3">
                  {cat.options.map((opt) => (
                    <label key={opt} className="flex items-center gap-3">
                      <input type="radio" name="option" value={opt} className="accent-primary" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Your Email</label>
                  <input type="email" name="email" required className="w-full px-4 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="you@example.com" />
                </div>
                <div className="flex items-center gap-3">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Submit Vote</Button>
                  {message && <span className="text-sm text-foreground/60">{message}</span>}
                </div>
              </form>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
