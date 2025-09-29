export type Trend = {
  slug: string
  title: string
  volume: number
  velocity: number // percentage change week-over-week
  sentiment: { score: number; label: "positive" | "neutral" | "negative" }
  regions: { name: string; interest: number }[] // 0-100
  demographics: {
    ageGroups: { label: string; pct: number }[]
    genders: { label: string; pct: number }[]
  }
  velocityHistory: number[] // last 12 points
  samplePosts: { source: "x" | "tiktok" | "reddit" | "news"; text: string; author: string }[]
  tags: string[]
}

export const TRENDS: Trend[] = [
  {
    slug: "quiet-luxury",
    title: "Quiet Luxury",
    volume: 89200,
    velocity: 34,
    sentiment: { score: 0.64, label: "positive" },
    regions: [
      { name: "US", interest: 82 },
      { name: "UK", interest: 75 },
      { name: "FR", interest: 58 },
      { name: "DE", interest: 52 },
      { name: "JP", interest: 47 },
    ],
    demographics: {
      ageGroups: [
        { label: "18-24", pct: 22 },
        { label: "25-34", pct: 38 },
        { label: "35-44", pct: 24 },
        { label: "45+", pct: 16 },
      ],
      genders: [
        { label: "Women", pct: 62 },
        { label: "Men", pct: 38 },
      ],
    },
    velocityHistory: [10, 14, 12, 16, 20, 22, 25, 28, 30, 34, 38, 44],
    samplePosts: [
      { source: "x", text: "The rise of #QuietLuxury is about craftsmanship over logos.", author: "@stylepulse" },
      { source: "tiktok", text: "Minimalist fits that whisper, not shout.", author: "@minimalmuse" },
      { source: "news", text: "Searches for 'quiet luxury' surge as consumers seek timelessness.", author: "WWD" },
    ],
    tags: ["fashion", "minimalism", "premium"],
  },
  {
    slug: "cozy-gaming",
    title: "Cozy Gaming",
    volume: 124300,
    velocity: 18,
    sentiment: { score: 0.73, label: "positive" },
    regions: [
      { name: "US", interest: 71 },
      { name: "CA", interest: 65 },
      { name: "AU", interest: 59 },
      { name: "SE", interest: 63 },
      { name: "JP", interest: 54 },
    ],
    demographics: {
      ageGroups: [
        { label: "13-17", pct: 9 },
        { label: "18-24", pct: 29 },
        { label: "25-34", pct: 33 },
        { label: "35-44", pct: 19 },
        { label: "45+", pct: 10 },
      ],
      genders: [
        { label: "Women", pct: 48 },
        { label: "Men", pct: 45 },
        { label: "Non-binary", pct: 7 },
      ],
    },
    velocityHistory: [4, 6, 8, 7, 10, 11, 12, 14, 15, 16, 17, 18],
    samplePosts: [
      { source: "reddit", text: "Best cozy games on Switch for rainy days?", author: "u/leafling" },
      { source: "x", text: "Cozy gaming corner reveal ✨", author: "@softpixels" },
      { source: "news", text: "Indie titles fuel 'cozy' game surge in 2025.", author: "Polygon" },
    ],
    tags: ["gaming", "lifestyle", "indie"],
  },
  {
    slug: "girl-dinner",
    title: "Girl Dinner",
    volume: 54300,
    velocity: -6,
    sentiment: { score: 0.31, label: "neutral" },
    regions: [
      { name: "US", interest: 68 },
      { name: "UK", interest: 55 },
      { name: "BR", interest: 49 },
      { name: "ES", interest: 45 },
    ],
    demographics: {
      ageGroups: [
        { label: "13-17", pct: 15 },
        { label: "18-24", pct: 41 },
        { label: "25-34", pct: 27 },
        { label: "35-44", pct: 12 },
        { label: "45+", pct: 5 },
      ],
      genders: [
        { label: "Women", pct: 72 },
        { label: "Men", pct: 24 },
        { label: "Non-binary", pct: 4 },
      ],
    },
    velocityHistory: [22, 24, 23, 21, 20, 18, 17, 15, 12, 10, 8, 7],
    samplePosts: [
      { source: "tiktok", text: "My chaotic girl dinner tonight 😂", author: "@snackstack" },
      { source: "x", text: "Girl dinner era might be over?", author: "@trendwatch" },
    ],
    tags: ["food", "social"],
  },
]

export function getTrendBySlug(slug: string) {
  return TRENDS.find((t) => t.slug === slug)
}