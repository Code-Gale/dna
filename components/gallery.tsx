"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Gallery() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const images = [
    {
      src: "/elegant-banquet-hall-with-purple-and-gold-decorati.jpg",
      alt: "Elegant banquet hall",
    },
    {
      src: "/formal-dinner-table-setting-with-gold-accents.jpg",
      alt: "Formal dinner setting",
    },
    {
      src: "/awards-ceremony-stage-with-purple-lighting.jpg",
      alt: "Awards ceremony stage",
    },
    {
      src: "/guests-in-formal-attire-at-elegant-event.jpg",
      alt: "Event guests",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Event Gallery</h2>
          <p className="text-lg text-foreground/70">Glimpses from previous ceremonies</p>
        </div>

        {/* Image Carousel */}
        <div className="relative rounded-2xl overflow-hidden bg-white border border-accent/20">
          <div className="relative h-96 sm:h-[500px] overflow-hidden">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-primary" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
