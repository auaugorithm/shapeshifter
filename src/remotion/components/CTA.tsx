import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import React from "react";

interface CTAProps {
  text: string;
  backgroundColor?: string;
  accentColor?: string;
}

export const CTA: React.FC<CTAProps> = ({
  text,
  backgroundColor = "#000",
  accentColor = "#667eea",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation for the main text
  const springConfig = {
    fps,
    mass: 0.5,
    damping: 10,
    stiffness: 100,
  };

  const textScale = spring({
    frame,
    ...springConfig,
  });

  // Fade in
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Button pulse animation
  const buttonPulse = Math.sin(frame * 0.15) * 0.05 + 1;

  // Arrow bounce
  const arrowBounce = Math.sin(frame * 0.2) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        opacity,
      }}
    >
      {/* Background glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}40 0%, transparent 60%)`,
        }}
      />

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* CTA Text */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            padding: "0 60px",
            textShadow: `0 4px 30px ${accentColor}`,
            transform: `scale(${textScale})`,
            lineHeight: 1.3,
          }}
        >
          {text}
        </div>

        {/* Follow button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            backgroundColor: accentColor,
            padding: "20px 50px",
            borderRadius: 50,
            transform: `scale(${buttonPulse})`,
            boxShadow: `0 10px 40px ${accentColor}80`,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "white",
            }}
          >
            Follow
          </span>
          <span
            style={{
              fontSize: 28,
              color: "white",
              transform: `translateX(${arrowBounce}px)`,
            }}
          >
            →
          </span>
        </div>

        {/* Social icons hint */}
        <div
          style={{
            display: "flex",
            gap: 30,
            marginTop: 20,
          }}
        >
          {["❤️", "💬", "🔖"].map((emoji, i) => {
            const iconOpacity = interpolate(
              frame,
              [fps * 0.5 + i * 10, fps * 0.8 + i * 10],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const iconScale = spring({
              frame: frame - fps * 0.5 - i * 10,
              ...springConfig,
            });
            return (
              <span
                key={i}
                style={{
                  fontSize: 48,
                  opacity: iconOpacity,
                  transform: `scale(${Math.max(0, iconScale)})`,
                }}
              >
                {emoji}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "rgba(255,255,255,0.6)",
          fontSize: 24,
          fontWeight: 500,
        }}
      >
        Tap to see more content
      </div>
    </AbsoluteFill>
  );
};
