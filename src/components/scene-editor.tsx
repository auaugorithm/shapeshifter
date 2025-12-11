"use client";

import { useState } from "react";
import { Scene } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Edit2,
  Film,
  Mic,
  Video,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface SceneEditorProps {
  scenes: Scene[];
  onScenesChange?: (scenes: Scene[]) => void;
  readOnly?: boolean;
}

export function SceneEditor({
  scenes,
  onScenesChange,
  readOnly = false,
}: SceneEditorProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editedNarration, setEditedNarration] = useState("");
  const [editedVisualPrompt, setEditedVisualPrompt] = useState("");

  const startEditing = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditedNarration(scene.narration);
    setEditedVisualPrompt(scene.visualPrompt);
  };

  const cancelEditing = () => {
    setEditingSceneId(null);
    setEditedNarration("");
    setEditedVisualPrompt("");
  };

  const saveEditing = () => {
    if (!editingSceneId) return;

    const updatedScenes = scenes.map((scene) =>
      scene.id === editingSceneId
        ? {
            ...scene,
            narration: editedNarration,
            visualPrompt: editedVisualPrompt,
          }
        : scene
    );

    onScenesChange?.(updatedScenes);
    cancelEditing();
  };

  const getStatusIcon = (status: Scene["status"]) => {
    switch (status) {
      case "pending":
        return <div className="h-2 w-2 rounded-full bg-gray-400" />;
      case "generating_audio":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "generating_video":
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
      case "complete":
        return <Check className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Scene["status"]) => {
    const variants: Record<Scene["status"], "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      pending: "secondary",
      generating_audio: "default",
      generating_video: "default",
      complete: "success",
      failed: "destructive",
    };

    const labels: Record<Scene["status"], string> = {
      pending: "Pending",
      generating_audio: "Generating Audio",
      generating_video: "Generating Video",
      complete: "Complete",
      failed: "Failed",
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Scenes ({scenes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className="p-4 rounded-lg border bg-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Scene {index + 1}</Badge>
                {getStatusBadge(scene.status)}
              </div>
              {!readOnly && editingSceneId !== scene.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(scene)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {editingSceneId === scene.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Narration</Label>
                  <Textarea
                    value={editedNarration}
                    onChange={(e) => setEditedNarration(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visual Prompt</Label>
                  <Textarea
                    value={editedVisualPrompt}
                    onChange={(e) => setEditedVisualPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEditing}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mic className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Narration</p>
                    <p className="text-sm text-muted-foreground">
                      {scene.narration}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Video className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Visual Prompt</p>
                    <p className="text-sm text-muted-foreground">
                      {scene.visualPrompt}
                    </p>
                  </div>
                </div>
                {scene.audioDuration && (
                  <p className="text-xs text-muted-foreground">
                    Duration: {scene.audioDuration.toFixed(1)}s
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
