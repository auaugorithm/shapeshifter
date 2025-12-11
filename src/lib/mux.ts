import Mux from "@mux/mux-node";

let muxClient: Mux | null = null;

function getMuxClient(): Mux {
  if (!muxClient) {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET must be configured");
    }

    muxClient = new Mux({
      tokenId,
      tokenSecret,
    });
  }

  return muxClient;
}

export interface MuxUploadResult {
  assetId: string;
  playbackId: string;
  uploadId: string;
}

export async function createDirectUpload(): Promise<{
  uploadUrl: string;
  uploadId: string;
}> {
  const mux = getMuxClient();

  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    new_asset_settings: {
      playback_policies: ["public"],
      encoding_tier: "baseline",
    },
  });

  return {
    uploadUrl: upload.url,
    uploadId: upload.id,
  };
}

export async function uploadVideoFromUrl(videoUrl: string): Promise<MuxUploadResult> {
  const mux = getMuxClient();

  const asset = await mux.video.assets.create({
    inputs: [{ url: videoUrl }],
    playback_policies: ["public"],
    encoding_tier: "baseline",
  });

  const playbackId = asset.playback_ids?.[0]?.id;
  if (!playbackId) {
    throw new Error("Failed to get playback ID from Mux asset");
  }

  return {
    assetId: asset.id,
    playbackId,
    uploadId: asset.id,
  };
}

export async function getAssetStatus(assetId: string): Promise<{
  status: string;
  playbackId: string | null;
  duration: number | null;
}> {
  const mux = getMuxClient();

  const asset = await mux.video.assets.retrieve(assetId);

  return {
    status: asset.status,
    playbackId: asset.playback_ids?.[0]?.id || null,
    duration: asset.duration || null,
  };
}

export async function waitForAssetReady(
  assetId: string,
  maxWaitMs: number = 120000,
  pollIntervalMs: number = 3000
): Promise<{ playbackId: string; duration: number }> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getAssetStatus(assetId);

    if (status.status === "ready" && status.playbackId) {
      return {
        playbackId: status.playbackId,
        duration: status.duration || 0,
      };
    }

    if (status.status === "errored") {
      throw new Error("Mux asset processing failed");
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error("Mux asset processing timed out");
}

export function getPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function getThumbnailUrl(playbackId: string, time: number = 0): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}`;
}

export function getGifUrl(playbackId: string, start: number = 0, end: number = 5): string {
  return `https://image.mux.com/${playbackId}/animated.gif?start=${start}&end=${end}`;
}
