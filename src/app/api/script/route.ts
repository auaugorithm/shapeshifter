import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateScript } from "@/lib/openrouter";
import { VideoStyle } from "@/types";

const scriptRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  style: z.enum(["energetic", "calm", "professional"]).optional().default("energetic"),
  duration: z.number().min(15).max(120).optional().default(30),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = scriptRequestSchema.parse(body);

    // Get API key from header or environment
    const apiKey = request.headers.get("x-openrouter-key") || undefined;

    const script = await generateScript({
      topic: validatedData.topic,
      style: validatedData.style as VideoStyle,
      duration: validatedData.duration,
      apiKey,
    });

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to generate script";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
