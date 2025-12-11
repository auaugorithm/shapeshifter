import type { VideoStyle } from "@/types";

export const SCRIPT_PROMPT = `You are a UGC (User Generated Content) video script writer.
Create engaging, scroll-stopping short-form video scripts.

Topic: {topic}
Style: {style}
Target Duration: {duration} seconds

Output a JSON object with this exact structure:
{
  "hook": "Opening line that grabs attention in first 2 seconds",
  "scenes": [
    {
      "id": "scene-1",
      "order": 1,
      "narration": "What the voiceover will say",
      "visualPrompt": "Detailed prompt for AI video generation describing the visual",
      "duration": 5
    }
  ],
  "cta": "Call to action text for the end",
  "totalDuration": 30
}

Rules:
- Hook must be provocative, surprising, or create curiosity
- Each scene narration should be 10-20 words (speakable in ~5 seconds)
- Visual prompts should be specific, cinematic, describe camera movement
- 4-6 scenes total
- CTA should drive engagement (follow, comment, save)
- totalDuration should be the sum of all scene durations plus ~6 seconds for hook and CTA

Example visual prompts:
- "Close-up of hands typing on a laptop, soft natural lighting, shallow depth of field, slight camera push in"
- "Person walking confidently down a city street, golden hour, tracking shot from the side"
- "Aesthetic flat lay of productivity items on marble surface, top-down view, subtle zoom out"
- "Dynamic shot of coffee being poured into a ceramic mug, steam rising, warm indoor lighting, macro lens"
- "Silhouette of a person against sunset sky, time-lapse clouds moving, inspirational mood"

Style Guidelines:
- Energetic: Fast cuts, bold visuals, high contrast, action-oriented prompts
- Calm: Slow movements, soft lighting, nature elements, peaceful scenes
- Professional: Clean aesthetics, minimal style, modern office/workspace settings

Return ONLY valid JSON, no additional text.`;

export function buildScriptPrompt(
  topic: string,
  style: VideoStyle = 'energetic',
  duration: number = 30
): string {
  return SCRIPT_PROMPT
    .replace('{topic}', topic)
    .replace('{style}', style)
    .replace('{duration}', duration.toString());
}

export const VISUAL_PROMPT_ENHANCEMENT = `You are an expert at writing prompts for AI video generation (like Runway Gen-3).

Given a basic visual description, enhance it to create the best possible video generation prompt.

Rules for good Runway prompts:
- Include camera movement (pan, zoom, tracking, static, dolly)
- Specify lighting (natural, golden hour, studio, moody, soft, dramatic)
- Describe the main action clearly
- Add style keywords (cinematic, documentary, aesthetic, minimalist)
- Include depth of field when relevant (shallow, deep)
- Mention framing (close-up, wide shot, medium shot, overhead)

Avoid:
- Text or words in the scene
- Specific real faces or identities
- Complex multi-subject scenes
- Abstract concepts that can't be visualized

Original description: {description}

Return only the enhanced prompt, no explanation.`;

export function buildVisualPromptEnhancement(description: string): string {
  return VISUAL_PROMPT_ENHANCEMENT.replace('{description}', description);
}
