// src/types/index.ts

export interface VideoProject {
  id: string;
  status: 'draft' | 'generating' | 'composing' | 'uploading' | 'complete' | 'failed';
  topic: string;
  style: VideoStyle;
  script: Script | null;
  scenes: Scene[];
  finalVideoUrl: string | null;
  muxPlaybackId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoStyle = 'energetic' | 'calm' | 'professional';

export interface Script {
  hook: string;
  scenes: SceneScript[];
  cta: string;
  totalDuration: number;
}

export interface SceneScript {
  id: string;
  order: number;
  narration: string;
  visualPrompt: string;
  duration: number;
}

export interface Scene {
  id: string;
  order: number;
  narration: string;
  visualPrompt: string;
  audioUrl: string | null;
  audioDuration: number | null;
  videoUrl: string | null;
  status: 'pending' | 'generating_audio' | 'generating_video' | 'complete' | 'failed';
}

export interface GenerationJob {
  id: string;
  projectId: string;
  status: 'pending' | 'script' | 'audio' | 'video' | 'composing' | 'uploading' | 'complete' | 'failed';
  currentStep: string;
  progress: number;
  error: string | null;
}

export interface GenerateRequest {
  topic: string;
  style?: VideoStyle;
  voiceId?: string;
}

export interface GenerateResponse {
  projectId: string;
  jobId: string;
}

export interface ScriptRequest {
  topic: string;
  style?: VideoStyle;
  duration?: number;
}

export interface ScriptResponse {
  script: Script;
}

export interface StatusResponse {
  status: GenerationJob['status'];
  progress: number;
  currentStep: string;
  scenes: Scene[];
  finalVideoUrl?: string;
  muxPlaybackId?: string;
  error?: string;
}

export interface RemotionVideoProps {
  scenes: Scene[];
  fps: number;
  width: number;
  height: number;
}
