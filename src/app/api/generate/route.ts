import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProject, createJob, updateProject } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { VideoStyle } from "@/types";

const generateRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  style: z.enum(["energetic", "calm", "professional"]).optional().default("energetic"),
  voiceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    // Create project in database
    const project = createProject(validatedData.topic, validatedData.style as VideoStyle);

    // Create job to track generation
    const job = createJob(project.id);

    // Update project status
    updateProject(project.id, { status: "generating" });

    // Trigger Inngest function
    await inngest.send({
      name: "video/generate",
      data: {
        projectId: project.id,
        jobId: job.id,
        topic: validatedData.topic,
        style: validatedData.style,
        voiceId: validatedData.voiceId,
      },
    });

    return NextResponse.json({
      projectId: project.id,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Generate error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to start video generation" },
      { status: 500 }
    );
  }
}
