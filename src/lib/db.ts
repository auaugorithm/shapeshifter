import { VideoProject, GenerationJob, Scene } from "@/types";
import { v4 as uuidv4 } from "uuid";

// In-memory database for development
// In production, replace with Convex, Postgres, or another database

interface Database {
  projects: Map<string, VideoProject>;
  jobs: Map<string, GenerationJob>;
}

const db: Database = {
  projects: new Map(),
  jobs: new Map(),
};

// Project operations
export function createProject(topic: string, style: VideoProject["style"] = "energetic"): VideoProject {
  const project: VideoProject = {
    id: uuidv4(),
    status: "draft",
    topic,
    style,
    script: null,
    scenes: [],
    finalVideoUrl: null,
    muxPlaybackId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.projects.set(project.id, project);
  return project;
}

export function getProject(id: string): VideoProject | null {
  return db.projects.get(id) || null;
}

export function updateProject(id: string, updates: Partial<VideoProject>): VideoProject | null {
  const project = db.projects.get(id);
  if (!project) return null;

  const updated = {
    ...project,
    ...updates,
    updatedAt: new Date(),
  };

  db.projects.set(id, updated);
  return updated;
}

export function getAllProjects(): VideoProject[] {
  return Array.from(db.projects.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function deleteProject(id: string): boolean {
  return db.projects.delete(id);
}

// Job operations
export function createJob(projectId: string): GenerationJob {
  const job: GenerationJob = {
    id: uuidv4(),
    projectId,
    status: "pending",
    currentStep: "Initializing",
    progress: 0,
    error: null,
  };

  db.jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): GenerationJob | null {
  return db.jobs.get(id) || null;
}

export function getJobByProjectId(projectId: string): GenerationJob | null {
  return Array.from(db.jobs.values()).find(
    (job) => job.projectId === projectId
  ) || null;
}

export function updateJob(id: string, updates: Partial<GenerationJob>): GenerationJob | null {
  const job = db.jobs.get(id);
  if (!job) return null;

  const updated = {
    ...job,
    ...updates,
  };

  db.jobs.set(id, updated);
  return updated;
}

export function deleteJob(id: string): boolean {
  return db.jobs.delete(id);
}

// Scene operations
export function updateSceneInProject(
  projectId: string,
  sceneId: string,
  updates: Partial<Scene>
): VideoProject | null {
  const project = db.projects.get(projectId);
  if (!project) return null;

  const sceneIndex = project.scenes.findIndex((s) => s.id === sceneId);
  if (sceneIndex === -1) return null;

  project.scenes[sceneIndex] = {
    ...project.scenes[sceneIndex],
    ...updates,
  };

  project.updatedAt = new Date();
  db.projects.set(projectId, project);
  return project;
}

// Helper to convert SceneScript to Scene
export function scriptScenesToScenes(
  scriptScenes: Array<{
    id: string;
    order: number;
    narration: string;
    visualPrompt: string;
    duration: number;
  }>
): Scene[] {
  return scriptScenes.map((scriptScene) => ({
    id: scriptScene.id,
    order: scriptScene.order,
    narration: scriptScene.narration,
    visualPrompt: scriptScene.visualPrompt,
    audioUrl: null,
    audioDuration: scriptScene.duration,
    videoUrl: null,
    status: "pending" as const,
  }));
}

// Debug function to view database contents
export function debugDb(): { projects: VideoProject[]; jobs: GenerationJob[] } {
  return {
    projects: Array.from(db.projects.values()),
    jobs: Array.from(db.jobs.values()),
  };
}
