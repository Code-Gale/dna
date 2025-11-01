export default function MapSection() {
  const query = encodeURIComponent("Victory House")
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`
  return (
    <section id="map" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary">Find Us</h2>
          <p className="text-foreground/70 mt-2">Venue: Victory House</p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-accent/20 shadow-sm">
          <iframe
            title="Map to Victory House"
            src={embedUrl}
            width="100%"
            height="450"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
        <div className="text-center mt-4">
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-block px-6 py-3 border rounded-lg border-primary text-primary hover:bg-primary/5">
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  )
}
