"use client"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl font-bold text-primary">Something went wrong</h1>
        <p className="text-foreground/70">{error.message || "Please try again."}</p>
        <button onClick={reset} className="text-primary underline">Try again</button>
      </div>
    </div>
  )
}
