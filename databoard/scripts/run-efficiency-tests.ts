"use server"

async function runTests() {
  console.log("[v0] Running efficiency experiments...\n")

  const baseUrl = "http://localhost:3000/api/performance"

  try {
    // Test 1: Active + Owner query
    console.log("=== Query 1: Active Projects by Owner ===")
    console.log("SELECT * FROM items WHERE status='active' AND owner='John Doe' ORDER BY createdAt DESC\n")

    const mysqlResult = await fetch(`${baseUrl}/measure?db=mysql&query=active_owner&iterations=20`)
    const mysqlData = await mysqlResult.json()
    console.log("MySQL Results:")
    console.log(`  Average: ${mysqlData.stats.avg.toFixed(2)}ms`)
    console.log(`  Min: ${mysqlData.stats.min}ms, Max: ${mysqlData.stats.max}ms`)
    console.log(`  Timings: ${mysqlData.timings.join(", ")}\n`)

    const mongoResult = await fetch(`${baseUrl}/measure?db=mongodb&query=active_owner&iterations=20`)
    const mongoData = await mongoResult.json()
    console.log("MongoDB Results:")
    console.log(`  Average: ${mongoData.stats.avg.toFixed(2)}ms`)
    console.log(`  Min: ${mongoData.stats.min}ms, Max: ${mongoData.stats.max}ms`)
    console.log(`  Timings: ${mongoData.timings.join(", ")}\n`)

    // Test 2: Name search query
    console.log("=== Query 2: Search by Partial Name ===")
    console.log("SELECT * FROM items WHERE name LIKE '%Project 001%'\n")

    const mysqlSearchResult = await fetch(`${baseUrl}/measure?db=mysql&query=name_search&iterations=20`)
    const mysqlSearchData = await mysqlSearchResult.json()
    console.log("MySQL Results:")
    console.log(`  Average: ${mysqlSearchData.stats.avg.toFixed(2)}ms`)
    console.log(`  Min: ${mysqlSearchData.stats.min}ms, Max: ${mysqlSearchData.stats.max}ms`)
    console.log(`  Timings: ${mysqlSearchData.timings.join(", ")}\n`)

    const mongoSearchResult = await fetch(`${baseUrl}/measure?db=mongodb&query=name_search&iterations=20`)
    const mongoSearchData = await mongoSearchResult.json()
    console.log("MongoDB Results:")
    console.log(`  Average: ${mongoSearchData.stats.avg.toFixed(2)}ms`)
    console.log(`  Min: ${mongoSearchData.stats.min}ms, Max: ${mongoSearchData.stats.max}ms`)
    console.log(`  Timings: ${mongoSearchData.timings.join(", ")}\n`)

    // EXPLAIN analysis
    console.log("=== EXPLAIN Analysis ===")
    const mysqlExplain = await fetch(`${baseUrl}/explain?db=mysql&query=active_owner`)
    const mysqlExplainData = await mysqlExplain.json()
    console.log("MySQL EXPLAIN (Query 1):")
    console.log(JSON.stringify(mysqlExplainData.explainOutput, null, 2))

    const mongoExplain = await fetch(`${baseUrl}/explain?db=mongodb&query=active_owner`)
    const mongoExplainData = await mongoExplain.json()
    console.log("\nMongoDB Explain (Query 1):")
    console.log(JSON.stringify(mongoExplainData.explainOutput, null, 2))

    console.log("\n[v0] Efficiency tests completed!")
  } catch (error) {
    console.error("[v0] Test error:", error)
    process.exit(1)
  }
}

runTests()
