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

    const script = await generateScript(
      validatedData.topic,
      validatedData.style as VideoStyle,
      validatedData.duration
    );

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
