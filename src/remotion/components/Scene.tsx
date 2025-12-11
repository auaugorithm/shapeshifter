import {
  AbsoluteFill,
  Audio,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  OffthreadVideo,
  Img,
} from "remotion";
import { Scene as SceneType } from "@/types";
import { TextOverlay } from "./TextOverlay";

interface SceneProps {
  scene: SceneType;
  index: number;
  totalScenes: number;
}

export const Scene: React.FC<SceneProps> = ({ scene, index, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeInDuration = fps * 0.5; // 0.5 second fade in
  const fadeOutDuration = fps * 0.5; // 0.5 second fade out

  const opacity = interpolate(
    frame,
    [0, fadeInDuration, durationInFrames - fadeOutDuration, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Scale animation for slight zoom effect
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Generate a gradient background based on scene index
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ];

  const backgroundGradient = gradients[index % gradients.length];

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background - Video, Image, or Gradient */}
      {scene.videoUrl ? (
        <AbsoluteFill
          style={{
            transform: `scale(${scale})`,
          }}
        >
          <OffthreadVideo
            src={scene.videoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: backgroundGradient,
            transform: `scale(${scale})`,
          }}
        />
      )}

      {/* Dark overlay for better text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Scene number indicator */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 40,
          backgroundColor: "rgba(255,255,255,0.2)",
          padding: "8px 16px",
          borderRadius: 20,
          fontSize: 24,
          color: "white",
          fontWeight: 600,
        }}
      >
        {index + 1}/{totalScenes}
      </div>

      {/* Text overlay with narration */}
      <TextOverlay
        text={scene.narration}
        position="bottom"
        style="caption"
      />

      {/* Audio - only if available */}
      {scene.audioUrl && (
        <Audio src={scene.audioUrl} />
      )}
    </AbsoluteFill>
  );
};
