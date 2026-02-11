import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { createSpring, SpringPreset, SPRING_PRESETS } from "../animation/springs";
import { TEXT_STYLES, textStyleToCSS, TextStyleName } from "./TextStyles";

export type KineticAnimation =
  | "fadeUp"
  | "fadeDown"
  | "fadeScale"
  | "wave"
  | "bounce"
  | "rotate"
  | "blur"
  | "flip";

export interface KineticTextProps {
  text: string;
  style?: TextStyleName;
  customStyle?: React.CSSProperties;
  animation?: KineticAnimation;
  staggerFrames?: number;
  startDelay?: number;
  springPreset?: SpringPreset;
  color?: string;
  className?: string;
}

/**
 * KineticText - Character-by-character animated text
 * Creates the premium "GitHub Unwrapped" text reveal effect
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  style = "caption",
  customStyle = {},
  animation = "fadeUp",
  staggerFrames = 2,
  startDelay = 0,
  springPreset = "smooth",
  color,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const baseStyle = TEXT_STYLES[style];
  const characters = text.split("");

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        ...textStyleToCSS(baseStyle),
        ...(color ? { color } : {}),
        ...customStyle,
      }}
    >
      {characters.map((char, index) => {
        const charDelay = startDelay + index * staggerFrames;
        const progress = createSpring(frame, fps, springPreset, charDelay);

        // Calculate animation values based on type
        let opacity = 1;
        let translateY = 0;
        let translateX = 0;
        let scale = 1;
        let rotate = 0;
        let blur = 0;
        let rotateX = 0;

        switch (animation) {
          case "fadeUp":
            opacity = Math.min(1, progress * 1.5);
            translateY = interpolate(progress, [0, 1], [40, 0]);
            break;

          case "fadeDown":
            opacity = Math.min(1, progress * 1.5);
            translateY = interpolate(progress, [0, 1], [-40, 0]);
            break;

          case "fadeScale":
            opacity = Math.min(1, progress * 1.5);
            scale = interpolate(progress, [0, 1], [0.5, 1]);
            break;

          case "wave":
            opacity = Math.min(1, progress * 1.5);
            // Initial entrance
            translateY = interpolate(progress, [0, 1], [30, 0]);
            // Add continuous wave after entrance
            if (progress > 0.8) {
              const wavePhase = (frame + index * 3) * 0.15;
              translateY += Math.sin(wavePhase) * 5;
            }
            break;

          case "bounce":
            opacity = Math.min(1, progress * 2);
            // Overshoot then settle
            if (progress < 1) {
              translateY = interpolate(progress, [0, 0.6, 0.8, 1], [60, -10, 5, 0]);
              scale = interpolate(progress, [0, 0.6, 0.8, 1], [0.8, 1.1, 0.95, 1]);
            }
            break;

          case "rotate":
            opacity = Math.min(1, progress * 1.5);
            rotate = interpolate(progress, [0, 1], [-15, 0]);
            scale = interpolate(progress, [0, 1], [0.8, 1]);
            translateY = interpolate(progress, [0, 1], [20, 0]);
            break;

          case "blur":
            opacity = progress;
            blur = interpolate(progress, [0, 1], [10, 0]);
            scale = interpolate(progress, [0, 1], [1.1, 1]);
            break;

          case "flip":
            opacity = progress > 0.5 ? 1 : 0;
            rotateX = interpolate(progress, [0, 1], [90, 0]);
            break;
        }

        const charStyle: React.CSSProperties = {
          display: "inline-block",
          opacity,
          transform: `translateY(${translateY}px) translateX(${translateX}px) scale(${scale}) rotate(${rotate}deg) rotateX(${rotateX}deg)`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          transformStyle: "preserve-3d",
          // Non-breaking space for actual spaces
          whiteSpace: "pre",
        };

        return (
          <span key={index} style={charStyle}>
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </div>
  );
};

/**
 * KineticTitle - Pre-configured for title text
 */
export const KineticTitle: React.FC<Omit<KineticTextProps, "style">> = (props) => {
  return (
    <KineticText
      {...props}
      style="title"
      animation={props.animation || "fadeUp"}
      staggerFrames={props.staggerFrames || 3}
      springPreset={props.springPreset || "bouncy"}
    />
  );
};

/**
 * KineticSubtitle - Pre-configured for subtitle text
 */
export const KineticSubtitle: React.FC<Omit<KineticTextProps, "style">> = (props) => {
  return (
    <KineticText
      {...props}
      style="subtitle"
      animation={props.animation || "fadeUp"}
      staggerFrames={props.staggerFrames || 2}
      springPreset={props.springPreset || "smooth"}
    />
  );
};

/**
 * KineticCaption - Pre-configured for caption text
 */
export const KineticCaption: React.FC<Omit<KineticTextProps, "style">> = (props) => {
  return (
    <KineticText
      {...props}
      style="caption"
      animation={props.animation || "fadeUp"}
      staggerFrames={props.staggerFrames || 1}
      springPreset={props.springPreset || "smooth"}
    />
  );
};

/**
 * KineticCoupleName - Pre-configured for couple name
 */
export const KineticCoupleName: React.FC<Omit<KineticTextProps, "style">> = (props) => {
  return (
    <KineticText
      {...props}
      style="coupleName"
      animation={props.animation || "bounce"}
      staggerFrames={props.staggerFrames || 3}
      springPreset={props.springPreset || "bouncy"}
    />
  );
};
