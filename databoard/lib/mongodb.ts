import { MongoClient, type Db } from "mongodb"

let db: Db | null = null

export async function getMongoDb(): Promise<Db> {
  if (db) return db

  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
    const client = new MongoClient(uri)
    await client.connect()

    db = client.db(process.env.MONGODB_DATABASE || "projects_db")

    // Initialize database
    await initializeMongoDb(db)

    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

async function initializeMongoDb(database: Db) {
  try {
    // Create collection if not exists
    const collections = await database.listCollections().toArray()
    const exists = collections.some((col) => col.name === "projects")

    if (!exists) {
      await database.createCollection("projects")
    }

    // Create compound index on status and owner
    await database.collection("projects").createIndex({ status: 1, owner: 1 })

    // Create index on createdAt for sorting
    await database.collection("projects").createIndex({ createdAt: -1 })

    console.log("MongoDB database initialized")
  } catch (error) {
    console.error("MongoDB initialization error:", error)
  }
}
