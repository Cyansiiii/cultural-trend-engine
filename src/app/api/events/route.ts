import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const authHeader = headers().get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.type || typeof body.userId !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // TODO: Proxy to stream provider based on env (STREAM_PROVIDER)
    // For now, mock: log to console/server logs; later: integrate with Kafka/Kinesis/PubSub
    console.log("Event ingested:", body);

    // Optional: Store in DB for fallback (if using database_agent for events table)
    // await db.insert(eventsTable).values({ ...body, createdAt: new Date() });

    // Env-driven forwarding example (add env vars later)
    const streamProvider = process.env.STREAM_PROVIDER;
    if (streamProvider === "kinesis") {
      // await kinesis.putRecord({ StreamName: process.env.KINESIS_STREAM, Data: JSON.stringify(body) });
    } else if (streamProvider === "pubsub") {
      // await pubsub.topic(process.env.PUBSUB_TOPIC).publish(Buffer.from(JSON.stringify(body)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event ingestion failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}