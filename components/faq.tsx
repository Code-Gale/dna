"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is the dress code?",
      answer:
        "The dress code is black tie or formal attire. We encourage guests to dress elegantly for this prestigious event.",
    },
    {
      question: "Can I bring a guest?",
      answer:
        "Yes, you can bring one guest. Please indicate this when purchasing your ticket. Additional guests may be available depending on availability.",
    },
    {
      question: "What time should I arrive?",
      answer:
        "Doors open at 5:30 PM. We recommend arriving by 6:00 PM to enjoy cocktails and networking before the ceremony begins at 6:30 PM.",
    },
    {
      question: "Is there parking available?",
      answer:
        "Yes, complimentary valet parking is available for all guests. The venue also has a large parking lot with accessible spaces.",
    },
    {
      question: "What is included in the ticket?",
      answer:
        "Your ticket includes a three-course gourmet dinner, beverages, entertainment, and access to the awards ceremony.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "Refunds are available up to 7 days before the event. After that date, tickets are non-refundable but may be transferred to another person.",
    },
  ]

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
