import { useSession } from "@/lib/auth-client";

export function useSendEvent() {
  const { data: session, isPending: sessionLoading } = useSession();

  const sendEvent = async (event: {
    type: string;
    meta?: Record<string, any>;
  }) => {
    if (typeof window === "undefined" || sessionLoading) return;

    const payload = {
      userId: session?.user?.id || "anonymous",
      sessionId: session?.session?.id || localStorage.getItem("session_id") || crypto.randomUUID(),
      type: event.type,
      ts: new Date().toISOString(),
      url: window.location.pathname,
      meta: event.meta,
    };

    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn("Event send failed:", error);
    }
  };

  return { sendEvent };
}