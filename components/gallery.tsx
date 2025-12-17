"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type OutfitCard = { title: string; imageUrl?: string }

// Collapsible + expandable outfit gallery, inspired by the provided mock: a hero image
// and a four-up thumbnail strip where the last tile reads "See all N photos". Clicking
// expands a full grid; clicking again collapses. A lightbox opens when an image is clicked.
export default function Gallery() {
  const [cards, setCards] = useState<OutfitCard[] | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const expandedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await fetch(`/api/settings/get?t=${Date.now()}`, { 
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        if (!mounted) return
        if (!res.ok) {
          setCards([])
          return
        }
        const data = await res.json()
        const items: OutfitCard[] = Array.isArray(data.outfitInspiration)
          ? data.outfitInspiration.filter((x: any) => typeof x.title === "string" && x.title.trim().length > 0)
          : []
        if (!mounted) return
        setCards(items)
      } catch {
        if (mounted) {
          setCards([])
        }
      }
    }
    run()
    
    // Refresh gallery every 60 seconds to catch admin changes
    const interval = setInterval(run, 60000)
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        run()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const images = useMemo(() => (cards || []).map((c) => ({ src: c.imageUrl || "", alt: c.title || "" })), [cards])

  const total = images.length

  const openLightbox = (i: number) => {
    if (i >= 0 && i < total) setLightboxIndex(i)
  }
  const closeLightbox = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((i) => (i == null ? i : (i + total - 1) % total))
  const next = () => setLightboxIndex((i) => (i == null ? i : (i + 1) % total))

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
          <div className="space-y-6">
            {/* Collapsed header UI */}
            <div className="space-y-4">
              {/* Hero image (smaller, constrained width + height) */}
              <div className="max-w-4xl mx-auto">
                <div className="relative w-full overflow-hidden rounded-xl border border-accent/20 bg-muted h-[clamp(200px,36vh,420px)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {images[0]?.src ? (
                  <img
                    src={images[0].src}
                    alt={images[0].alt}
                      className="absolute inset-0 h-full w-full object-cover"
                    onClick={() => openLightbox(0)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                </div>
              </div>

              {/* Thumbnail strip - 4 tiles */}
              <div className="grid grid-cols-4 gap-2 max-w-4xl mx-auto">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const img = images[idx + 1]
                  const isLast = idx === 3
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        if (isLast) {
                          setExpanded(true)
                          // Smooth scroll to the expanded grid
                          requestAnimationFrame(() => {
                            expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                          })
                        } else {
                          openLightbox(idx + 1)
                        }
                      }}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-accent/20 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {img?.src ? (
                        <img src={img.src} alt={img.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      {isLast ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <ImageIcon className="h-4 w-4" />
                            <span>See All {total} Photos</span>
                          </div>
                        </div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Expanded grid */}
            {/* Animated expand/collapse container */}
            <div
              ref={expandedRef}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 max-w-5xl mx-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">All Photos</h3>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExpanded(false)
                        // Scroll back to the gallery header smoothly
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      Collapse
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => openLightbox(i)}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-accent/20 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img.src ? (
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-4xl p-0" showCloseButton>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-black">
            {lightboxIndex != null && images[lightboxIndex] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[lightboxIndex].src} alt={images[lightboxIndex].alt} className="absolute inset-0 h-full w-full object-contain bg-black" />
            ) : null}
            {total > 1 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={prev}
                  className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
