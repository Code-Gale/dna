"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/settings/get', { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs)
        } else {
          setFaqs([
            { question: 'What is the dress code?', answer: 'Formal attire. Think elegant, think Royalty.' },
            { question: 'What time should I arrive?', answer: 'Doors open at 5:30 PM. Check-in starts at 5:30 PM.' },
          ])
        }
      } catch {
        setFaqs([
          { question: 'What is the dress code?', answer: 'Formal attire. Think elegant, think Royalty.' },
          { question: 'What time should I arrive?', answer: 'Doors open at 5:30 PM. Check-in starts at 5:30 PM.' },
        ])
      }
    }
    run()
  }, [])

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-foreground/70">Find answers to common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="border-accent/20 overflow-hidden cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="p-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground pr-4">{faq.question}</h3>
                <ChevronDown
                  size={20}
                  className={`text-primary flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openIndex === index && (
                <div className="px-6 pb-6 text-foreground/70 border-t border-accent/20 pt-4">{faq.answer}</div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
