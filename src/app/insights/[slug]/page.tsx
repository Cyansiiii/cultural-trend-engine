"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VelocityChart } from "@/components/VelocityChart";
import { RegionalInterestMap } from "@/components/RegionalInterestMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InsightDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<null | {
    slug: string;
    title: string;
    volume: number;
    velocity: number;
    sentimentLabel: string;
    sentimentScore?: number;
    velocityPoints: number[];
    regions: { name: string; interest: number }[];
    ageGroups: { label: string; pct: number }[];
    genders: { label: string; pct: number }[];
    posts: { source: string; author: string; text: string }[];
  }>(null);

  useEffect(() => {
    let cancelled = false;
    const slug = String(params?.slug || "");
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(`/api/trends?slug=${encodeURIComponent(slug)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          if (res.status === 404) {
            setTrend(null);
            setError("Trend not found");
            return;
          }
          throw new Error(`Failed to load trend (${res.status})`);
        }
        const full = await res.json();
        if (cancelled) return;
        const velocityPoints: number[] = Array.isArray(full.velocityPoints)
          ? [...full.velocityPoints]
              .sort((a, b) => (a.periodIndex ?? 0) - (b.periodIndex ?? 0))
              .map((p: any) => Number(p.value ?? 0))
          : [];
        const regions = Array.isArray(full.regions)
          ? full.regions.map((r: any) => ({ name: r.region ?? r.name, interest: Number(r.interest ?? 0) }))
          : [];
        const ageGroups = Array.isArray(full.demographics)
          ? full.demographics
              .filter((d: any) => d.group === "age")
              .map((d: any) => ({ label: d.label, pct: Number(d.value ?? 0) }))
          : [];
        const genders = Array.isArray(full.demographics)
          ? full.demographics
              .filter((d: any) => d.group === "gender")
              .map((d: any) => ({ label: d.label, pct: Number(d.value ?? 0) }))
          : [];
        const posts = Array.isArray(full.posts)
          ? full.posts.map((p: any) => ({ source: "social", author: p.author, text: p.content }))
          : [];

        setTrend({
          slug: full.slug,
          title: full.title,
          volume: Number(full.volume ?? 0),
          velocity: Number(full.velocity ?? 0),
          sentimentLabel: String(full.sentiment ?? "neutral"),
          sentimentScore: undefined,
          velocityPoints,
          regions,
          ageGroups,
          genders,
          posts,
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load trend");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params?.slug]);

  const notFound = useMemo(() => !loading && (!!error || !trend), [loading, error, trend]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <p className="text-muted-foreground">{error || "Trend not found."}</p>
        <Button variant="outline" onClick={() => router.push("/insights")}>Back to Insights</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            {trend!.title}
            <Badge variant="secondary">{trend!.sentimentLabel}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Volume {new Intl.NumberFormat().format(trend!.volume)} · Velocity {trend!.velocity >= 0 ? "+" : ""}{trend!.velocity}%</p>
        </div>
        <Button onClick={() => router.push(`/generator?trend=${trend!.slug}`)}>Generate Content</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sentiment & Velocity</CardTitle>
            <CardDescription>Last 12 periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <VelocityChart points={trend!.velocityPoints} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Regional Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <RegionalInterestMap regions={trend!.regions} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Age Groups</h3>
                <div className="space-y-2">
                  {trend!.ageGroups.map((g) => (
                    <div key={g.label} className="grid grid-cols-[6rem_1fr_auto] items-center gap-2">
                      <span className="text-sm text-muted-foreground">{g.label}</span>
                      <div className="h-2 bg-muted rounded">
                        <div className="h-2 bg-primary rounded" style={{ width: `${g.pct}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{g.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Genders</h3>
                <div className="space-y-2">
                  {trend!.genders.map((g) => (
                    <div key={g.label} className="grid grid-cols-[6rem_1fr_auto] items-center gap-2">
                      <span className="text-sm text-muted-foreground">{g.label}</span>
                      <div className="h-2 bg-muted rounded">
                        <div className="h-2 bg-primary rounded" style={{ width: `${g.pct}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{g.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {trend!.posts.map((p, idx) => (
                <li key={idx} className="text-sm">
                  <div className="text-muted-foreground mb-1">{p.source.toUpperCase()} · {p.author}</div>
                  <div>{p.text}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}