"use server"

let pool: any = null

async function initializePool() {
  if (pool) return pool

  const mysql = await import("mysql2/promise")
  pool = mysql.default.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "dashboard_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  return pool
}

export async function initializeMySQL() {
  try {
    const currentPool = await initializePool()
    const connection = await currentPool.getConnection()

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS dashboard_db`)
    connection.release()

    // Create table
    const conn = await currentPool.getConnection()
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        owner VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
        tags JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status_owner (status, owner)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    conn.release()

    console.log("[v0] MySQL initialized successfully")
  } catch (error) {
    console.error("[v0] MySQL initialization error:", error)
    throw error
  }
}

export async function getPool() {
  return await initializePool()
}
