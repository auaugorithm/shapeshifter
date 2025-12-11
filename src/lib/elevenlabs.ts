const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
}

export interface AudioResult {
  audioBuffer: Buffer;
  durationSeconds: number;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

export async function textToSpeech(options: TextToSpeechOptions): Promise<AudioResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel
  const modelId = options.modelId || "eleven_turbo_v2_5";

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: options.text,
        model_id: modelId,
        voice_settings: options.voiceSettings || DEFAULT_VOICE_SETTINGS,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);

  // Estimate duration based on text length (approximately 150 words per minute)
  // This is a rough estimate; actual duration comes from the audio file
  const wordCount = options.text.split(/\s+/).length;
  const estimatedDuration = (wordCount / 150) * 60;

  // For more accurate duration, we'd need to decode the MP3
  // Using estimate for now
  const durationSeconds = Math.max(estimatedDuration, 2);

  return {
    audioBuffer,
    durationSeconds,
  };
}

export async function getVoices(): Promise<Array<{ voice_id: string; name: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.voices.map((voice: { voice_id: string; name: string }) => ({
    voice_id: voice.voice_id,
    name: voice.name,
  }));
}

export async function generateNarrationAudio(
  narration: string,
  voiceId?: string
): Promise<{ audioUrl: string; duration: number }> {
  const result = await textToSpeech({
    text: narration,
    voiceId,
  });

  // In a production environment, you'd upload this to S3/R2
  // For now, we'll convert to base64 data URL
  const base64Audio = result.audioBuffer.toString("base64");
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

  return {
    audioUrl,
    duration: result.durationSeconds,
  };
}
