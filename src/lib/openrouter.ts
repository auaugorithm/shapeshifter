import { Script, VideoStyle } from "@/types";
import { buildScriptPrompt } from "./prompts";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateScript(
  topic: string,
  style: VideoStyle = "energetic",
  duration: number = 30
): Promise<Script> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const prompt = buildScriptPrompt(topic, style, duration);

  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content:
        "You are a professional UGC video script writer. Always respond with valid JSON only.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "UGC Video Creator",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  try {
    const script = JSON.parse(content) as Script;

    // Validate the script structure
    if (!script.hook || !script.scenes || !script.cta) {
      throw new Error("Invalid script structure: missing required fields");
    }

    // Ensure scenes have proper IDs and order
    script.scenes = script.scenes.map((scene, index) => ({
      ...scene,
      id: scene.id || `scene-${index + 1}`,
      order: index + 1,
      duration: scene.duration || 5,
    }));

    // Calculate total duration if not provided
    if (!script.totalDuration) {
      script.totalDuration =
        script.scenes.reduce((sum, scene) => sum + scene.duration, 0) + 6; // +6 for hook and CTA
    }

    return script;
  } catch (parseError) {
    console.error("Failed to parse script JSON:", content);
    throw new Error(`Failed to parse script response: ${parseError}`);
  }
}

export async function enhanceVisualPrompt(basicPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "UGC Video Creator",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Enhance this visual prompt for AI video generation. Keep it under 200 characters. Return only the enhanced prompt, nothing else.\n\nOriginal: ${basicPrompt}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    return basicPrompt; // Fall back to original on error
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content?.trim() || basicPrompt;
}
