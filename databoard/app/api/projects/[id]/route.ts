import { type NextRequest, NextResponse } from "next/server"
import { getMysqlConnection } from "@/lib/mysql"
import { getMongoDb } from "@/lib/mongodb"
import { validateProject } from "@/lib/validation"
import { ObjectId } from "mongodb"
import { toMysqlDatetime } from "@/lib/date-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection = null
  try {
    const { id } = await params
    const db = request.nextUrl.searchParams.get("db") || "mysql"

    if (db === "mongodb") {
      const database = await getMongoDb()
      const collection = database.collection("projects")
      const project = await collection.findOne({ _id: new ObjectId(id) })

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      return NextResponse.json(project)
    } else {
      const pool = await getMysqlConnection()
      connection = await pool.getConnection()
      const [rows] = await connection.execute("SELECT * FROM projects WHERE id = ?", [id])

      if ((rows as any[]).length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      const project = (rows as any[])[0]

      let tags = []
      try {
        tags = JSON.parse(project.tags || "[]")
      } catch (e) {
        console.error("Error parsing tags for project:", id, e)
        tags = []
      }

      return NextResponse.json({
        ...project,
        tags,
      })
    }
  } catch (error: any) {
    console.error("GET /api/projects/[id] error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch project" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection = null
  try {
    const { id } = await params
    const body = await request.json()
    const db = request.nextUrl.searchParams.get("db") || "mysql"

    const validation = validateProject(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const updateData = {
      name: body.name,
      owner: body.owner,
      status: body.status,
      tags: body.tags || [],
      updatedAt: new Date().toISOString(),
    }

    if (db === "mongodb") {
      const database = await getMongoDb()
      const collection = database.collection("projects")

      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      return NextResponse.json({
        _id: id,
        ...updateData,
      })
    } else {
      const pool = await getMysqlConnection()
      connection = await pool.getConnection()

      const [result] = await connection.execute(
        "UPDATE projects SET name = ?, owner = ?, status = ?, tags = ?, updatedAt = ? WHERE id = ?",
        [
          updateData.name,
          updateData.owner,
          updateData.status,
          JSON.stringify(updateData.tags),
          toMysqlDatetime(updateData.updatedAt),
          id,
        ],
      )

      if ((result as any).affectedRows === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      return NextResponse.json({
        id,
        ...updateData,
      })
    }
  } catch (error: any) {
    console.error("PUT /api/projects/[id] error:", error)
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection = null
  try {
    const { id } = await params
    const db = request.nextUrl.searchParams.get("db") || "mysql"

    if (db === "mongodb") {
      const database = await getMongoDb()
      const collection = database.collection("projects")

      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } else {
      const pool = await getMysqlConnection()
      connection = await pool.getConnection()

      const [result] = await connection.execute("DELETE FROM projects WHERE id = ?", [id])

      if ((result as any).affectedRows === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    }
  } catch (error: any) {
    console.error("DELETE /api/projects/[id] error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
