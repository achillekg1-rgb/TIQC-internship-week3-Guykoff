import { MongoClient } from "mongodb"

async function setupMongoDB() {
  const client = new MongoClient("mongodb://localhost:27017")

  try {
    console.log("[v0] Setting up MongoDB...")

    await client.connect()
    const db = client.db("dashboard_db")

    // Drop existing collection
    const collections = await db.listCollections().toArray()
    if (collections.find((c) => c.name === "items")) {
      await db.collection("items").drop()
    }

    // Create collection
    await db.createCollection("items")
    console.log("[v0] Collection created")

    // Create indexes
    const collection = db.collection("items")
    await collection.createIndex({ status: 1, owner: 1 })
    console.log("[v0] Compound index created on (status, owner)")

    // Seed sample data
    const sampleData = [
      {
        name: "Project Alpha",
        owner: "John Doe",
        status: "active",
        tags: ["feature", "urgent"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Project Beta",
        owner: "Jane Smith",
        status: "pending",
        tags: ["bug-fix", "research"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Project Gamma",
        owner: "Bob Johnson",
        status: "inactive",
        tags: ["archived"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Project Delta",
        owner: "John Doe",
        status: "active",
        tags: ["documentation"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Project Epsilon",
        owner: "Jane Smith",
        status: "active",
        tags: ["testing", "qa"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await collection.insertMany(sampleData)
    console.log("[v0] Sample data inserted")

    await client.close()
    console.log("[v0] MongoDB setup completed successfully")
  } catch (error) {
    console.error("[v0] MongoDB setup error:", error)
    process.exit(1)
  }
}

setupMongoDB()
