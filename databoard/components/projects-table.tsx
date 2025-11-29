"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  _id?: string
  name: string
  owner: string
  status: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface ProjectsTableProps {
  dbType: "mysql" | "mongodb"
  searchTerm: string
  statusFilter: string
  onEdit: (id: string) => void
  refreshTrigger: number
}

export function ProjectsTable({ dbType, searchTerm, statusFilter, onEdit, refreshTrigger }: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [dbType, refreshTrigger, searchTerm, statusFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : "",
      })
      const res = await fetch(`/api/projects?db=${dbType}&${params}`)
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load projects",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      setDeleting(id)
      const res = await fetch(`/api/projects/${id}?db=${dbType}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")

      setProjects(projects.filter((p) => (p._id || p.id) !== id))
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project",
      })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading projects...</div>
  }

  if (projects.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No projects found. Create one to get started.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-foreground">Name</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Owner</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Tags</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Created</th>
            <th className="px-6 py-3 text-right font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.map((project) => (
            <tr key={project._id || project.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-3 font-medium text-foreground">{project.name}</td>
              <td className="px-6 py-3 text-foreground">{project.owner}</td>
              <td className="px-6 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      : project.status === "on-hold"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                  }`}
                >
                  {project.status}
                </span>
              </td>
              <td className="px-6 py-3">
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 2 && (
                    <span className="px-2 py-0.5 text-xs text-muted-foreground">+{project.tags.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(project._id || project.id)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project._id || project.id)}
                    disabled={deleting === (project._id || project.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
