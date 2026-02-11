import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Sticker, StickerFrame, EntryAnimation, EntryDirection } from "./Sticker";
import {
  CollageLayout,
  getLayout,
  getLayoutForCount,
  getEntryPositions,
  LayoutName,
  StickerPosition,
} from "./CollageLayouts";
import { SpringPreset } from "../animation/springs";

export interface StickerImage {
  url: string;
  id?: string;
}

export interface StickerGroupProps {
  images: StickerImage[];
  layout?: LayoutName | CollageLayout;
  entryAnimation?: EntryAnimation;
  entryDirection?: EntryDirection | "edges" | "random";
  springPreset?: SpringPreset;
  staggerFrames?: number;
  startDelay?: number;
  wiggle?: boolean;
  shadow?: boolean;
  framed?: boolean;
  seed?: string | number;
  className?: string;
}

/**
 * StickerGroup - Multiple stickers animating together in a layout
 * Handles layout selection, staggered entry, and coordinated animation
 */
export const StickerGroup: React.FC<StickerGroupProps> = ({
  images,
  layout = "auto",
  entryAnimation = "flyIn",
  entryDirection = "edges",
  springPreset = "bouncy",
  staggerFrames = 8,
  startDelay = 0,
  wiggle = true,
  shadow = true,
  framed = false,
  seed = "stickers",
  className,
}) => {
  // Get layout based on image count or specified layout
  const collageLayout: CollageLayout = React.useMemo(() => {
    if (typeof layout === "object") {
      return layout;
    }
    if (layout === "auto") {
      return getLayoutForCount(images.length);
    }
    return getLayout(layout as LayoutName);
  }, [layout, images.length]);

  // Generate entry positions
  const entryPositions = React.useMemo(() => {
    // Convert "edges"/"random" to proper direction type for getEntryPositions
    const direction = entryDirection as "random" | "left" | "right" | "top" | "bottom" | "edges";
    return getEntryPositions(collageLayout, direction);
  }, [collageLayout, entryDirection]);

  // Determine entry direction for each sticker
  const getEntryDirectionForIndex = (index: number): EntryDirection => {
    if (entryDirection === "edges") {
      const directions: EntryDirection[] = ["left", "right", "top", "bottom"];
      return directions[index % 4];
    }
    if (entryDirection === "random") {
      const directions: EntryDirection[] = ["left", "right", "top", "bottom"];
      const seedKey = `${seed}-dir-${index}`;
      return directions[Math.floor(random(seedKey) * 4)];
    }
    return entryDirection as EntryDirection;
  };

  const StickerComponent = framed ? StickerFrame : Sticker;

  return (
    <AbsoluteFill className={className}>
      {images.map((image, index) => {
        // Only render if we have a position for this image
        if (index >= collageLayout.positions.length) return null;

        const endPosition = collageLayout.positions[index];
        const startPosition = entryPositions[index];
        const delay = startDelay + index * staggerFrames;
        const direction = getEntryDirectionForIndex(index);

        return (
          <StickerComponent
            key={image.id || index}
            imageUrl={image.url}
            startPosition={startPosition}
            endPosition={endPosition}
            entryAnimation={entryAnimation}
            entryDirection={direction}
            springPreset={springPreset}
            delay={delay}
            wiggle={wiggle}
            shadow={shadow}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * DuoStickers - Two stickers side by side
 */
export const DuoStickers: React.FC<{
  images: [StickerImage, StickerImage];
  variant?: "side-by-side" | "diagonal";
  springPreset?: SpringPreset;
  startDelay?: number;
}> = ({
  images,
  variant = "side-by-side",
  springPreset = "bouncy",
  startDelay = 0,
}) => {
  return (
    <StickerGroup
      images={images}
      layout={variant === "diagonal" ? "duo-diagonal" : "duo"}
      entryDirection="edges"
      springPreset={springPreset}
      startDelay={startDelay}
      staggerFrames={10}
    />
  );
};

/**
 * TrioStickers - Three stickers in triangle
 */
export const TrioStickers: React.FC<{
  images: [StickerImage, StickerImage, StickerImage];
  variant?: "triangle" | "row";
  springPreset?: SpringPreset;
  startDelay?: number;
}> = ({
  images,
  variant = "triangle",
  springPreset = "bouncy",
  startDelay = 0,
}) => {
  return (
    <StickerGroup
      images={images}
      layout={variant === "row" ? "trio-row" : "trio"}
      entryDirection="edges"
      springPreset={springPreset}
      startDelay={startDelay}
      staggerFrames={8}
    />
  );
};

/**
 * HeartCollage - Stickers arranged in heart shape
 */
export const HeartCollage: React.FC<{
  images: StickerImage[];
  springPreset?: SpringPreset;
  startDelay?: number;
}> = ({
  images,
  springPreset = "smooth",
  startDelay = 0,
}) => {
  return (
    <StickerGroup
      images={images.slice(0, 8)} // Max 8 for heart layout
      layout="heart"
      entryAnimation="pop"
      entryDirection="random"
      springPreset={springPreset}
      startDelay={startDelay}
      staggerFrames={5}
    />
  );
};

/**
 * CoupleStickers - Two stickers close together (for couple shots)
 */
export const CoupleStickers: React.FC<{
  images: [StickerImage, StickerImage];
  springPreset?: SpringPreset;
  startDelay?: number;
}> = ({
  images,
  springPreset = "bouncy",
  startDelay = 0,
}) => {
  return (
    <StickerGroup
      images={images}
      layout="couple"
      entryAnimation="flyIn"
      entryDirection="edges"
      springPreset={springPreset}
      startDelay={startDelay}
      staggerFrames={12}
    />
  );
};

/**
 * PolaroidStack - Stickers stacked like polaroids
 */
export const PolaroidStack: React.FC<{
  images: StickerImage[];
  springPreset?: SpringPreset;
  startDelay?: number;
}> = ({
  images,
  springPreset = "smooth",
  startDelay = 0,
}) => {
  return (
    <StickerGroup
      images={images.slice(0, 3)}
      layout="polaroid-stack"
      entryAnimation="drop"
      entryDirection="top"
      springPreset={springPreset}
      startDelay={startDelay}
      staggerFrames={15}
      framed
    />
  );
};

/**
 * TimelineStickers - Horizontal timeline of stickers
 */
export const TimelineStickers: React.FC<{
  images: StickerImage[];
  springPreset?: SpringPreset;
  startDelay?: number;
}> = ({
  images,
  springPreset = "bouncy",
  startDelay = 0,
}) => {
  return (
    <StickerGroup
      images={images.slice(0, 5)}
      layout="timeline"
      entryAnimation="flyIn"
      entryDirection="bottom"
      springPreset={springPreset}
      startDelay={startDelay}
      staggerFrames={6}
    />
  );
};

/**
 * ConvergingStickers - Stickers that converge to center
 * Great for finale/ending scenes
 */
export interface ConvergingStickerProps {
  images: StickerImage[];
  convergeDuration?: number;
  finalScale?: number;
  springPreset?: SpringPreset;
  startDelay?: number;
}

export const ConvergingStickers: React.FC<ConvergingStickerProps> = ({
  images,
  convergeDuration = 60,
  finalScale = 0.3,
  springPreset = "smooth",
  startDelay = 0,
}) => {
  // Create custom layout where all stickers converge to center
  const customLayout: CollageLayout = {
    name: "converge",
    positions: images.map((_, index) => {
      const angle = (index / images.length) * Math.PI * 2;
      const radius = 50 + (index % 3) * 30; // Slight variation
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        rotation: (index - images.length / 2) * 5,
        scale: finalScale,
      };
    }),
  };

  // Start positions are further out
  const startLayout: CollageLayout = {
    name: "converge-start",
    positions: images.map((_, index) => {
      const angle = (index / images.length) * Math.PI * 2;
      const radius = 600;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        rotation: (index - images.length / 2) * 20,
        scale: 0.2,
      };
    }),
  };

  return (
    <AbsoluteFill>
      {images.map((image, index) => (
        <Sticker
          key={image.id || index}
          imageUrl={image.url}
          startPosition={startLayout.positions[index]}
          endPosition={customLayout.positions[index]}
          entryAnimation="flyIn"
          springPreset={springPreset}
          delay={startDelay + index * 5}
          wiggle={true}
          wiggleAmount={1}
        />
      ))}
    </AbsoluteFill>
  );
};
