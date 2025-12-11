import { sleep } from "./utils";

const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";

interface RunwayTaskResponse {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  output?: string[];
  failure?: string;
  failureCode?: string;
}

interface GenerateVideoOptions {
  prompt: string;
  duration?: 5 | 10;
  ratio?: "16:9" | "9:16" | "1:1";
  watermark?: boolean;
}

export async function createVideoGeneration(
  options: GenerateVideoOptions
): Promise<string> {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    throw new Error("RUNWAY_API_KEY is not configured");
  }

  const response = await fetch(`${RUNWAY_API_URL}/text_to_video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify({
      model: "gen4_turbo",
      promptText: options.prompt,
      duration: options.duration || 5,
      ratio: options.ratio || "9:16",
      watermark: options.watermark ?? false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.id;
}

export async function getTaskStatus(taskId: string): Promise<RunwayTaskResponse> {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    throw new Error("RUNWAY_API_KEY is not configured");
  }

  const response = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Runway-Version": "2024-11-06",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function waitForVideoCompletion(
  taskId: string,
  maxWaitMs: number = 300000,
  pollIntervalMs: number = 5000
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getTaskStatus(taskId);

    if (status.status === "SUCCEEDED") {
      if (!status.output || status.output.length === 0) {
        throw new Error("Video generation succeeded but no output URL");
      }
      return status.output[0];
    }

    if (status.status === "FAILED") {
      throw new Error(
        `Video generation failed: ${status.failure || status.failureCode || "Unknown error"}`
      );
    }

    await sleep(pollIntervalMs);
  }

  throw new Error("Video generation timed out");
}

export async function generateVideo(
  prompt: string,
  duration: 5 | 10 = 5
): Promise<string> {
  const taskId = await createVideoGeneration({
    prompt,
    duration,
    ratio: "9:16",
  });

  const videoUrl = await waitForVideoCompletion(taskId);
  return videoUrl;
}

export async function generateVideoWithCallback(
  prompt: string,
  onProgress?: (status: string) => void,
  duration: 5 | 10 = 5
): Promise<string> {
  const taskId = await createVideoGeneration({
    prompt,
    duration,
    ratio: "9:16",
  });

  onProgress?.("Video generation started");

  const startTime = Date.now();
  const maxWaitMs = 300000;
  const pollIntervalMs = 5000;

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getTaskStatus(taskId);
    onProgress?.(`Status: ${status.status}`);

    if (status.status === "SUCCEEDED") {
      if (!status.output || status.output.length === 0) {
        throw new Error("Video generation succeeded but no output URL");
      }
      return status.output[0];
    }

    if (status.status === "FAILED") {
      throw new Error(
        `Video generation failed: ${status.failure || status.failureCode || "Unknown error"}`
      );
    }

    await sleep(pollIntervalMs);
  }

  throw new Error("Video generation timed out");
}
