"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendCard } from "@/components/TrendCard";
import { VelocityChart } from "@/components/VelocityChart";
import { RegionalInterestMap } from "@/components/RegionalInterestMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Settings, Activity, Globe2, LayoutDashboard } from "lucide-react";
import { useSendEvent } from "@/lib/sendEvent";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { sendEvent } = useSendEvent();
  const [trends, setTrends] = useState<Array<{
    id: number;
    slug: string;
    title: string;
    volume: number;
    velocity: number;
    sentiment: string;
    tags: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredPoints, setFeaturedPoints] = useState<number[] | null>(null);
  const [featuredRegions, setFeaturedRegions] = useState<Array<{ name: string; interest: number }> | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/trends?limit=50`);
        if (!res.ok) {
          throw new Error(`Failed to load trends (${res.status})`);
        }
        const data = await res.json();
        if (!ignore) setTrends(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "Failed to load trends");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchTrends();
    return () => {
      ignore = true;
    };
  }, []);

  const featured = useMemo(() => trends[0], [trends]);

  // Fetch full details for featured trend (velocityPoints, regions)
  useEffect(() => {
    let cancelled = false;
    const loadFeatured = async () => {
      if (!featured) {
        setFeaturedPoints(null);
        setFeaturedRegions(null);
        return;
      }
      try {
        const res = await fetch(`/api/trends?slug=${encodeURIComponent(featured.slug)}`);
        if (!res.ok) return;
        const full = await res.json();
        if (cancelled) return;
        const points = Array.isArray(full.velocityPoints)
          ? [...full.velocityPoints]
              .sort((a, b) => (a.periodIndex ?? 0) - (b.periodIndex ?? 0))
              .map((p) => Number(p.value ?? 0))
          : [];
        const regions = Array.isArray(full.regions)
          ? full.regions.map((r: any) => ({ name: r.region ?? r.name, interest: Number(r.interest ?? 0) }))
          : [];
        setFeaturedPoints(points);
        setFeaturedRegions(regions);
      } catch {}
    };
    loadFeatured();
    return () => { cancelled = true; };
  }, [featured?.slug]);

  const handleNavClick = (label: string) => {
    sendEvent({ type: "button_click", meta: { button: label.toLowerCase() } });
  };

  return (
    <motion.div
      className="relative max-w-7xl mx-auto px-4 py-6 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative gradient backdrops for glassmorphism */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-chart-1/30 via-chart-4/30 to-chart-5/30 blur-3xl opacity-70 dark:opacity-50" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-chart-5/25 via-chart-3/25 to-chart-2/25 blur-3xl opacity-70 dark:opacity-50" />

      <motion.header 
        className="flex items-center justify-between rounded-xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/10 backdrop-blur-xl p-4 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-chart-1 via-chart-4 to-chart-5 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="size-6 text-chart-4" />
            Cultural Resonance Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time cultural trends, sentiment, and momentum</p>
        </div>
        <motion.div className="flex flex-wrap gap-2" whileHover={{ scale: 1.05 }}>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "border-chart-4 text-chart-4 hover:bg-chart-4/10 flex items-center gap-2 h-9 px-4 py-2"
            )}
            onClick={() => handleNavClick("Dashboard")}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/insights"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "border-chart-4 text-chart-4 hover:bg-chart-4/10 flex items-center gap-2 h-9 px-4 py-2"
            )}
            onClick={() => handleNavClick("Insights")}
          >
            <Activity className="size-4" />
            Insights
          </Link>
          <Link
            href="/generator"
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "bg-gradient-to-r from-chart-1 via-chart-4 to-chart-5 hover:from-chart-5 hover:via-chart-4 hover:to-chart-1 transition-all text-primary-foreground flex items-center gap-2 h-9 px-4 py-2"
            )}
            onClick={() => handleNavClick("Generator")}
          >
            <Rocket className="size-4" />
            Open Content Generator
          </Link>
          <Link
            href="/settings"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "border-chart-4 text-chart-4 hover:bg-chart-4/10 flex items-center gap-2 h-9 px-4 py-2"
            )}
            onClick={() => handleNavClick("Settings")}
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </motion.div>
      </motion.header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div 
                key={i} 
                className="h-40 rounded-md bg-gradient-to-r from-chart-2/15 via-chart-4/15 to-chart-1/15 animate-pulse" 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 max-w-md mx-auto"
          >
            {error}
          </motion.div>
        ) : (
          <motion.section 
            key="trends"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {trends.map((t, i) => (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <TrendCard
                  slug={t.slug}
                  title={t.title}
                  volume={t.volume}
                  velocity={t.velocity}
                  sentiment={t.sentiment as any}
                  tags={t.tags}
                />
              </motion.div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      <motion.section 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
          <CardHeader className="bg-gradient-to-r from-chart-1/10 via-chart-4/10 to-chart-5/10 pb-4">
            <CardTitle className="text-chart-1 flex items-center gap-2">
              <Activity className="size-4 text-chart-4" />
              Velocity (last 12 periods)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {featured && featuredPoints ? (
              <VelocityChart points={featuredPoints} />
            ) : (
              <div className="h-40 rounded-md bg-gradient-to-r from-chart-2/15 via-chart-4/15 to-chart-1/15 animate-pulse" />
            )}
          </CardContent>
        </Card>
        <Card className="hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
          <CardHeader className="bg-gradient-to-r from-chart-5/10 via-chart-4/10 to-chart-1/10 pb-4">
            <CardTitle className="text-chart-5 flex items-center gap-2">
              <Globe2 className="size-4 text-chart-4" />
              Regional Interest
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {featured && featuredRegions ? (
              <RegionalInterestMap regions={featuredRegions} />
            ) : (
              <div className="h-40 rounded-md bg-gradient-to-r from-chart-2/15 via-chart-4/15 to-chart-1/15 animate-pulse" />
            )}
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  );
}