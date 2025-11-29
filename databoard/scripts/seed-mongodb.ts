import { MongoClient } from "mongodb"

const projects = [
  {
    name: "Website Redesign",
    owner: "Alice Johnson",
    status: "active",
    tags: ["design", "web", "frontend"],
  },
  {
    name: "API Gateway Upgrade",
    owner: "Bob Smith",
    status: "active",
    tags: ["backend", "api", "infrastructure"],
  },
  {
    name: "Mobile App Launch",
    owner: "Carol Williams",
    status: "on-hold",
    tags: ["mobile", "ios", "android"],
  },
  {
    name: "Database Migration",
    owner: "David Chen",
    status: "completed",
    tags: ["database", "migration", "infrastructure"],
  },
  {
    name: "Analytics Dashboard",
    owner: "Eve Martinez",
    status: "active",
    tags: ["analytics", "dashboard", "business-intelligence"],
  },
]

async function seedMongodb() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DATABASE || "projects_db")
    const collection = db.collection("projects")

    // Clear existing data
    await collection.deleteMany({})

    // Add timestamps to projects
    const projectsWithTimestamps = projects.map((p) => ({
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // Insert projects
    const result = await collection.insertMany(projectsWithTimestamps)

    // Create indexes
    await collection.createIndex({ status: 1, owner: 1 })
    await collection.createIndex({ createdAt: -1 })

    console.log(`✓ Seeded ${result.insertedIds.length} projects to MongoDB`)
  } catch (error) {
    console.error("MongoDB seed error:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seedMongodb()
