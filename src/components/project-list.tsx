"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VideoProject } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import {
  Clock,
  Film,
  Loader2,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function ProjectList() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const getStatusBadge = (status: VideoProject["status"]) => {
    const variants: Record<VideoProject["status"], { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; icon: React.ReactNode }> = {
      draft: { variant: "secondary", icon: null },
      generating: { variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      composing: { variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      uploading: { variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      complete: { variant: "success", icon: <CheckCircle className="h-3 w-3" /> },
      failed: { variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
    };

    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1 capitalize">
        {icon}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first video above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(project.status)}
                {project.script && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(project.script.totalDuration)}
                  </span>
                )}
              </div>
              <p className="font-medium truncate">{project.topic}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {project.status === "complete" && project.muxPlaybackId && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    <Play className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {(project.status === "generating" || project.status === "composing" || project.status === "uploading") && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    View Progress
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(project.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
