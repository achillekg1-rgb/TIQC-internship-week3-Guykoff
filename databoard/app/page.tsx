"use client"

import { useState } from "react"
import { ProjectsTable } from "@/components/projects-table"
import { ProjectForm } from "@/components/project-form"
import { SearchBar } from "@/components/search-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dbType, setDbType] = useState<"mysql" | "mongodb">("mysql")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleOpenDialog = (id?: string) => {
    if (id) setEditingId(id)
    setIsOpen(true)
  }

  const handleCloseDialog = () => {
    setIsOpen(false)
    setEditingId(null)
  }

  const handleFormSuccess = () => {
    handleCloseDialog()
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your projects across MySQL & MongoDB</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Selector & Controls */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Database:</label>
            <div className="flex gap-2">
              {(["mysql", "mongodb"] as const).map((db) => (
                <button
                  key={db}
                  onClick={() => setDbType(db)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    dbType === db
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {db === "mysql" ? "MySQL" : "MongoDB"}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by project name..." />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <ProjectsTable
            dbType={dbType}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onEdit={handleOpenDialog}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Project" : "Add New Project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm projectId={editingId} dbType={dbType} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
