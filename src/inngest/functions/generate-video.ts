import { inngest } from "../client";
import { generateScript } from "@/lib/openrouter";
import { generateNarrationAudio } from "@/lib/elevenlabs";
import { generateVideo } from "@/lib/runway";
import { uploadVideoFromUrl } from "@/lib/mux";
import {
  getProject,
  updateProject,
  getJob,
  updateJob,
  scriptScenesToScenes,
  updateSceneInProject,
} from "@/lib/db";
import { VideoStyle } from "@/types";

interface GenerateVideoEvent {
  name: "video/generate";
  data: {
    projectId: string;
    jobId: string;
    topic: string;
    style: VideoStyle;
  };
}

export const generateVideoFunction = inngest.createFunction(
  {
    id: "generate-video",
    retries: 2,
  },
  { event: "video/generate" },
  async ({ event, step }) => {
    const { projectId, jobId, topic, style } = event.data;

    // Step 1: Generate script with LLM
    const script = await step.run("generate-script", async () => {
      updateJob(jobId, {
        status: "script",
        currentStep: "Generating script with AI",
        progress: 10,
      });

      const generatedScript = await generateScript(topic, style);

      // Update project with script and initial scenes
      const scenes = scriptScenesToScenes(generatedScript.scenes);
      updateProject(projectId, {
        status: "generating",
        script: generatedScript,
        scenes,
      });

      return generatedScript;
    });

    // Step 2: Generate audio for each scene (parallel)
    await step.run("generate-audio", async () => {
      updateJob(jobId, {
        status: "audio",
        currentStep: "Generating voiceover audio",
        progress: 25,
      });

      const project = getProject(projectId);
      if (!project) throw new Error("Project not found");

      // Process scenes sequentially to avoid rate limits
      for (let i = 0; i < project.scenes.length; i++) {
        const scene = project.scenes[i];

        updateSceneInProject(projectId, scene.id, {
          status: "generating_audio",
        });

        try {
          const audioResult = await generateNarrationAudio(scene.narration);

          updateSceneInProject(projectId, scene.id, {
            audioUrl: audioResult.audioUrl,
            audioDuration: audioResult.duration,
            status: "generating_video",
          });
        } catch (error) {
          console.error(`Failed to generate audio for scene ${scene.id}:`, error);
          updateSceneInProject(projectId, scene.id, {
            status: "failed",
          });
        }

        // Update progress
        const progress = 25 + Math.floor((i + 1) / project.scenes.length * 25);
        updateJob(jobId, { progress });
      }
    });

    // Step 3: Generate video clips for each scene
    await step.run("generate-videos", async () => {
      updateJob(jobId, {
        status: "video",
        currentStep: "Generating video clips",
        progress: 50,
      });

      const project = getProject(projectId);
      if (!project) throw new Error("Project not found");

      // Process scenes sequentially to respect Runway rate limits
      for (let i = 0; i < project.scenes.length; i++) {
        const scene = project.scenes[i];
        if (scene.status === "failed") continue;

        try {
          const videoUrl = await generateVideo(scene.visualPrompt, 5);

          updateSceneInProject(projectId, scene.id, {
            videoUrl,
            status: "complete",
          });
        } catch (error) {
          console.error(`Failed to generate video for scene ${scene.id}:`, error);
          // Continue with other scenes even if one fails
          updateSceneInProject(projectId, scene.id, {
            status: "failed",
          });
        }

        // Update progress
        const progress = 50 + Math.floor((i + 1) / project.scenes.length * 30);
        updateJob(jobId, { progress });
      }
    });

    // Step 4: Compose final video with Remotion
    const composedVideoUrl = await step.run("compose-video", async () => {
      updateJob(jobId, {
        status: "composing",
        currentStep: "Composing final video",
        progress: 85,
      });

      const project = getProject(projectId);
      if (!project) throw new Error("Project not found");

      updateProject(projectId, { status: "composing" });

      // In a real implementation, this would:
      // 1. Call Remotion renderer with the project scenes
      // 2. Upload the rendered video somewhere accessible
      // 3. Return the URL

      // For now, we'll simulate this by using the first video scene
      const firstVideoScene = project.scenes.find((s) => s.videoUrl);
      if (firstVideoScene?.videoUrl) {
        return firstVideoScene.videoUrl;
      }

      throw new Error("No video scenes available for composition");
    });

    // Step 5: Upload to Mux
    const muxResult = await step.run("upload-to-mux", async () => {
      updateJob(jobId, {
        status: "uploading",
        currentStep: "Uploading to streaming service",
        progress: 95,
      });

      updateProject(projectId, { status: "uploading" });

      const result = await uploadVideoFromUrl(composedVideoUrl);
      return result;
    });

    // Final step: Mark as complete
    await step.run("finalize", async () => {
      updateProject(projectId, {
        status: "complete",
        finalVideoUrl: `https://stream.mux.com/${muxResult.playbackId}.m3u8`,
        muxPlaybackId: muxResult.playbackId,
      });

      updateJob(jobId, {
        status: "complete",
        currentStep: "Video ready!",
        progress: 100,
      });
    });

    return {
      success: true,
      projectId,
      muxPlaybackId: muxResult.playbackId,
    };
  }
);
