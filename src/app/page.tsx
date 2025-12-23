"use client";

import { useState, useEffect } from "react";
import { VideoForm } from "@/components/video-form";
import { ScriptPreview } from "@/components/script-preview";
import { ProjectList } from "@/components/project-list";
import { Onboarding } from "@/components/onboarding";
import { Script } from "@/types";
import { Button } from "@/components/ui/button";
import { hasRequiredKeys, getConfiguredServices } from "@/lib/api-keys";
import { X, Settings, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [previewScript, setPreviewScript] = useState<Script | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [configuredServices, setConfiguredServices] = useState<string[]>([]);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasKeys = hasRequiredKeys();
    setShowOnboarding(!hasKeys);
    setIsReady(true);
    setConfiguredServices(getConfiguredServices());
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setConfiguredServices(getConfiguredServices());
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    setConfiguredServices(getConfiguredServices());
  };

  // Don't render until we've checked localStorage
  if (!isReady) {
    return null;
  }

  // Show onboarding if no API keys configured
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show settings modal
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleSettingsClose}
            className="mb-4"
          >
            <X className="h-4 w-4 mr-2" />
            Close Settings
          </Button>
          <Onboarding onComplete={handleSettingsClose} isSettings />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">UGC Video Creator</h1>
          <p className="text-muted-foreground mb-4">
            Create scroll-stopping short-form videos with AI-powered scripts, voiceovers, and visuals.
          </p>
          {configuredServices.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {configuredServices.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {service}
                </Badge>
              ))}
            </div>
          )}
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
