"use client";

import MuxPlayer from "@mux/mux-player-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Share2 } from "lucide-react";

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
}

export function VideoPlayer({ playbackId, title = "Your Video" }: VideoPlayerProps) {
  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const downloadUrl = `https://stream.mux.com/${playbackId}/high.mp4`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
        console.error("Share failed:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-[9/16] max-h-[600px] mx-auto bg-black">
          <MuxPlayer
            streamType="on-demand"
            playbackId={playbackId}
            metadata={{
              video_title: title,
            }}
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "100%",
            }}
            primaryColor="#ffffff"
            secondaryColor="#000000"
          />
        </div>
        <div className="p-4 flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in new tab
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
