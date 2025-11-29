"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2 } from "lucide-react"

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

interface ItemModalProps {
  item: Item | null
  db: "mysql" | "mongodb"
  onSave: (item: Item) => void
  onClose: () => void
  loading: boolean
}

export default function ItemModal({ item, db, onSave, onClose, loading }: ItemModalProps) {
  const [formData, setFormData] = useState<Item>({
    name: "",
    owner: "",
    status: "pending",
    tags: [],
  })

  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (item) {
      setFormData(item)
      setTagInput("")
    } else {
      setFormData({
        name: "",
        owner: "",
        status: "pending",
        tags: [],
      })
    }
  }, [item])

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.owner.trim()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{item ? "Edit Item" : "Add New Item"}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Item name"
              disabled={loading}
              className="bg-input border-border"
            />
          </div>

          {/* Owner */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Owner</Label>
            <Input
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Owner name"
              disabled={loading}
              className="bg-input border-border"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={loading}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag"
                disabled={loading}
                className="bg-input border-border flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={loading || !tagInput.trim()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Add
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      disabled={loading}
                      className="hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-border hover:bg-muted bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.owner.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {item ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
