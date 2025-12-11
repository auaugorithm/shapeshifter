import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Scene as SceneType } from "@/types";
import { Scene } from "./components/Scene";
import { Hook } from "./components/Hook";
import { CTA } from "./components/CTA";

export interface UGCVideoProps {
  scenes: SceneType[];
  fps: number;
  width: number;
  height: number;
  hookText?: string;
  ctaText?: string;
}

export const UGCVideo: React.FC<UGCVideoProps> = ({
  scenes,
  hookText = "Watch this!",
  ctaText = "Follow for more!",
}) => {
  const { fps } = useVideoConfig();

  const hookDuration = 2 * fps; // 2 seconds for hook
  const ctaDuration = 3 * fps; // 3 seconds for CTA

  let currentFrame = 0;

  // Calculate frame positions for each scene
  const sceneTimings = scenes.map((scene) => {
    const duration = Math.ceil((scene.audioDuration || 5) * fps);
    const startFrame = currentFrame;
    currentFrame += duration;
    return { scene, startFrame, duration };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Hook at the beginning */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <Hook text={hookText} />
      </Sequence>

      {/* Main scenes */}
      {sceneTimings.map(({ scene, startFrame, duration }, index) => (
        <Sequence
          key={scene.id}
          from={hookDuration + startFrame}
          durationInFrames={duration}
        >
          <Scene
            scene={scene}
            index={index}
            totalScenes={scenes.length}
          />
        </Sequence>
      ))}

      {/* CTA at the end */}
      <Sequence
        from={hookDuration + currentFrame}
        durationInFrames={ctaDuration}
      >
        <CTA text={ctaText} />
      </Sequence>
    </AbsoluteFill>
  );
};
