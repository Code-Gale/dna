"use client"
import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

type OutfitCard = { title: string; imageUrl?: string }

export default function Gallery() {
  const [cards, setCards] = useState<OutfitCard[] | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/settings/get', { cache: 'no-store' })
        if (!res.ok) return setCards([])
        const data = await res.json()
        const items: OutfitCard[] = Array.isArray(data.outfitInspiration)
          ? data.outfitInspiration.filter((x:any)=> typeof x.title==='string' && x.title.trim().length>0)
          : []
        if (!mounted) return
        setCards(items)
      } catch {
        setCards([])
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Outfit Inspiration: Royalty</h2>
          <p className="text-lg text-foreground/70">Think luxe fabrics, deep jewel tones, gold accents, and elegant silhouettes.</p>
        </div>
        {!cards || cards.length === 0 ? (
          <div className="text-center text-foreground/60">Outfit inspiration coming soon.</div>
        ) : (
          <Carousel className="relative">
            <CarouselContent className="-ml-2 md:-ml-4">
              {cards.map((card, i) => (
                <CarouselItem key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4">
                  <div className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-accent/20 bg-gradient-to-br from-primary/10 to-accent/10">
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-sm font-semibold text-white drop-shadow">{card.title}</div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}
      </div>
    </section>
  )
}
