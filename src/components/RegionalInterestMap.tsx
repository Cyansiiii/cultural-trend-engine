"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"
import { useMemo } from "react"

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function RegionalInterestMap({ regions }: { regions: { name: string; interest: number }[] }) {
  const data = useMemo(() => regions.map((r, i) => ({ name: r.name, interest: r.interest, color: CHART_COLORS[i % CHART_COLORS.length] })), [regions])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-40"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={80} stroke="var(--color-muted-foreground)" tickLine={false} tickMargin={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar dataKey="interest" radius={[4, 0, 0, 4]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}