export function DashboardHeader() {
  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-3xl font-bold text-foreground">Projects Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage projects across MySQL and MongoDB</p>
      </div>
    </header>
  )
}
