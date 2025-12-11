import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { Scene } from "@/types";
import { calculateTotalFrames } from "@/remotion/utils/audio";

const REMOTION_ENTRY = path.join(process.cwd(), "src/remotion/index.ts");

export interface RenderVideoOptions {
  scenes: Scene[];
  outputPath: string;
  fps?: number;
  width?: number;
  height?: number;
  hookText?: string;
  ctaText?: string;
}

export async function renderVideo(options: RenderVideoOptions): Promise<string> {
  const {
    scenes,
    outputPath,
    fps = 30,
    width = 1080,
    height = 1920,
    hookText = "Watch this!",
    ctaText = "Follow for more!",
  } = options;

  console.log("Bundling Remotion project...");

  // Bundle the Remotion project
  const bundleLocation = await bundle({
    entryPoint: REMOTION_ENTRY,
    // Enable caching for faster subsequent renders
    onProgress: (progress) => {
      if (progress % 10 === 0) {
        console.log(`Bundling: ${progress}%`);
      }
    },
  });

  console.log("Bundle created at:", bundleLocation);

  // Calculate total frames based on scene durations
  const totalFrames = calculateTotalFrames(scenes, fps);

  // Select the composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "UGCVideo",
    inputProps: {
      scenes,
      fps,
      width,
      height,
      hookText,
      ctaText,
    },
  });

  // Override duration if calculated differently
  const finalComposition = {
    ...composition,
    durationInFrames: totalFrames,
    width,
    height,
    fps,
  };

  console.log("Rendering video...");
  console.log(`Duration: ${totalFrames} frames (${totalFrames / fps}s)`);

  // Render the video
  await renderMedia({
    composition: finalComposition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: {
      scenes,
      fps,
      width,
      height,
      hookText,
      ctaText,
    },
    onProgress: ({ progress }) => {
      if (Math.floor(progress * 100) % 10 === 0) {
        console.log(`Rendering: ${Math.floor(progress * 100)}%`);
      }
    },
  });

  console.log("Video rendered successfully:", outputPath);
  return outputPath;
}

export async function renderVideoToBuffer(
  options: Omit<RenderVideoOptions, "outputPath">
): Promise<Buffer> {
  const tempPath = path.join("/tmp", `video-${Date.now()}.mp4`);

  await renderVideo({
    ...options,
    outputPath: tempPath,
  });

  const fs = await import("fs/promises");
  const buffer = await fs.readFile(tempPath);

  // Clean up temp file
  await fs.unlink(tempPath).catch(() => {});

  return buffer;
}
