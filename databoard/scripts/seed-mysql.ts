import mysql from "mysql2/promise"

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

async function seedMysql() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "root",
    })

    // Create database
    await connection.execute("CREATE DATABASE IF NOT EXISTS projects_db")
    await connection.execute("USE projects_db")

    // Create table
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

    // Clear existing data
    await connection.execute("TRUNCATE TABLE projects")

    // Insert sample data
    for (const project of projects) {
      await connection.execute("INSERT INTO projects (name, owner, status, tags) VALUES (?, ?, ?, ?)", [
        project.name,
        project.owner,
        project.status,
        JSON.stringify(project.tags),
      ])
    }

    console.log(`✓ Seeded ${projects.length} projects to MySQL`)
    await connection.end()
  } catch (error) {
    console.error("MySQL seed error:", error)
    process.exit(1)
  }
}

seedMysql()
