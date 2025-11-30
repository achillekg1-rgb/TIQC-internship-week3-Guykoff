"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface ProjectFormProps {
  projectId: string | null
  dbType: "mysql" | "mongodb"
  onSuccess: () => void
}

export function ProjectForm({ projectId, dbType, onSuccess }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    status: "active",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (projectId) {
      fetchProject()
    } else {
      setFormData({
        name: "",
        owner: "",
        status: "active",
        tags: [],
      })
      setTagInput("")
    }
  }, [projectId, dbType])

  const fetchProject = async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const url = `/api/projects/${projectId}?db=${dbType}`
      console.log("[v0] Fetching from:", url)
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error("Failed to fetch project")
      }
      const data = await res.json()
      console.log("[v0] Received data:", data)
      console.log("[v0] Tags from API:", data.tags)
      const tagsArray = Array.isArray(data.tags) ? data.tags : []
      console.log("[v0] Tags array after processing:", tagsArray)
      setFormData({
        name: data.name || "",
        owner: data.owner || "",
        status: data.status || "active",
        tags: tagsArray,
      })
    } catch (error) {
      console.log("[v0] Fetch error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.owner) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and Owner are required",
      })
      return
    }

    try {
      setLoading(true)
      const method = projectId ? "PUT" : "POST"
      const url = projectId ? `/api/projects/${projectId}?db=${dbType}` : `/api/projects?db=${dbType}`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save project")
      }

      toast({
        title: "Success",
        description: `Project ${projectId ? "updated" : "created"} successfully`,
      })
      onSuccess()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save project",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Project Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Website Redesign"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Owner *</label>
        <Input
          value={formData.owner}
          onChange={(e) => setFormData((prev) => ({ ...prev, owner: e.target.value }))}
          placeholder="e.g., John Doe"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
          disabled={loading}
        >
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag and press Enter"
            disabled={loading}
          />
          <Button type="button" variant="outline" onClick={addTag} disabled={loading}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <div
              key={tag}
              className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} disabled={loading} className="hover:text-primary/70">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : projectId ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  )
}