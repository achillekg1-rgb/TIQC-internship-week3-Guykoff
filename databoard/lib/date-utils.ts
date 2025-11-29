/**
 * Convert ISO 8601 timestamp to MySQL DATETIME format
 * MySQL DATETIME expects: YYYY-MM-DD HH:MM:SS
 * Input: 2025-11-29T19:43:01.586Z
 * Output: 2025-11-29 19:43:01
 */
export function toMysqlDatetime(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
