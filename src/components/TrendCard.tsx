"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function TrendCard({
  slug,
  title,
  volume,
  velocity,
  sentiment,
  tags,
}: {
  slug: string
  title: string
  volume: number
  velocity: number
  sentiment: { score: number; label: string }
  tags: string[]
}) {
  const rising = velocity >= 0
  const SentIcon = rising ? ArrowUpRight : ArrowDownRight

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link href={`/insights/${slug}`} className="block">
        <Card className="hover:shadow-lg transition-all duration-300 h-full bg-gradient-to-br from-card to-card-foreground/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary">
              <span>{title}</span>
              <Badge variant="secondary" className="bg-gradient-to-r from-accent to-primary/20">{sentiment.label}</Badge>
            </CardTitle>
            <CardDescription className="text-accent-foreground">
              Volume {new Intl.NumberFormat().format(volume)} · Velocity {rising ? "+" : ""}{velocity}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SentIcon className={`size-4 ${rising ? "text-green-500 animate-pulse" : "text-red-500"}`} />
              <span>Sentiment score {(sentiment.score * 100).toFixed(0)}%</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <motion.div
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Badge variant="outline" className="border-accent-foreground bg-accent/20">{t}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}