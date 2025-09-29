"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/sign-in?redirect=/settings");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) return null;

  const [apiKey, setApiKey] = React.useState("");
  const [notifications, setNotifications] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const s = localStorage.getItem("cre_settings");
      if (s) {
        const parsed = JSON.parse(s) as { apiKey?: string; notifications?: boolean };
        setApiKey(parsed.apiKey ?? "");
        setNotifications(!!parsed.notifications);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  function handleSave() {
    setSaving(true);
    const payload = { apiKey: apiKey.trim(), notifications };
    localStorage.setItem("cre_settings", JSON.stringify(payload));
    setTimeout(() => {
      setSaving(false);
      setSavedAt(new Date().toLocaleTimeString());
    }, 300);
  }

  function handleClear() {
    setApiKey("");
    setNotifications(false);
    localStorage.removeItem("cre_settings");
    setSavedAt(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage API keys and notification preferences for the Cultural Resonance Engine.</p>
      </div>

      <section className="space-y-3">
        <label className="text-sm font-medium" htmlFor="apiKey">API Key</label>
        <Input
          id="apiKey"
          type="password"
          placeholder="••••••••••••"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Your key is stored locally in your browser (never sent to a server in this demo).</p>
      </section>

      <section className="flex items-center justify-between border rounded-lg p-4">
        <div>
          <div className="text-sm font-medium">Notifications</div>
          <div className="text-xs text-muted-foreground">Receive alerts when tracked trends spike or sentiment shifts.</div>
        </div>
        <Switch checked={notifications} onCheckedChange={setNotifications} />
      </section>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
        <Button variant="outline" onClick={handleClear}>Clear</Button>
        {savedAt && <span className="text-xs text-muted-foreground self-center">Saved at {savedAt}</span>}
      </div>
    </div>
  );
}