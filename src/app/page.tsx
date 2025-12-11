"use client";

import { useState } from "react";
import { VideoForm } from "@/components/video-form";
import { ScriptPreview } from "@/components/script-preview";
import { ProjectList } from "@/components/project-list";
import { Script } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function HomePage() {
  const [previewScript, setPreviewScript] = useState<Script | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">UGC Video Creator</h1>
          <p className="text-muted-foreground">
            Create scroll-stopping short-form videos with AI-powered scripts, voiceovers, and visuals.
          </p>
        </header>

        <div className="space-y-8">
          <VideoForm onScriptPreview={(script) => setPreviewScript(script as Script)} />

          {previewScript && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 z-10"
                onClick={() => setPreviewScript(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <ScriptPreview script={previewScript} />
            </div>
          )}

          <ProjectList />
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Powered by OpenRouter (LLM), ElevenLabs (TTS), Runway (Video), and Mux (Streaming)
          </p>
        </footer>
      </div>
    </main>
  );
}
