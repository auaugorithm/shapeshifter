import { NextRequest, NextResponse } from "next/server";

// Runway webhook handler for async video generation completion
// This is called by Runway when a video generation task completes

interface RunwayWebhookPayload {
  id: string;
  status: "SUCCEEDED" | "FAILED";
  output?: string[];
  failure?: string;
  failureCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: RunwayWebhookPayload = await request.json();

    console.log("Runway webhook received:", payload);

    // In a full implementation, you would:
    // 1. Find the scene associated with this task ID
    // 2. Update the scene with the video URL or error
    // 3. Trigger the next step if all scenes are complete

    // For now, we'll just acknowledge the webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Runway webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
