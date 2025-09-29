import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const authHeader = headers().get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.segmentId || !body.platform) {
      return NextResponse.json({ error: "Missing segmentId or platform" }, { status: 400 });
    }

    // TODO: Trigger Reverse ETL (Census/Hightouch) or direct platform API (Salesforce/Braze)
    // For now, mock activation
    const mockResponse = { success: true, message: `Segment ${body.segmentId} activated on ${body.platform}` };

    // Real integration example (dry-run mode for safety):
    // if (body.dryRun) {
    //   return NextResponse.json({ dryRun: true, preview: "Would sync 150 users" });
    // }
    // const etlRes = await fetch(`${process.env.REVERSE_ETL_URL}/sync`, {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${process.env.REVERSE_ETL_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ segmentId: body.segmentId, platform: body.platform, payload: body.payload }),
    // });
    // if (!etlRes.ok) throw new Error("Activation failed");

    console.log("Activation triggered:", mockResponse);

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Activation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}