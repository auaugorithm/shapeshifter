import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React, { CSSProperties } from "react";

interface TextOverlayProps {
  text: string;
  position?: "top" | "center" | "bottom";
  style?: "caption" | "title" | "subtitle";
  color?: string;
  delay?: number;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  position = "bottom",
  style = "caption",
  color = "white",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);
  const animationDuration = fps * 0.5;

  // Fade in animation
  const opacity = interpolate(
    adjustedFrame,
    [0, animationDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Slide up animation
  const translateY = interpolate(
    adjustedFrame,
    [0, animationDuration],
    [30, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Style configurations
  const styleConfig = {
    caption: {
      fontSize: 48,
      fontWeight: 700 as const,
      lineHeight: 1.3,
      padding: "20px 40px",
      maxWidth: "90%",
    },
    title: {
      fontSize: 72,
      fontWeight: 800 as const,
      lineHeight: 1.2,
      padding: "30px 50px",
      maxWidth: "85%",
    },
    subtitle: {
      fontSize: 36,
      fontWeight: 500 as const,
      lineHeight: 1.4,
      padding: "15px 30px",
      maxWidth: "95%",
    },
  };

  const currentStyle = styleConfig[style];

  // Build container style based on position
  const getContainerStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      position: "absolute",
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      opacity,
    };

    switch (position) {
      case "top":
        return {
          ...baseStyle,
          top: 120,
          transform: `translateY(${translateY}px)`,
        };
      case "center":
        return {
          ...baseStyle,
          top: "50%",
          transform: `translateY(-50%) translateY(${translateY}px)`,
        };
      case "bottom":
      default:
        return {
          ...baseStyle,
          bottom: 200,
          transform: `translateY(${translateY}px)`,
        };
    }
  };

  return (
    <div style={getContainerStyle()}>
      <div
        style={{
          color,
          textAlign: "center",
          textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
          ...currentStyle,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Word-by-word animation component
interface AnimatedTextProps {
  text: string;
  position?: "top" | "center" | "bottom";
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");
  const framesPerWord = Math.floor(fps * 0.15); // 150ms per word

  const getPositionStyle = (): CSSProperties => {
    switch (position) {
      case "top":
        return { top: 120 };
      case "center":
        return { top: "50%", transform: "translateY(-50%)" };
      case "bottom":
      default:
        return { bottom: 200 };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 16px",
        ...getPositionStyle(),
      }}
    >
      {words.map((word, index) => {
        const wordStartFrame = index * framesPerWord;
        const wordOpacity = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + framesPerWord / 2],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const scale = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + framesPerWord / 2],
          [0.8, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <span
            key={index}
            style={{
              opacity: wordOpacity,
              transform: `scale(${scale})`,
              fontSize: 48,
              fontWeight: 700,
              color: "white",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
