"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  FileText,
  Mic,
  Video,
  Clapperboard,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { GenerationJob, Scene } from "@/types";

interface ProgressTrackerProps {
  jobId: string;
  onComplete?: (data: { finalVideoUrl: string; muxPlaybackId: string }) => void;
  onError?: (error: string) => void;
}

interface StatusResponse {
  status: GenerationJob["status"];
  progress: number;
  currentStep: string;
  scenes: Scene[];
  finalVideoUrl?: string;
  muxPlaybackId?: string;
  error?: string;
}

const STEPS = [
  { id: "script", label: "Script", icon: FileText },
  { id: "audio", label: "Audio", icon: Mic },
  { id: "video", label: "Video Clips", icon: Video },
  { id: "composing", label: "Composing", icon: Clapperboard },
  { id: "uploading", label: "Uploading", icon: Upload },
  { id: "complete", label: "Complete", icon: Check },
];

export function ProgressTracker({
  jobId,
  onComplete,
  onError,
}: ProgressTrackerProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (!response.ok) throw new Error("Failed to fetch status");

        const data: StatusResponse = await response.json();
        setStatus(data);

        if (data.status === "complete" && data.finalVideoUrl && data.muxPlaybackId) {
          setIsPolling(false);
          onComplete?.({
            finalVideoUrl: data.finalVideoUrl,
            muxPlaybackId: data.muxPlaybackId,
          });
        } else if (data.status === "failed") {
          setIsPolling(false);
          onError?.(data.error || "Generation failed");
        }
      } catch (error) {
        console.error("Status poll error:", error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId, isPolling, onComplete, onError]);

  const getCurrentStepIndex = () => {
    if (!status) return 0;
    return STEPS.findIndex((step) => step.id === status.status);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getCompletedScenes = (type: "audio" | "video") => {
    if (!status?.scenes) return { completed: 0, total: 0 };
    const total = status.scenes.length;
    const completed = status.scenes.filter((scene) => {
      if (type === "audio") {
        return scene.audioUrl !== null;
      }
      return scene.videoUrl !== null;
    }).length;
    return { completed, total };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generation Progress</span>
          {status && (
            <Badge
              variant={
                status.status === "complete"
                  ? "success"
                  : status.status === "failed"
                  ? "destructive"
                  : "default"
              }
            >
              {status.progress}%
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={status?.progress || 0} className="h-2" />

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  stepStatus === "active"
                    ? "bg-primary/10 border border-primary/20"
                    : stepStatus === "complete"
                    ? "bg-green-500/10"
                    : "bg-muted/50"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    stepStatus === "active"
                      ? "bg-primary text-primary-foreground"
                      : stepStatus === "complete"
                      ? "bg-green-500 text-white"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {stepStatus === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : stepStatus === "complete" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      stepStatus === "pending" ? "text-muted-foreground" : ""
                    }`}
                  >
                    {step.label}
                  </p>
                  {stepStatus === "active" && status && (
                    <p className="text-sm text-muted-foreground">
                      {status.currentStep}
                    </p>
                  )}
                  {(step.id === "audio" || step.id === "video") && stepStatus === "active" && (
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const { completed, total } = getCompletedScenes(
                          step.id as "audio" | "video"
                        );
                        return `${completed}/${total} scenes`;
                      })()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {status?.status === "failed" && status.error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{status.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
