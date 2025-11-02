"use client"

export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Subtle noise texture overlay (very cheap) */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAwJyBoZWlnaHQ9JzQwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZmlsdGVyIGlkPSduJyB4PScwJyB5PScwJz48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9JzAuOScgc3RpdGNoVGlsZXM9JzAnLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9JzAuOCcvPjwvc3ZnPg==')" }} />
  {/* Large gradient blobs (GPU-accelerated transforms only) */}
      <div className="absolute -top-32 -left-24 w-[60vw] h-[60vw] rounded-full opacity-25 blur-3xl bg-[radial-gradient(circle_at_center,_rgba(107,63,160,0.6),_transparent_60%)] animate-blob" />
      <div className="absolute -bottom-24 -right-24 w-[55vw] h-[55vw] rounded-full opacity-20 blur-3xl bg-[radial-gradient(circle_at_center,_rgba(255,200,141,0.5),_transparent_60%)] animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 -right-32 w-[45vw] h-[45vw] rounded-full opacity-15 blur-3xl bg-[radial-gradient(circle_at_center,_rgba(52,120,246,0.4),_transparent_60%)] animate-blob animation-delay-4000" />

      {/* Soft moving lines */}
      <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pan" />
      <div className="absolute inset-x-0 top-2/3 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-pan-slow" />

      {/* Floating bokeh dots (a handful of DOM nodes) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={`absolute block w-2 h-2 rounded-full bg-primary/30 blur-[1px] animate-float`}
          style={{
            left: `${(i * 73) % 100}%`,
            top: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 7) * 0.6}s`,
            animationDuration: `${8 + (i % 5)}s`,
          }}
        />
      ))}

      {/* Gentle twinkle stars */}
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={`tw-${i}`}
          className="absolute block w-1 h-1 rounded-full bg-white/60 animate-twinkle"
          style={{ left: `${(i * 59) % 100}%`, top: `${(i * 41) % 100}%`, animationDelay: `${i * 0.8}s` }}
        />
      ))}

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -10px) scale(1.05); }
        }
        .animate-blob { animation: blob 18s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes pan {
          0% { transform: translateX(-30%); opacity: .2; }
          50% { opacity: .35; }
          100% { transform: translateX(30%); opacity: .2; }
        }
        .animate-pan { animation: pan 12s linear infinite; }
        .animate-pan-slow { animation: pan 20s linear infinite; }

        @keyframes float {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: .5; }
          50% { transform: translateY(-12px) translateX(6px) scale(1.04); opacity: .7; }
          100% { transform: translateY(0) translateX(0) scale(1); opacity: .5; }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }

        @keyframes twinkle {
          0%, 100% { opacity: .2; transform: scale(1); }
          50% { opacity: .7; transform: scale(1.4); }
        }
        .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-pan,
          .animate-pan-slow,
          .animate-float,
          .animate-twinkle { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
