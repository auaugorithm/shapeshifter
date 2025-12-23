import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProject, createJob, updateProject } from "@/lib/db";
import { generateScript } from "@/lib/openrouter";
import { VideoStyle } from "@/types";
import { scriptScenesToScenes } from "@/lib/db";

const generateRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  style: z.enum(["energetic", "calm", "professional"]).optional().default("energetic"),
  voiceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    // Get API keys from headers
    const openrouterKey = request.headers.get("x-openrouter-key") || undefined;
    const elevenlabsKey = request.headers.get("x-elevenlabs-key") || undefined;
    const elevenlabsVoiceId = request.headers.get("x-elevenlabs-voice-id") || validatedData.voiceId;
    const runwayKey = request.headers.get("x-runway-key") || undefined;

    // Create project in database
    const project = createProject(validatedData.topic, validatedData.style as VideoStyle);

    // Create job to track generation
    const job = createJob(project.id);

    // Update project status
    updateProject(project.id, { status: "generating" });

    // Generate script immediately (synchronously for now, since Inngest needs more setup)
    try {
      const script = await generateScript({
        topic: validatedData.topic,
        style: validatedData.style as VideoStyle,
        apiKey: openrouterKey,
      });

      // Update project with script and scenes
      const scenes = scriptScenesToScenes(script.scenes);
      updateProject(project.id, {
        script,
        scenes,
        status: "complete", // For now, mark as complete after script generation
      });

      // Update job status
      const { updateJob } = await import("@/lib/db");
      updateJob(job.id, {
        status: "complete",
        currentStep: "Script generated! (Video generation coming soon)",
        progress: 100,
      });
    } catch (scriptError) {
      console.error("Script generation failed:", scriptError);
      const { updateJob } = await import("@/lib/db");
      updateJob(job.id, {
        status: "failed",
        currentStep: "Script generation failed",
        error: scriptError instanceof Error ? scriptError.message : "Unknown error",
        progress: 0,
      });
      updateProject(project.id, { status: "failed" });
    }

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

    const message = error instanceof Error ? error.message : "Failed to start video generation";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
