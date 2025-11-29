"use server"

async function seedRecords() {
  try {
    console.log("[v0] Generating 2000 seed records...")

    // MySQL seeding
    const mysql = await import("mysql2/promise")
    const mysqlConn = await mysql.default.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "root",
      database: "dashboard_db",
    })

    const owners = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams", "Charlie Brown"]
    const statuses = ["active", "inactive", "pending"]
    const tags = [
      ["feature", "urgent"],
      ["bug-fix", "research"],
      ["archived"],
      ["documentation"],
      ["testing", "qa"],
      ["frontend"],
      ["backend"],
      ["database"],
    ]

    // Clear existing data
    await mysqlConn.execute("TRUNCATE TABLE items")

    // Bulk insert with batch processing
    const batchSize = 100
    for (let i = 0; i < 2000; i += batchSize) {
      const batch = []
      for (let j = 0; j < batchSize && i + j < 2000; j++) {
        const name = `Project ${String(i + j + 1).padStart(4, "0")}`
        const owner = owners[Math.floor(Math.random() * owners.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const projectTags = tags[Math.floor(Math.random() * tags.length)]
        batch.push([name, owner, status, JSON.stringify(projectTags)])
      }

      const values = batch.map(() => "(?, ?, ?, ?)").join(",")
      const query = `INSERT INTO items (name, owner, status, tags) VALUES ${values}`
      const flatValues = batch.flat()
      await mysqlConn.execute(query, flatValues)
    }

    await mysqlConn.end()
    console.log("[v0] MySQL: 2000 records seeded successfully")

    // MongoDB seeding
    const { MongoClient } = await import("mongodb")
    const mongoClient = new MongoClient("mongodb://localhost:27017")
    await mongoClient.connect()

    const db = mongoClient.db("dashboard_db")
    const collection = db.collection("items")

    // Clear existing data
    await collection.deleteMany({})

    // Bulk insert
    const mongoRecords = []
    for (let i = 0; i < 2000; i++) {
      mongoRecords.push({
        name: `Project ${String(i + 1).padStart(4, "0")}`,
        owner: owners[Math.floor(Math.random() * owners.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        tags: tags[Math.floor(Math.random() * tags.length)],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await collection.insertMany(mongoRecords)
    await mongoClient.close()
    console.log("[v0] MongoDB: 2000 records seeded successfully")

    console.log("[v0] Seed data generated successfully")
  } catch (error) {
    console.error("[v0] Seed error:", error)
    process.exit(1)
  }
}

seedRecords()
