"use client";

import { Script } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Film, Megaphone } from "lucide-react";

interface ScriptPreviewProps {
  script: Script;
}

export function ScriptPreview({ script }: ScriptPreviewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Script Preview
          </span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {script.totalDuration}s
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hook */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Megaphone className="h-4 w-4" />
            Hook (Attention Grabber)
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <p className="text-lg font-medium">&quot;{script.hook}&quot;</p>
          </div>
        </div>

        {/* Scenes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Scenes ({script.scenes.length})
          </div>
          <div className="space-y-3">
            {script.scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Scene {index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {scene.duration}s
                      </Badge>
                    </div>
                    <p className="font-medium">{scene.narration}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Visual:</span> {scene.visualPrompt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Megaphone className="h-4 w-4" />
            Call to Action
          </div>
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <p className="text-lg font-medium">&quot;{script.cta}&quot;</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
