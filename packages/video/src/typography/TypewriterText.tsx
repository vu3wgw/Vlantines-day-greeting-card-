import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TEXT_STYLES, textStyleToCSS, TextStyleName } from "./TextStyles";

export interface TypewriterTextProps {
  text: string;
  style?: TextStyleName;
  customStyle?: React.CSSProperties;
  framesPerCharacter?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorBlinkFrames?: number;
  cursorChar?: string;
  className?: string;
}

/**
 * TypewriterText - Text appears character by character like typing
 * Classic, nostalgic feel perfect for love letters
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  style = "caption",
  customStyle = {},
  framesPerCharacter = 2,
  startDelay = 0,
  showCursor = true,
  cursorBlinkFrames = 15,
  cursorChar = "|",
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const baseStyle = TEXT_STYLES[style];

  // Calculate how many characters to show
  const adjustedFrame = frame - startDelay;
  const charactersToShow = Math.max(
    0,
    Math.min(text.length, Math.floor(adjustedFrame / framesPerCharacter))
  );

  // Visible text
  const visibleText = text.slice(0, charactersToShow);

  // Cursor blink
  const cursorVisible = showCursor
    ? Math.floor(adjustedFrame / cursorBlinkFrames) % 2 === 0
    : false;

  // Show cursor only while typing or right after
  const isTyping = charactersToShow < text.length;
  const showCursorNow = showCursor && (isTyping || adjustedFrame < text.length * framesPerCharacter + 30);

  return (
    <div
      className={className}
      style={{
        ...textStyleToCSS(baseStyle),
        ...customStyle,
        display: "inline-block",
      }}
    >
      {visibleText}
      {showCursorNow && (
        <span
          style={{
            opacity: cursorVisible ? 1 : 0,
            color: "rgba(255, 150, 180, 1)",
            marginLeft: "2px",
          }}
        >
          {cursorChar}
        </span>
      )}
    </div>
  );
};

/**
 * TypewriterLines - Multiple lines typed one after another
 */
export interface TypewriterLinesProps {
  lines: string[];
  style?: TextStyleName;
  customStyle?: React.CSSProperties;
  framesPerCharacter?: number;
  pauseBetweenLines?: number;
  startDelay?: number;
  showCursor?: boolean;
  className?: string;
}

export const TypewriterLines: React.FC<TypewriterLinesProps> = ({
  lines,
  style = "caption",
  customStyle = {},
  framesPerCharacter = 2,
  pauseBetweenLines = 20,
  startDelay = 0,
  showCursor = true,
  className,
}) => {
  const frame = useCurrentFrame();
  const baseStyle = TEXT_STYLES[style];

  // Calculate which line we're on and how much of it to show
  let currentFrame = frame - startDelay;
  let currentLineIndex = 0;
  let charactersInCurrentLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineFrames = lines[i].length * framesPerCharacter;

    if (currentFrame < lineFrames) {
      currentLineIndex = i;
      charactersInCurrentLine = Math.floor(currentFrame / framesPerCharacter);
      break;
    }

    currentFrame -= lineFrames + pauseBetweenLines;

    if (currentFrame < 0) {
      currentLineIndex = i;
      charactersInCurrentLine = lines[i].length;
      break;
    }

    currentLineIndex = i + 1;
  }

  // Handle case when all lines are complete
  if (currentLineIndex >= lines.length) {
    currentLineIndex = lines.length - 1;
    charactersInCurrentLine = lines[currentLineIndex]?.length || 0;
  }

  return (
    <div
      className={className}
      style={{
        ...textStyleToCSS(baseStyle),
        ...customStyle,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5em",
      }}
    >
      {lines.map((line, index) => {
        let displayText = "";
        let showLineCursor = false;

        if (index < currentLineIndex) {
          // Previous lines - show full
          displayText = line;
        } else if (index === currentLineIndex) {
          // Current line - show partial with cursor
          displayText = line.slice(0, charactersInCurrentLine);
          showLineCursor = showCursor && charactersInCurrentLine < line.length;
        }
        // Future lines - show nothing

        if (displayText === "" && index > currentLineIndex) {
          return null;
        }

        return (
          <div key={index} style={{ opacity: displayText ? 1 : 0 }}>
            {displayText}
            {showLineCursor && (
              <span
                style={{
                  opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0,
                  color: "rgba(255, 150, 180, 1)",
                  marginLeft: "2px",
                }}
              >
                |
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * RevealText - Text reveals with a mask/wipe effect
 */
export interface RevealTextProps {
  text: string;
  style?: TextStyleName;
  customStyle?: React.CSSProperties;
  direction?: "left" | "right" | "center";
  durationFrames?: number;
  startDelay?: number;
  className?: string;
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  style = "title",
  customStyle = {},
  direction = "left",
  durationFrames = 30,
  startDelay = 0,
  className,
}) => {
  const frame = useCurrentFrame();
  const baseStyle = TEXT_STYLES[style];

  const adjustedFrame = frame - startDelay;
  const progress = Math.max(0, Math.min(1, adjustedFrame / durationFrames));

  // Calculate clip path based on direction
  let clipPath = "";
  switch (direction) {
    case "left":
      clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
      break;
    case "right":
      clipPath = `inset(0 0 0 ${100 - progress * 100}%)`;
      break;
    case "center":
      const halfProgress = progress * 50;
      clipPath = `inset(0 ${50 - halfProgress}% 0 ${50 - halfProgress}%)`;
      break;
  }

  return (
    <div
      className={className}
      style={{
        ...textStyleToCSS(baseStyle),
        ...customStyle,
        clipPath,
      }}
    >
      {text}
    </div>
  );
};
