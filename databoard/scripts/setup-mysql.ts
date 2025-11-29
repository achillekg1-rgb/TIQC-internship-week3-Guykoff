async function setupMySQL() {
  try {
    console.log("[v0] Setting up MySQL...")
    const mysql = await import("mysql2/promise")

    const connection = await mysql.default.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "root",
    })

    // Create database
    await connection.execute("DROP DATABASE IF EXISTS dashboard_db")
    await connection.execute("CREATE DATABASE dashboard_db")
    console.log("[v0] Database created")

    await connection.query("USE dashboard_db")

    await connection.execute(`
      CREATE TABLE items (
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
    console.log("[v0] Table created with indexes")

    // Seed sample data
    const sampleData = [
      ["Project Alpha", "John Doe", "active", '["feature", "urgent"]'],
      ["Project Beta", "Jane Smith", "pending", '["bug-fix", "research"]'],
      ["Project Gamma", "Bob Johnson", "inactive", '["archived"]'],
      ["Project Delta", "John Doe", "active", '["documentation"]'],
      ["Project Epsilon", "Jane Smith", "active", '["testing", "qa"]'],
    ]

    for (const data of sampleData) {
      await connection.execute("INSERT INTO items (name, owner, status, tags) VALUES (?, ?, ?, ?)", data)
    }
    console.log("[v0] Sample data inserted")

    await connection.end()
    console.log("[v0] MySQL setup completed successfully")
  } catch (error) {
    console.error("[v0] MySQL setup error:", error)
    process.exit(1)
  }
}

setupMySQL()
