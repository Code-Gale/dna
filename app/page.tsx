"use client"

import { useState } from "react"
import Hero from "@/components/hero"
import EventDetails from "@/components/event-details"
import Gallery from "@/components/gallery"
import MapSection from "@/components/map-section"
import GalleryUpload from "@/components/gallery-upload"
// import Speakers from "@/components/speakers"
import FAQ from "@/components/faq"
import Contact from "@/components/contact"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Awards from "@/components/awards"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <EventDetails />
  <Awards />
      <Gallery />
  <GalleryUpload />
  <MapSection />
  {/* <Speakers /> */}
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}
