"use client";

import { useEffect, useState } from "react";
import { TrendCard } from "@/components/TrendCard";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function InsightsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/sign-in?redirect=/insights");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) return null;

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

  useEffect(() => {
    let ignore = false;
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(`/api/trends?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Failed to load trends (${res.status})`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Insights Explorer</h1>
      <p className="text-sm text-muted-foreground">Select a trend to deep dive into sentiment, demographics, and sample posts.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.map((t) => (
            <TrendCard
              key={t.slug}
              slug={t.slug}
              title={t.title}
              volume={t.volume}
              velocity={t.velocity}
              sentiment={t.sentiment as any}
              tags={t.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}