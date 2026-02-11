import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { createSpring, SpringPreset } from "../animation/springs";
import { TEXT_STYLES, textStyleToCSS, TextStyleName } from "./TextStyles";

export type SplitAnimation =
  | "fadeUp"
  | "fadeScale"
  | "slideIn"
  | "highlight"
  | "blur"
  | "drop";

export interface SplitTextProps {
  text: string;
  style?: TextStyleName;
  customStyle?: React.CSSProperties;
  animation?: SplitAnimation;
  splitBy?: "word" | "line";
  staggerFrames?: number;
  startDelay?: number;
  springPreset?: SpringPreset;
  highlightColor?: string;
  className?: string;
}

/**
 * SplitText - Word-by-word or line-by-line animated text
 * Perfect for captions and longer text passages
 */
export const SplitText: React.FC<SplitTextProps> = ({
  text,
  style = "caption",
  customStyle = {},
  animation = "fadeUp",
  splitBy = "word",
  staggerFrames = 6,
  startDelay = 0,
  springPreset = "smooth",
  highlightColor = "rgba(255, 150, 180, 1)",
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const baseStyle = TEXT_STYLES[style];

  // Split text by words or lines
  const segments = splitBy === "line" ? text.split("\n") : text.split(" ");

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: splitBy === "line" ? "0.5em" : "0.3em",
        ...textStyleToCSS(baseStyle),
        ...customStyle,
      }}
    >
      {segments.map((segment, index) => {
        const segmentDelay = startDelay + index * staggerFrames;
        const progress = createSpring(frame, fps, springPreset, segmentDelay);

        // Calculate animation values
        let opacity = 1;
        let translateY = 0;
        let translateX = 0;
        let scale = 1;
        let blur = 0;
        let color = baseStyle.color;

        switch (animation) {
          case "fadeUp":
            opacity = Math.min(1, progress * 1.3);
            translateY = interpolate(progress, [0, 1], [25, 0]);
            break;

          case "fadeScale":
            opacity = Math.min(1, progress * 1.3);
            scale = interpolate(progress, [0, 1], [0.8, 1]);
            break;

          case "slideIn":
            opacity = Math.min(1, progress * 1.5);
            translateX = interpolate(progress, [0, 1], [-30, 0]);
            break;

          case "highlight":
            // Words "light up" with color change
            opacity = interpolate(progress, [0, 0.5], [0.3, 1], {
              extrapolateRight: "clamp",
            });
            if (progress > 0.5) {
              color = highlightColor;
            }
            break;

          case "blur":
            opacity = progress;
            blur = interpolate(progress, [0, 1], [8, 0]);
            break;

          case "drop":
            // Drop from above with bounce
            opacity = Math.min(1, progress * 2);
            translateY = interpolate(progress, [0, 0.7, 0.85, 1], [-50, 5, -2, 0]);
            scale = interpolate(progress, [0, 0.7, 0.85, 1], [0.9, 1.05, 0.98, 1]);
            break;
        }

        const segmentStyle: React.CSSProperties = {
          display: splitBy === "line" ? "block" : "inline-block",
          opacity,
          color,
          transform: `translateY(${translateY}px) translateX(${translateX}px) scale(${scale})`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          textAlign: splitBy === "line" ? "center" : undefined,
          width: splitBy === "line" ? "100%" : undefined,
        };

        return (
          <span key={index} style={segmentStyle}>
            {segment}
            {splitBy === "word" && index < segments.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </div>
  );
};

/**
 * SplitCaption - Pre-configured for photo captions
 */
export const SplitCaption: React.FC<Omit<SplitTextProps, "style">> = (props) => {
  return (
    <SplitText
      {...props}
      style="caption"
      animation={props.animation || "fadeUp"}
      staggerFrames={props.staggerFrames || 5}
    />
  );
};

/**
 * SplitQuote - Pre-configured for emotional quotes
 */
export const SplitQuote: React.FC<Omit<SplitTextProps, "style">> = (props) => {
  return (
    <SplitText
      {...props}
      style="quote"
      animation={props.animation || "fadeUp"}
      staggerFrames={props.staggerFrames || 8}
      springPreset={props.springPreset || "gentle"}
    />
  );
};

/**
 * MultiLineText - For text that spans multiple lines
 * Each line animates in sequence
 */
export interface MultiLineTextProps {
  lines: string[];
  style?: TextStyleName;
  customStyle?: React.CSSProperties;
  animation?: SplitAnimation;
  lineStaggerFrames?: number;
  wordStaggerFrames?: number;
  startDelay?: number;
  springPreset?: SpringPreset;
  className?: string;
}

export const MultiLineText: React.FC<MultiLineTextProps> = ({
  lines,
  style = "caption",
  customStyle = {},
  animation = "fadeUp",
  lineStaggerFrames = 20,
  wordStaggerFrames = 4,
  startDelay = 0,
  springPreset = "smooth",
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.3em",
        ...customStyle,
      }}
    >
      {lines.map((line, lineIndex) => (
        <SplitText
          key={lineIndex}
          text={line}
          style={style}
          animation={animation}
          splitBy="word"
          staggerFrames={wordStaggerFrames}
          startDelay={startDelay + lineIndex * lineStaggerFrames}
          springPreset={springPreset}
        />
      ))}
    </div>
  );
};
