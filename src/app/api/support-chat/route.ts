import { NextResponse } from "next/server";

// Server-side route: AI Customer Support Chat
// Expects: { message: string, history?: { role: "user"|"assistant"|"system", content: string }[] }
// Returns: { reply: string }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history = [] } = body ?? {};

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    // Compose chat history with a focused system prompt for customer insights
    const messages = [
      {
        role: "system",
        content:
          "You are an AI customer support assistant embedded in a Cultural Resonance Engine dashboard. Your goals: 1) Answer product questions succinctly, 2) Ask short clarifying questions, 3) Capture customer intent, friction points, and requested features, 4) Be friendly and concise. Format key takeaways with bullet points when useful.",
      },
      ...history,
      { role: "user", content: message },
    ];

    // Use Chat Completions endpoint for broad compatibility
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: `Upstream error (${resp.status})`, details: errText?.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}