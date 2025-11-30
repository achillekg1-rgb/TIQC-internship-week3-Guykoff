/**
 * Convert ISO 8601 timestamp to MySQL DATETIME format (local timezone)
 * MySQL DATETIME expects: YYYY-MM-DD HH:MM:SS
 * Input: 2025-11-29T19:43:01.586Z
 * Output: 2025-11-29 19:43:01 (converted to user's local timezone)
 */
export function toMysqlDatetime(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
