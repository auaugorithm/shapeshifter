import { Scene } from "@/types";

export function calculateTotalDuration(scenes: Scene[], fps: number): number {
  const hookDuration = 2; // seconds
  const ctaDuration = 3; // seconds

  const scenesDuration = scenes.reduce((total, scene) => {
    return total + (scene.audioDuration || 5);
  }, 0);

  return hookDuration + scenesDuration + ctaDuration;
}

export function calculateTotalFrames(scenes: Scene[], fps: number): number {
  return Math.ceil(calculateTotalDuration(scenes, fps) * fps);
}

export function getSceneStartFrame(
  scenes: Scene[],
  sceneIndex: number,
  fps: number
): number {
  const hookFrames = 2 * fps;

  let startFrame = hookFrames;
  for (let i = 0; i < sceneIndex; i++) {
    startFrame += Math.ceil((scenes[i].audioDuration || 5) * fps);
  }

  return startFrame;
}

export function getSceneEndFrame(
  scenes: Scene[],
  sceneIndex: number,
  fps: number
): number {
  const startFrame = getSceneStartFrame(scenes, sceneIndex, fps);
  const sceneDuration = scenes[sceneIndex].audioDuration || 5;
  return startFrame + Math.ceil(sceneDuration * fps);
}

export function estimateAudioDuration(text: string): number {
  // Approximate speaking rate: 150 words per minute
  const wordCount = text.split(/\s+/).length;
  const duration = (wordCount / 150) * 60;
  return Math.max(duration, 2); // Minimum 2 seconds
}
