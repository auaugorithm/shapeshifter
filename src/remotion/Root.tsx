import { Composition } from "remotion";
import { UGCVideo } from "./Video";
import { Scene } from "@/types";

export const RemotionRoot: React.FC = () => {
  const defaultScenes: Scene[] = [
    {
      id: "scene-1",
      order: 1,
      narration: "Welcome to this amazing video!",
      visualPrompt: "Beautiful sunrise over mountains",
      audioUrl: null,
      audioDuration: 3,
      videoUrl: null,
      status: "complete",
    },
    {
      id: "scene-2",
      order: 2,
      narration: "Here is the main content.",
      visualPrompt: "Person walking through a forest",
      audioUrl: null,
      audioDuration: 4,
      videoUrl: null,
      status: "complete",
    },
    {
      id: "scene-3",
      order: 3,
      narration: "Thanks for watching!",
      visualPrompt: "Sunset over the ocean",
      audioUrl: null,
      audioDuration: 3,
      videoUrl: null,
      status: "complete",
    },
  ];

  const fps = 30;
  const totalDuration = defaultScenes.reduce(
    (sum, scene) => sum + (scene.audioDuration || 5),
    0
  );
  const durationInFrames = Math.ceil(totalDuration * fps) + 5 * fps; // Add 5s for hook and CTA

  return (
    <>
      <Composition
        id="UGCVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={UGCVideo as any}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: defaultScenes,
          fps,
          width: 1080,
          height: 1920,
        }}
      />
    </>
  );
};
