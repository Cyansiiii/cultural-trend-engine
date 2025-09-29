"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { useState } from "react";

export default function GeneratorPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/sign-in?redirect=/generator");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) return null;

  const search = useSearchParams();

  const [trends, setTrends] = useState<Array<{
    slug: string;
    title: string;
    velocity: number;
    sentiment: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendSlug, setTrendSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [tone, setTone] = useState("friendly");
  const [ideas, setIdeas] = useState<string[]>([]);

  // Load trends list
  React.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(`/api/trends?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Failed to load trends (${res.status})`);
        const data = await res.json();
        if (cancel) return;
        const list = Array.isArray(data) ? data : [];
        setTrends(list);

        // Initialize selected slug from URL or first item
        const initial = search.get("trend") || list[0]?.slug || "";
        setTrendSlug(initial);
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Failed to load trends");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [search]);

  async function generateIdeas() {
    setIdeas([]);
    if (!trendSlug) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch(`/api/trends?slug=${encodeURIComponent(trendSlug)}` , {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Failed to load trend (${res.status})`);
      const full = await res.json();

      const regionName: string = Array.isArray(full.regions) && full.regions[0]?.region
        ? String(full.regions[0].region)
        : "your top region";
      const velocity: number = Number(full.velocity ?? 0);
      const sentimentLabel: string = String(full.sentiment ?? "neutral");
      const title: string = String(full.title ?? trendSlug);

      const b = brand || "your brand";
      const base = [
        `TikTok hook (${tone}): POV you crave ${title.toLowerCase()} — ${b} shows how to get the look without the label.`,
        `X thread: Why ${title} matters now — velocity ${velocity}% and ${sentimentLabel} sentiment. Tie it to ${b} with a timely giveaway.`,
        `IG carousel: ${title} starter pack + 3 myths debunked. CTA: Comment your take for a chance to win a ${b} bundle.`,
        `Email subject: ${title} is peaking — here's a ${b} edit you'll actually wear.`,
        `Collab idea: Partner with a micro-creator in top region (${regionName}) to co-create a ${title} challenge with ${b}.`,
      ];
      setIdeas(base);
    } catch (e: any) {
      setIdeas([e?.message ?? "Failed to generate ideas. Try again."]);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Content Generator</h1>

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={trendSlug} onValueChange={setTrendSlug}>
              <SelectTrigger className="min-w-56"><SelectValue placeholder="Select trend" /></SelectTrigger>
              <SelectContent>
                {trends.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Brand or product" value={brand} onChange={(e) => setBrand(e.target.value)} className="flex-1 min-w-56" />
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="min-w-40"><SelectValue placeholder="Tone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateIdeas}>Generate</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {ideas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Choose a trend and click Generate to see ideas.</p>
        ) : (
          ideas.map((idea, i) => (
            <Textarea key={i} readOnly value={idea} className="min-h-24" />
          ))
        )}
      </div>
    </div>
  );
}