"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getApiKeys,
  saveApiKeys,
  ApiKeys,
  getConfiguredServices,
} from "@/lib/api-keys";
import {
  Key,
  Check,
  ExternalLink,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  isSettings?: boolean;
}

export function Onboarding({ onComplete, isSettings = false }: OnboardingProps) {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const storedKeys = getApiKeys();
    setKeys(storedKeys);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    saveApiKeys(keys);
    setTimeout(() => {
      setIsSaving(false);
      if (!isSettings) {
        onComplete();
      }
    }, 500);
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const configuredServices = getConfiguredServices();

  const renderKeyInput = (
    label: string,
    keyName: keyof ApiKeys,
    placeholder: string,
    helpUrl?: string,
    helpText?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={keyName} className="flex items-center gap-2">
          {label}
          {keys[keyName] && <Check className="h-4 w-4 text-green-500" />}
        </Label>
        {helpUrl && (
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Get API Key <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          id={keyName}
          type={showKeys[keyName] ? "text" : "password"}
          placeholder={placeholder}
          value={keys[keyName] || ""}
          onChange={(e) => setKeys({ ...keys, [keyName]: e.target.value })}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => toggleShowKey(keyName)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showKeys[keyName] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );

  if (isSettings) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Manage your API keys for video generation services
          </CardDescription>
          {configuredServices.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {configuredServices.map((service) => (
                <Badge key={service} variant="success" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {service}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Script Generation (Required)</h3>
            {renderKeyInput(
              "OpenRouter API Key",
              "openrouter",
              "sk-or-...",
              "https://openrouter.ai/keys",
              "Used for AI script generation with DeepSeek/Claude/GPT"
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Voice Generation (Optional)</h3>
            {renderKeyInput(
              "ElevenLabs API Key",
              "elevenlabs",
              "xi-...",
              "https://elevenlabs.io/app/settings/api-keys",
              "Used for text-to-speech voiceover"
            )}
            {renderKeyInput(
              "ElevenLabs Voice ID",
              "elevenlabsVoiceId",
              "21m00Tcm4TlvDq8ikWAM",
              "https://elevenlabs.io/app/voice-library",
              "Default: Rachel. Find voice IDs in your voice library"
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Video Generation (Optional)</h3>
            {renderKeyInput(
              "Runway API Key",
              "runway",
              "rw-...",
              "https://dev.runwayml.com/",
              "Used for AI video clip generation"
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Video Hosting (Optional)</h3>
            {renderKeyInput(
              "Mux Token ID",
              "muxTokenId",
              "...",
              "https://dashboard.mux.com/settings/api-keys"
            )}
            {renderKeyInput(
              "Mux Token Secret",
              "muxTokenSecret",
              "...",
              undefined,
              "Used for video hosting and streaming"
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Onboarding wizard flow
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to UGC Video Creator</CardTitle>
          <CardDescription>
            {step === 1
              ? "Let's set up your API keys to get started"
              : step === 2
              ? "Optional: Add voice generation"
              : "Optional: Add video generation"}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  OpenRouter is required
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  This powers the AI script generation. You can use DeepSeek, Claude, or GPT models.
                </p>
              </div>
              {renderKeyInput(
                "OpenRouter API Key",
                "openrouter",
                "sk-or-...",
                "https://openrouter.ai/keys"
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="p-4 rounded-lg bg-muted text-sm">
                <p className="font-medium">ElevenLabs (Optional)</p>
                <p className="text-muted-foreground mt-1">
                  Add realistic AI voiceovers to your videos. Skip if you want to add your own audio later.
                </p>
              </div>
              {renderKeyInput(
                "ElevenLabs API Key",
                "elevenlabs",
                "xi-...",
                "https://elevenlabs.io/app/settings/api-keys"
              )}
              {renderKeyInput(
                "Voice ID (Optional)",
                "elevenlabsVoiceId",
                "Leave blank for default voice"
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="p-4 rounded-lg bg-muted text-sm">
                <p className="font-medium">Runway (Optional)</p>
                <p className="text-muted-foreground mt-1">
                  Generate AI video clips from text prompts. Skip to use placeholder visuals.
                </p>
              </div>
              {renderKeyInput(
                "Runway API Key",
                "runway",
                "rw-...",
                "https://dev.runwayml.com/"
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => {
                saveApiKeys(keys);
                setStep(step + 1);
              }}
              disabled={step === 1 && !keys.openrouter}
              className="flex-1"
            >
              {step === 1 && !keys.openrouter ? "Enter API Key" : "Continue"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "Setting up..." : "Start Creating Videos"}
            </Button>
          )}
        </CardFooter>

        {step > 1 && (
          <div className="px-6 pb-4 text-center">
            <button
              onClick={handleSave}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip and finish setup
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
