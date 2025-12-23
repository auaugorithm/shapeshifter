"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { VideoStyle } from "@/types";
import { getApiHeaders } from "@/lib/api-keys";

interface VideoFormProps {
  onScriptPreview?: (script: unknown) => void;
}

export function VideoForm({ onScriptPreview }: VideoFormProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<VideoStyle>("energetic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreviewScript = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your video");
      return;
    }

    setIsPreviewing(true);
    setError(null);

    try {
      const response = await fetch("/api/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(),
        },
        body: JSON.stringify({ topic, style }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate script preview");
      }

      const data = await response.json();
      onScriptPreview?.(data.script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your video");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(),
        },
        body: JSON.stringify({ topic, style }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start video generation");
      }

      const data = await response.json();
      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Create UGC Video
        </CardTitle>
        <CardDescription>
          Enter your video topic and we&apos;ll generate a script, voiceover, and video clips using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="topic">Video Topic / Idea</Label>
          <Textarea
            id="topic"
            placeholder="e.g., 5 productivity tips for remote workers, Morning routine for success, How to start investing with $100..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Be specific! The more detail you provide, the better the script will be.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Video Style</Label>
          <Select
            value={style}
            onValueChange={(value) => setStyle(value as VideoStyle)}
            disabled={isGenerating}
          >
            <SelectTrigger id="style">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="energetic">
                Energetic - Fast-paced, bold, action-oriented
              </SelectItem>
              <SelectItem value="calm">
                Calm - Slow, peaceful, nature-focused
              </SelectItem>
              <SelectItem value="professional">
                Professional - Clean, minimal, modern
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handlePreviewScript}
            disabled={isGenerating || isPreviewing || !topic.trim()}
            className="flex-1"
          >
            {isPreviewing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Preview...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Preview Script
              </>
            )}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isPreviewing || !topic.trim()}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting Generation...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
