"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db/mysql"
import { getItemsCollection } from "@/lib/db/mongodb"
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise"

interface Item {
  id?: number
  _id?: string
  name: string
  owner: string
  status: string
  tags: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const db = searchParams.get("db") || "mysql"
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const startTime = Date.now()

    if (db === "mysql") {
      const pool = getPool()
      const connection = await pool.getConnection()

      let query = "SELECT * FROM items WHERE 1=1"
      const params: (string | null)[] = []

      if (search) {
        query += " AND name LIKE ?"
        params.push(`%${search}%`)
      }

      if (status) {
        query += " AND status = ?"
        params.push(status)
      }

      const [rows] = await connection.execute<RowDataPacket[]>(query, params)
      connection.release()

      const items = rows.map((row: RowDataPacket) => ({
        ...row,
        tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
      }))

      const readTime = Date.now() - startTime

      return NextResponse.json({
        items,
        metrics: { readTime, db: "mysql" },
      })
    } else {
      const collection = await getItemsCollection()

      const query: any = {}
      if (search) {
        query.name = { $regex: search, $options: "i" }
      }
      if (status) {
        query.status = status
      }

      const items = await collection.find(query).toArray()
      const readTime = Date.now() - startTime

      return NextResponse.json({
        items: items.map((item) => ({
          ...item,
          id: item._id?.toString(),
        })),
        metrics: { readTime, db: "mongodb" },
      })
    }
  } catch (error) {
    console.error("[v0] API GET error:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Item = await request.json()
    const db = request.headers.get("x-db") || "mysql"

    const startTime = Date.now()

    if (db === "mysql") {
      const pool = getPool()
      const connection = await pool.getConnection()

      const tagsJson = JSON.stringify(body.tags || [])
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO items (name, owner, status, tags) VALUES (?, ?, ?, ?)",
        [body.name, body.owner, body.status, tagsJson],
      )
      connection.release()

      const writeTime = Date.now() - startTime

      return NextResponse.json({
        id: result.insertId,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { writeTime, db: "mysql" },
      })
    } else {
      const collection = await getItemsCollection()

      const result = await collection.insertOne({
        name: body.name,
        owner: body.owner,
        status: body.status,
        tags: body.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const writeTime = Date.now() - startTime

      return NextResponse.json({
        _id: result.insertedId.toString(),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { writeTime, db: "mongodb" },
      })
    }
  } catch (error) {
    console.error("[v0] API POST error:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const db = request.headers.get("x-db") || "mysql"

    const startTime = Date.now()

    if (db === "mysql") {
      const pool = getPool()
      const connection = await pool.getConnection()

      const tagsJson = JSON.stringify(body.tags || [])
      await connection.execute(
        "UPDATE items SET name = ?, owner = ?, status = ?, tags = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [body.name, body.owner, body.status, tagsJson, body.id],
      )
      connection.release()

      const writeTime = Date.now() - startTime

      return NextResponse.json({
        ...body,
        updatedAt: new Date(),
        metrics: { writeTime, db: "mysql" },
      })
    } else {
      const collection = await getItemsCollection()
      const { ObjectId } = require("mongodb")

      await collection.updateOne(
        { _id: new ObjectId(body._id || body.id) },
        {
          $set: {
            name: body.name,
            owner: body.owner,
            status: body.status,
            tags: body.tags || [],
            updatedAt: new Date(),
          },
        },
      )

      const writeTime = Date.now() - startTime

      return NextResponse.json({
        ...body,
        updatedAt: new Date(),
        metrics: { writeTime, db: "mongodb" },
      })
    }
  } catch (error) {
    console.error("[v0] API PUT error:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const db = searchParams.get("db") || "mysql"

    const startTime = Date.now()

    if (db === "mysql") {
      const pool = getPool()
      const connection = await pool.getConnection()

      await connection.execute("DELETE FROM items WHERE id = ?", [id])
      connection.release()

      const writeTime = Date.now() - startTime

      return NextResponse.json({ success: true, metrics: { writeTime, db: "mysql" } })
    } else {
      const collection = await getItemsCollection()
      const { ObjectId } = require("mongodb")

      await collection.deleteOne({ _id: new ObjectId(id) })

      const writeTime = Date.now() - startTime

      return NextResponse.json({ success: true, metrics: { writeTime, db: "mongodb" } })
    }
  } catch (error) {
    console.error("[v0] API DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
