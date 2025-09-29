"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

// Simple chat message type matching our API shape
type ChatRole = "user" | "assistant" | "system";
interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const SupportChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI support assistant. Ask me anything about trends, charts, or generating content.",
    },
  ]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length, open]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || pending) return;

    setError(null);
    setPending(true);
    setInput("");

    const newHistory = [...history, { role: "user", content: message }];
    setHistory(newHistory);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, history: newHistory }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { reply?: string };
      const reply = data?.reply?.trim();
      setHistory((h) => [...h, { role: "assistant", content: reply || "I couldn't form a reply this time." }]);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggle = () => setOpen((o) => !o);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={toggle}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-4)] text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="support-chat"
            className="fixed bottom-20 right-5 z-40 w-[min(92vw,360px)] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--chart-2)]" />
                <h3 className="text-sm font-semibold">AI Support</h3>
              </div>
              <button onClick={toggle} className="rounded-md p-1 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="max-h-80 overflow-y-auto px-3 py-3 space-y-2">
              {history.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      "rounded-lg px-3 py-2 text-sm " +
                      (m.role === "user"
                        ? "bg-[var(--chart-1)] text-white shadow"
                        : "bg-secondary text-secondary-foreground border")
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]" />
                      <span className="ml-1">Typing…</span>
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t p-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about trends, charts, or features…"
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoComplete="off"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};