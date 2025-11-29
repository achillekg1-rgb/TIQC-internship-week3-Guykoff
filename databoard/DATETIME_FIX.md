# MySQL DateTime Format Fix

## Problem
When creating or updating projects in MySQL, the API was sending ISO 8601 formatted timestamps (e.g., `2025-11-29T19:43:01.586Z`) directly to MySQL. MySQL's `DATETIME` type only accepts the format `YYYY-MM-DD HH:MM:SS`, causing this error:

\`\`\`
Error: Incorrect datetime value: '2025-11-29T19:43:01.586Z' for column 'createdAt'
\`\`\`

## Solution
Created a utility function `toMysqlDatetime()` in `lib/date-utils.ts` that converts ISO 8601 timestamps to MySQL-compatible format.

### Changes Made

1. **Created `lib/date-utils.ts`**: New utility module with `toMysqlDatetime()` function
   - Converts `2025-11-29T19:43:01.586Z` → `2025-11-29 19:43:01`
   - Properly handles UTC timezone conversion

2. **Updated `app/api/projects/route.ts` (POST)**:
   - Imports `toMysqlDatetime` utility
   - Converts `createdAt` and `updatedAt` before MySQL INSERT
   - MongoDB still receives ISO format (no conversion needed)

3. **Updated `app/api/projects/[id]/route.ts` (PUT)**:
   - Imports `toMysqlDatetime` utility
   - Converts `updatedAt` before MySQL UPDATE
   - MongoDB still receives ISO format (no conversion needed)

### How It Works

\`\`\`typescript
// ISO timestamp from JavaScript
const now = new Date().toISOString()  // "2025-11-29T19:43:01.586Z"

// For MongoDB (no conversion needed)
await collection.insertOne({ createdAt: now })

// For MySQL (converted to DATETIME format)
await connection.execute(
  "INSERT ... VALUES (?, ?)",
  [toMysqlDatetime(now)]  // "2025-11-29 19:43:01"
)
\`\`\`

### Why This Approach

- **API Consistency**: Both MySQL and MongoDB receive the same API response format (ISO 8601)
- **Database Compatibility**: MySQL gets its required `DATETIME` format
- **MongoDB Compatibility**: MongoDB naturally handles ISO strings
- **Clean Separation**: Date formatting logic is isolated in a utility function
- **Reversible**: Timestamps can be easily converted back to ISO if needed

### Testing

After applying the fix:
1. ✅ Creating projects in MySQL should work
2. ✅ Updating projects in MySQL should work
3. ✅ MongoDB operations unchanged
4. ✅ Search and filtering work for both databases
