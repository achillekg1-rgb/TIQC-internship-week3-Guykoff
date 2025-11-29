import { MongoClient, type Db, type Collection } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export interface Item {
  _id?: string
  name: string
  owner: string
  status: "active" | "inactive" | "pending"
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient("mongodb://localhost:27017")
    await client.connect()

    const db = client.db("dashboard_db")

    // Create collection if not exists
    const collections = await db.listCollections().toArray()
    if (!collections.find((c) => c.name === "items")) {
      await db.createCollection("items")
    }

    // Create compound index
    const collection = db.collection("items")
    await collection.createIndex({ status: 1, owner: 1 })

    cachedClient = client
    cachedDb = db

    console.log("[v0] MongoDB connected successfully")
    return { client, db }
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error)
    throw error
  }
}

export async function getItemsCollection(): Promise<Collection<Item>> {
  const { db } = await connectToDatabase()
  return db.collection<Item>("items")
}
