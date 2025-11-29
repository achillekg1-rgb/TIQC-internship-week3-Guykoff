import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface Metrics {
  readTime: number
  writeTime: number
  db: string
  timestamp: Date
}

interface PerformanceMetricsProps {
  metrics: Metrics[]
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const mysqlMetrics = metrics.filter((m) => m.db === "mysql")
  const mongoMetrics = metrics.filter((m) => m.db === "mongodb")

  const avgMysqlRead = mysqlMetrics.reduce((sum, m) => sum + m.readTime, 0) / (mysqlMetrics.length || 1)
  const avgMongoRead = mongoMetrics.reduce((sum, m) => sum + m.readTime, 0) / (mongoMetrics.length || 1)

  const avgMysqlWrite = mysqlMetrics.reduce((sum, m) => sum + m.writeTime, 0) / (mysqlMetrics.length || 1)
  const avgMongoWrite = mongoMetrics.reduce((sum, m) => sum + m.writeTime, 0) / (mongoMetrics.length || 1)

  const timelineData = metrics.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    "MySQL Read": m.db === "mysql" ? m.readTime : 0,
    "MongoDB Read": m.db === "mongodb" ? m.readTime : 0,
    "MySQL Write": m.db === "mysql" ? m.writeTime : 0,
    "MongoDB Write": m.db === "mongodb" ? m.writeTime : 0,
  }))

  const comparisonData = [
    { name: "MySQL", read: avgMysqlRead, write: avgMysqlWrite },
    { name: "MongoDB", read: avgMongoRead, write: avgMongoWrite },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Comparison Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Read/Write Performance (Avg ms)</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis dataKey="name" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="read" fill="oklch(0.4 0.18 259)" name="Read" />
                <Bar dataKey="write" fill="oklch(0.55 0.2 200)" name="Write" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Performance Timeline (ms)</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 1 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis dataKey="time" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="MySQL Read" stroke="oklch(0.4 0.18 259)" strokeWidth={2} />
                <Line type="monotone" dataKey="MongoDB Read" stroke="oklch(0.55 0.2 200)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 md:col-span-2">
        <Card className="border-border p-4">
          <div className="text-xs text-muted-foreground">MySQL Avg Read</div>
          <div className="text-2xl font-bold text-primary mt-1">{avgMysqlRead.toFixed(2)}ms</div>
        </Card>
        <Card className="border-border p-4">
          <div className="text-xs text-muted-foreground">MongoDB Avg Read</div>
          <div className="text-2xl font-bold text-accent mt-1">{avgMongoRead.toFixed(2)}ms</div>
        </Card>
        <Card className="border-border p-4">
          <div className="text-xs text-muted-foreground">MySQL Avg Write</div>
          <div className="text-2xl font-bold text-primary mt-1">{avgMysqlWrite.toFixed(2)}ms</div>
        </Card>
        <Card className="border-border p-4">
          <div className="text-xs text-muted-foreground">MongoDB Avg Write</div>
          <div className="text-2xl font-bold text-accent mt-1">{avgMongoWrite.toFixed(2)}ms</div>
        </Card>
      </div>
    </div>
  )
}
