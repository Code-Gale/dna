export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/5 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-10 w-64 bg-accent/20 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-accent/10 rounded" />
            <div className="h-64 bg-accent/10 rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-accent/10 rounded" />
            <div className="h-48 bg-accent/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
