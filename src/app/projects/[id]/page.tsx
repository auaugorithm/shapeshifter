"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { VideoProject, GenerationJob } from "@/types";
import { ProgressTracker } from "@/components/progress-tracker";
import { VideoPlayer } from "@/components/video-player";
import { SceneEditor } from "@/components/scene-editor";
import { ScriptPreview } from "@/components/script-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<VideoProject | null>(null);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Project not found");
        const data = await response.json();
        setProject(data.project);
        setJob(data.job);

        if (data.project.status === "complete") {
          setIsComplete(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleComplete = (data: { finalVideoUrl: string; muxPlaybackId: string }) => {
    setIsComplete(true);
    if (project) {
      setProject({
        ...project,
        status: "complete",
        finalVideoUrl: data.finalVideoUrl,
        muxPlaybackId: data.muxPlaybackId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">Project Not Found</h1>
        <p className="text-muted-foreground">{error || "The project you're looking for doesn't exist."}</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{project.topic}</h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(project.createdAt).toLocaleString()}
          </p>
        </header>

        {isComplete && project.muxPlaybackId ? (
          <div className="space-y-8">
            <VideoPlayer
              playbackId={project.muxPlaybackId}
              title={project.topic}
            />

            {project.script && (
              <Tabs defaultValue="scenes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scenes">Scenes</TabsTrigger>
                  <TabsTrigger value="script">Script</TabsTrigger>
                </TabsList>
                <TabsContent value="scenes">
                  <SceneEditor scenes={project.scenes} readOnly />
                </TabsContent>
                <TabsContent value="script">
                  <ScriptPreview script={project.script} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : job ? (
          <div className="space-y-8">
            <ProgressTracker
              jobId={job.id}
              onComplete={handleComplete}
              onError={(err) => setError(err)}
            />

            {project.scenes.length > 0 && (
              <SceneEditor scenes={project.scenes} readOnly />
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No generation job found for this project.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/">Start New Video</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
