"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Moon, Sun } from "lucide-react"
import { toast } from "sonner"
import ItemModal from "./item-modal"
import ItemTable from "./item-table"
import PerformanceMetrics from "./performance-metrics"

interface Item {
  id?: number
  _id?: string
  name: string
  owner: string
  status: string
  tags: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface Metrics {
  readTime: number
  writeTime: number
  db: string
  timestamp: Date
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [db, setDb] = useState<"mysql" | "mongodb">("mysql")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [metrics, setMetrics] = useState<Metrics[]>([])
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isDarkMode)
    applyTheme(isDarkMode)
  }, [])

  const applyTheme = (isDarkMode: boolean) => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("darkMode", isDarkMode.toString())
  }

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    applyTheme(newDark)
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const startTime = Date.now()

      const response = await fetch(`/api/items?db=${db}&search=${encodeURIComponent(search)}&status=${statusFilter}`)
      const data = await response.json()

      setItems(data.items)
      const readTime = Date.now() - startTime

      if (data.metrics) {
        setMetrics((prev) => [
          ...prev.slice(-9),
          {
            ...data.metrics,
            readTime: data.metrics.readTime || readTime,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("[v0] Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchItems, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, db])

  const handleAdd = async (item: Item) => {
    try {
      setSaveLoading(true)
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-db": db,
        },
        body: JSON.stringify(item),
      })

      if (response.ok) {
        const newItem = await response.json()
        setMetrics((prev) => [
          ...prev.slice(-9),
          {
            writeTime: newItem.metrics?.writeTime || 0,
            readTime: 0,
            db,
            timestamp: new Date(),
          },
        ])
        toast.success(`Item "${item.name}" added successfully`)
        setShowModal(false)
        fetchItems()
      } else {
        toast.error("Failed to add item")
      }
    } catch (error) {
      console.error("[v0] Add error:", error)
      toast.error("Error adding item")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleEdit = async (item: Item) => {
    try {
      setSaveLoading(true)
      const response = await fetch("/api/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-db": db,
        },
        body: JSON.stringify(item),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setMetrics((prev) => [
          ...prev.slice(-9),
          {
            writeTime: updatedItem.metrics?.writeTime || 0,
            readTime: 0,
            db,
            timestamp: new Date(),
          },
        ])
        toast.success(`Item "${item.name}" updated successfully`)
        setEditingItem(null)
        setShowModal(false)
        fetchItems()
      } else {
        toast.error("Failed to update item")
      }
    } catch (error) {
      console.error("[v0] Edit error:", error)
      toast.error("Error updating item")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id: number | string) => {
    try {
      setSaveLoading(true)
      const response = await fetch(`/api/items?id=${id}&db=${db}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        setMetrics((prev) => [
          ...prev.slice(-9),
          {
            writeTime: result.metrics?.writeTime || 0,
            readTime: 0,
            db,
            timestamp: new Date(),
          },
        ])
        toast.success("Item deleted successfully")
        fetchItems()
      } else {
        toast.error("Failed to delete item")
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error("Error deleting item")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">DB</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Database Dashboard</h1>
          </div>

          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Controls */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Database Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Database</Label>
                <Select value={db} onValueChange={(value: any) => setDb(value)}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search by Name</Label>
                <Input
                  placeholder="Type to search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-input border-border"
                  disabled={loading || saveLoading}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Button */}
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setEditingItem(null)
                    setShowModal(true)
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={saveLoading}
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <PerformanceMetrics metrics={metrics} />

        {/* Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ItemTable
                items={items}
                db={db}
                onEdit={(item) => {
                  setEditingItem(item)
                  setShowModal(true)
                }}
                onDelete={handleDelete}
                loading={saveLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {showModal && (
          <ItemModal
            item={editingItem}
            db={db}
            onSave={editingItem ? handleEdit : handleAdd}
            onClose={() => {
              setShowModal(false)
              setEditingItem(null)
            }}
            loading={saveLoading}
          />
        )}
      </main>
    </div>
  )
}
