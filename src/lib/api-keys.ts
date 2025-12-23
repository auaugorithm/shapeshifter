// Client-side API key management using localStorage

export interface ApiKeys {
  openrouter?: string;
  elevenlabs?: string;
  elevenlabsVoiceId?: string;
  runway?: string;
  muxTokenId?: string;
  muxTokenSecret?: string;
}

const STORAGE_KEY = "ugc-video-creator-api-keys";

export function getApiKeys(): ApiKeys {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeys): void {
  if (typeof window === "undefined") return;

  // Merge with existing keys
  const existing = getApiKeys();
  const merged = { ...existing, ...keys };

  // Remove empty values
  Object.keys(merged).forEach((key) => {
    if (!merged[key as keyof ApiKeys]) {
      delete merged[key as keyof ApiKeys];
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function clearApiKeys(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasRequiredKeys(): boolean {
  const keys = getApiKeys();
  // At minimum, need OpenRouter for script generation
  return Boolean(keys.openrouter);
}

export function getConfiguredServices(): string[] {
  const keys = getApiKeys();
  const services: string[] = [];

  if (keys.openrouter) services.push("OpenRouter (LLM)");
  if (keys.elevenlabs) services.push("ElevenLabs (Voice)");
  if (keys.runway) services.push("Runway (Video)");
  if (keys.muxTokenId && keys.muxTokenSecret) services.push("Mux (Hosting)");

  return services;
}

// Create headers object for API calls
export function getApiHeaders(): Record<string, string> {
  const keys = getApiKeys();
  const headers: Record<string, string> = {};

  if (keys.openrouter) headers["x-openrouter-key"] = keys.openrouter;
  if (keys.elevenlabs) headers["x-elevenlabs-key"] = keys.elevenlabs;
  if (keys.elevenlabsVoiceId) headers["x-elevenlabs-voice-id"] = keys.elevenlabsVoiceId;
  if (keys.runway) headers["x-runway-key"] = keys.runway;
  if (keys.muxTokenId) headers["x-mux-token-id"] = keys.muxTokenId;
  if (keys.muxTokenSecret) headers["x-mux-token-secret"] = keys.muxTokenSecret;

  return headers;
}
