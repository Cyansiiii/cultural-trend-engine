import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const authHeader = headers().get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.trendSlug || !body.brandVoice) {
      return NextResponse.json({ error: "Missing trendSlug or brandVoice" }, { status: 400 });
    }

    // TODO: Proxy to generative model API (e.g., OpenAI/Groq via FastAPI)
    // For now, mock content response
    const mockResponse = {
      headlines: ["Trend-aligned headline 1", "Cultural hook 2"],
      hooks: ["Engaging opener based on sentiment"],
      captions: ["Social media caption suggestion"],
      emailCopy: ["Personalized email draft"],
    };

    // Real integration example:
    // const genRes = await fetch(`${process.env.MODEL_API_BASE_URL}/generate`, {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${process.env.MODEL_API_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify(body),
    // });
    // if (!genRes.ok) throw new Error("Generation API failed");
    // const data = await genRes.json();

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Content generation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}