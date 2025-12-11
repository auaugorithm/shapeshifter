import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

interface HookProps {
  text: string;
  backgroundColor?: string;
}

export const Hook: React.FC<HookProps> = ({
  text,
  backgroundColor = "#000",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Zoom in effect
  const scale = interpolate(frame, [0, fps * 0.5], [1.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text fade in
  const textOpacity = interpolate(frame, [fps * 0.2, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slide up animation for text
  const textTranslateY = interpolate(frame, [fps * 0.2, fps * 0.5], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at the end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.3, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Pulsing effect for attention
  const pulse = Math.sin(frame * 0.1) * 0.02 + 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        opacity: fadeOut,
      }}
    >
      {/* Animated background gradient */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(102,126,234,0.4) 0%, rgba(0,0,0,0) 70%)",
          transform: `scale(${scale * pulse})`,
        }}
      />

      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 100,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.3)",
          borderRadius: 2,
        }}
      />

      {/* Main hook text */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            padding: "0 60px",
            textShadow: "0 4px 30px rgba(102,126,234,0.8)",
            lineHeight: 1.2,
            transform: `scale(${pulse})`,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>

      {/* Bottom decorative element */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
        }}
      >
        {[0, 1, 2].map((i) => {
          const dotOpacity = interpolate(
            frame,
            [fps * 0.5 + i * 5, fps * 0.7 + i * 5],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );
          return (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "white",
                opacity: dotOpacity,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
