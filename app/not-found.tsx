export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-5xl font-bold text-primary">404</h1>
        <p className="text-foreground/70">We couldn’t find that page.</p>
        <a href="/" className="text-primary underline">Go back home</a>
      </div>
    </div>
  )
}
