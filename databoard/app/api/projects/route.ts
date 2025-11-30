import { type NextRequest, NextResponse } from "next/server"
import { getMysqlConnection } from "@/lib/mysql"
import { getMongoDb } from "@/lib/mongodb"
import { validateProject } from "@/lib/validation"
import { toMysqlDatetime } from "@/lib/date-utils"

export async function GET(request: NextRequest) {
  let connection = null
  try {
    const searchParams = request.nextUrl.searchParams
    const db = searchParams.get("db") || "mysql"
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    if (db === "mongodb") {
      const database = await getMongoDb()
      const collection = database.collection("projects")

      const filter: any = {}
      if (search) filter.name = { $regex: search, $options: "i" }
      if (status) filter.status = status

      const projects = await collection.find(filter).sort({ createdAt: -1 }).toArray()

      return NextResponse.json(projects)
    } else {
      const pool = await getMysqlConnection()
      connection = await pool.getConnection()

      let query = "SELECT * FROM projects WHERE 1=1"
      const params: any[] = []

      if (search) {
        query += " AND name LIKE ?"
        params.push(`%${search}%`)
      }
      if (status) {
        query += " AND status = ?"
        params.push(status)
      }

      query += " ORDER BY createdAt DESC"

      const [rows] = await connection.execute(query, params)

      const projects = (rows as any[]).map((row) => {
        try {
          return {
            ...row,
            tags: JSON.parse(row.tags || "[]"),
          }
        } catch (e) {
          return {
            ...row,
            tags: [],
          }
        }
      })

      return NextResponse.json(projects)
    }
  } catch (error: any) {
    console.error("GET /api/projects error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function POST(request: NextRequest) {
  let connection = null
  try {
    const body = await request.json()
    const db = request.nextUrl.searchParams.get("db") || "mysql"

    const validation = validateProject(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const now = new Date().toISOString()
    const projectData = {
      name: body.name,
      owner: body.owner,
      status: body.status,
      tags: body.tags || [],
      createdAt: now,
      updatedAt: now,
    }

    if (db === "mongodb") {
      const database = await getMongoDb()
      const collection = database.collection("projects")
      const result = await collection.insertOne(projectData)

      return NextResponse.json({
        _id: result.insertedId,
        ...projectData,
      })
    } else {
      const pool = await getMysqlConnection()
      connection = await pool.getConnection()

      const [result] = await connection.execute(
        "INSERT INTO projects (name, owner, status, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
        [
          projectData.name,
          projectData.owner,
          projectData.status,
          JSON.stringify(projectData.tags),
          toMysqlDatetime(projectData.createdAt),
          toMysqlDatetime(projectData.updatedAt),
        ],
      )

      return NextResponse.json({
        id: (result as any).insertId,
        ...projectData,
      })
    }
  } catch (error: any) {
    console.error("POST /api/projects error:", error)
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
