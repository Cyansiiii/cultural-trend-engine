"use client"

import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { useMemo } from "react"

// Normalize to 0..100 and pad to 12 points
export function VelocityChart({ points }: { points: number[] }) {
  const max = Math.max(1, ...points)
  const data = useMemo(() => {
    const padded = points.length < 12 ? [...Array(12 - points.length).fill(points[0] ?? 0), ...points] : points
    return padded.map((v, i) => ({ period: i + 1, velocity: (v / max) * 100 }))
  }, [points])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-40"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
          <XAxis dataKey="period" hide stroke="var(--color-muted-foreground)" />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="var(--color-chart-1)"
            strokeWidth={3}
            dot={{ fill: "var(--color-chart-1)", r: 3 }}
            activeDot={{ r: 6, stroke: "var(--color-chart-1)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}