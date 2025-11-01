import { Card } from "@/components/ui/card"

export default function Speakers() {
  const speakers = [
    {
      name: "Dr. Sarah Mitchell",
      title: "Provincial Education Director",
      bio: "Leading education initiatives across the province for over 15 years.",
      image: "/professional-woman-headshot.png",
    },
    {
      name: "James Chen",
      title: "Youth Leadership Expert",
      bio: "Inspiring young leaders to achieve their full potential.",
      image: "/professional-man-headshot.png",
    },
    {
      name: "Emma Rodriguez",
      title: "Award-Winning Journalist",
      bio: "Telling stories of achievement and excellence in our community.",
      image: "/professional-woman-headshot.png",
    },
    {
      name: "Michael Thompson",
      title: "Business Leader & Mentor",
      bio: "Guiding the next generation of entrepreneurs and innovators.",
      image: "/professional-man-headshot.png",
    },
  ]

  return (
    <section id="speakers" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">Featured Speakers</h2>
          <p className="text-lg text-foreground/70">Inspiring voices from across the province</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {speakers.map((speaker, index) => (
            <Card
              key={index}
              className="overflow-hidden border-accent/20 hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-accent/10">
                <img
                  src={speaker.image || "/placeholder.svg"}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-bold text-primary mb-1">{speaker.name}</h3>
                <p className="text-sm font-semibold text-accent mb-3">{speaker.title}</p>
                <p className="text-sm text-foreground/70">{speaker.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
