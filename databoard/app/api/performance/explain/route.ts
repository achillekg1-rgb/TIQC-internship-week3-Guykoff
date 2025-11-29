"use server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const db = searchParams.get("db") || "mysql"
    const query = searchParams.get("query") || "active_owner"

    if (db === "mysql") {
      const mysql = await import("mysql2/promise")
      const conn = await mysql.default.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root",
        database: "dashboard_db",
      })

      let explainQuery = ""
      if (query === "active_owner") {
        explainQuery =
          "EXPLAIN SELECT * FROM items WHERE status = 'active' AND owner = 'John Doe' ORDER BY createdAt DESC"
      } else if (query === "name_search") {
        explainQuery = "EXPLAIN SELECT * FROM items WHERE name LIKE '%Project 001%'"
      }

      const [result] = await conn.execute(explainQuery)
      await conn.end()

      return Response.json({
        database: "mysql",
        query,
        explainOutput: result,
        timestamp: new Date().toISOString(),
      })
    } else if (db === "mongodb") {
      const { MongoClient } = await import("mongodb")
      const client = new MongoClient("mongodb://localhost:27017")
      await client.connect()

      const database = client.db("dashboard_db")
      const collection = database.collection("items")

      let explainResult
      if (query === "active_owner") {
        const cursor = collection.find({ status: "active", owner: "John Doe" }).sort({ createdAt: -1 })
        explainResult = await cursor.explain("executionStats")
      } else if (query === "name_search") {
        const cursor = collection.find({ name: { $regex: "Project 001", $options: "i" } })
        explainResult = await cursor.explain("executionStats")
      }

      await client.close()

      return Response.json({
        database: "mongodb",
        query,
        explainOutput: explainResult,
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ error: "Invalid database" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Explain error:", error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
