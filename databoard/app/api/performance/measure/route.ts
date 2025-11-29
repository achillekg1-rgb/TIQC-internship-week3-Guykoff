"use server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const db = searchParams.get("db") || "mysql"
    const query = searchParams.get("query") || "active_owner"
    const iterations = Number.parseInt(searchParams.get("iterations") || "10")

    if (db === "mysql") {
      const mysql = await import("mysql2/promise")
      const conn = await mysql.default.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root",
        database: "dashboard_db",
      })

      const timings: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = Date.now()

        if (query === "active_owner") {
          await conn.execute(
            "SELECT * FROM items WHERE status = 'active' AND owner = 'John Doe' ORDER BY createdAt DESC",
          )
        } else if (query === "name_search") {
          await conn.execute("SELECT * FROM items WHERE name LIKE ?", ["%Project 001%"])
        }

        const duration = Date.now() - start
        timings.push(duration)
      }

      await conn.end()

      const avg = timings.reduce((a, b) => a + b, 0) / timings.length
      const min = Math.min(...timings)
      const max = Math.max(...timings)

      return Response.json({
        database: "mysql",
        query,
        iterations,
        timings,
        stats: { avg, min, max },
        timestamp: new Date().toISOString(),
      })
    } else if (db === "mongodb") {
      const { MongoClient } = await import("mongodb")
      const client = new MongoClient("mongodb://localhost:27017")
      await client.connect()

      const database = client.db("dashboard_db")
      const collection = database.collection("items")

      const timings: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = Date.now()

        if (query === "active_owner") {
          await collection.find({ status: "active", owner: "John Doe" }).sort({ createdAt: -1 }).toArray()
        } else if (query === "name_search") {
          await collection.find({ name: { $regex: "Project 001", $options: "i" } }).toArray()
        }

        const duration = Date.now() - start
        timings.push(duration)
      }

      await client.close()

      const avg = timings.reduce((a, b) => a + b, 0) / timings.length
      const min = Math.min(...timings)
      const max = Math.max(...timings)

      return Response.json({
        database: "mongodb",
        query,
        iterations,
        timings,
        stats: { avg, min, max },
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ error: "Invalid database" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Measurement error:", error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
