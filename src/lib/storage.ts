import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const STORAGE_DIR = path.join(process.cwd(), ".storage");

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

export async function saveAudioFile(audioBuffer: Buffer): Promise<string> {
  await ensureStorageDir();

  const filename = `audio-${uuidv4()}.mp3`;
  const filepath = path.join(STORAGE_DIR, filename);

  await fs.writeFile(filepath, audioBuffer);

  // Return a URL-like path for local development
  return `file://${filepath}`;
}

export async function saveVideoFile(videoBuffer: Buffer): Promise<string> {
  await ensureStorageDir();

  const filename = `video-${uuidv4()}.mp4`;
  const filepath = path.join(STORAGE_DIR, filename);

  await fs.writeFile(filepath, videoBuffer);

  return `file://${filepath}`;
}

export async function downloadFile(url: string): Promise<Buffer> {
  if (url.startsWith("file://")) {
    const filepath = url.replace("file://", "");
    return fs.readFile(filepath);
  }

  if (url.startsWith("data:")) {
    // Handle base64 data URLs
    const matches = url.match(/^data:[^;]+;base64,(.+)$/);
    if (matches) {
      return Buffer.from(matches[1], "base64");
    }
  }

  // Download from HTTP URL
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function cleanupStorage(): Promise<void> {
  try {
    const files = await fs.readdir(STORAGE_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filepath = path.join(STORAGE_DIR, file);
      const stats = await fs.stat(filepath);

      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filepath);
      }
    }
  } catch {
    // Storage directory doesn't exist or other error
  }
}
