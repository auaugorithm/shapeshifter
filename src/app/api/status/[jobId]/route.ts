import { NextRequest, NextResponse } from "next/server";
import { getJob, getProject } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const project = getProject(job.projectId);

    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      scenes: project?.scenes || [],
      finalVideoUrl: project?.finalVideoUrl || undefined,
      muxPlaybackId: project?.muxPlaybackId || undefined,
      error: job.error || undefined,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
