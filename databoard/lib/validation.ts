export function validateProject(data: any): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { valid: false, error: "Project name is required and must be a non-empty string" }
  }

  if (!data.owner || typeof data.owner !== "string" || data.owner.trim().length === 0) {
    return { valid: false, error: "Project owner is required and must be a non-empty string" }
  }

  if (data.name.length > 255) {
    return { valid: false, error: "Project name must be less than 255 characters" }
  }

  if (data.owner.length > 255) {
    return { valid: false, error: "Project owner must be less than 255 characters" }
  }

  const validStatuses = ["active", "on-hold", "completed"]
  if (!validStatuses.includes(data.status)) {
    return { valid: false, error: "Invalid status. Must be one of: active, on-hold, completed" }
  }

  if (!Array.isArray(data.tags)) {
    return { valid: false, error: "Tags must be an array" }
  }

  if (data.tags.some((tag: any) => typeof tag !== "string" || tag.trim().length === 0)) {
    return { valid: false, error: "All tags must be non-empty strings" }
  }

  return { valid: true }
}
