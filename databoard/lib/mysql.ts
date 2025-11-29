import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export async function getMysqlConnection() {
  if (pool) return pool

  try {
    // First, create a temporary connection to set up the database
    const tempConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "root",
      waitForConnections: true,
    })

    // Create database if it doesn't exist
    await tempConnection.execute(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || "projects_db"}\`
    `)

    await tempConnection.end()

    // Now create a pool with the database specified
    pool = await mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "root",
      database: process.env.MYSQL_DATABASE || "projects_db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    // Initialize database and table
    await initializeMysqlDb(pool)

    return pool
  } catch (error) {
    console.error("MySQL connection error:", error)
    pool = null
    throw error
  }
}

async function initializeMysqlDb(pool: mysql.Pool) {
  const connection = await pool.getConnection()
  try {
    // Create projects table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        tags JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status_owner (status, owner),
        INDEX idx_created (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log("MySQL database initialized")
  } catch (error) {
    console.error("MySQL initialization error:", error)
  } finally {
    connection.release()
  }
}
