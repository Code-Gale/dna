export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-48 bg-accent/20 rounded mb-3" />
        <div className="h-3 w-64 bg-accent/10 rounded" />
      </div>
    </div>
  )
}
