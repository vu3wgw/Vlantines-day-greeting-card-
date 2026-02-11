/**
 * Collage Layouts - Predefined arrangements for stickers
 * Positions are relative to center (0,0) in pixels
 */

export interface StickerPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface CollageLayout {
  name: string;
  positions: StickerPosition[];
}

/**
 * Two stickers side by side
 */
export const LAYOUT_DUO: CollageLayout = {
  name: "duo",
  positions: [
    { x: -180, y: 20, rotation: -8, scale: 0.65 },
    { x: 180, y: -20, rotation: 6, scale: 0.65 },
  ],
};

/**
 * Two stickers diagonal
 */
export const LAYOUT_DUO_DIAGONAL: CollageLayout = {
  name: "duo-diagonal",
  positions: [
    { x: -150, y: -120, rotation: -12, scale: 0.6 },
    { x: 150, y: 120, rotation: 8, scale: 0.6 },
  ],
};

/**
 * Three stickers in triangle
 */
export const LAYOUT_TRIO: CollageLayout = {
  name: "trio",
  positions: [
    { x: 0, y: -180, rotation: 0, scale: 0.55 },
    { x: -180, y: 120, rotation: -10, scale: 0.5 },
    { x: 180, y: 100, rotation: 8, scale: 0.5 },
  ],
};

/**
 * Three stickers in row
 */
export const LAYOUT_TRIO_ROW: CollageLayout = {
  name: "trio-row",
  positions: [
    { x: -220, y: 0, rotation: -6, scale: 0.5 },
    { x: 0, y: -30, rotation: 2, scale: 0.55 },
    { x: 220, y: 20, rotation: 6, scale: 0.5 },
  ],
};

/**
 * Four stickers in grid
 */
export const LAYOUT_QUAD: CollageLayout = {
  name: "quad",
  positions: [
    { x: -150, y: -150, rotation: -8, scale: 0.45 },
    { x: 150, y: -130, rotation: 6, scale: 0.45 },
    { x: -130, y: 150, rotation: -4, scale: 0.45 },
    { x: 150, y: 130, rotation: 10, scale: 0.45 },
  ],
};

/**
 * Four stickers scattered
 */
export const LAYOUT_QUAD_SCATTERED: CollageLayout = {
  name: "quad-scattered",
  positions: [
    { x: -200, y: -100, rotation: -15, scale: 0.45 },
    { x: 180, y: -180, rotation: 8, scale: 0.4 },
    { x: -100, y: 180, rotation: 12, scale: 0.42 },
    { x: 200, y: 100, rotation: -5, scale: 0.48 },
  ],
};

/**
 * Polaroid stack style
 */
export const LAYOUT_POLAROID_STACK: CollageLayout = {
  name: "polaroid-stack",
  positions: [
    { x: -30, y: 20, rotation: -12, scale: 0.6 },
    { x: 10, y: -10, rotation: 4, scale: 0.6 },
    { x: 40, y: 30, rotation: 15, scale: 0.6 },
  ],
};

/**
 * Heart shape arrangement (for 5-7 images)
 */
export const LAYOUT_HEART: CollageLayout = {
  name: "heart",
  positions: [
    // Top left curve
    { x: -180, y: -80, rotation: -15, scale: 0.35 },
    // Top center
    { x: 0, y: -200, rotation: 0, scale: 0.35 },
    // Top right curve
    { x: 180, y: -80, rotation: 15, scale: 0.35 },
    // Left side
    { x: -220, y: 80, rotation: -20, scale: 0.35 },
    // Right side
    { x: 220, y: 80, rotation: 20, scale: 0.35 },
    // Bottom left
    { x: -120, y: 200, rotation: -10, scale: 0.35 },
    // Bottom right
    { x: 120, y: 200, rotation: 10, scale: 0.35 },
    // Bottom point
    { x: 0, y: 320, rotation: 0, scale: 0.38 },
  ],
};

/**
 * Circle arrangement
 */
export const LAYOUT_CIRCLE: CollageLayout = {
  name: "circle",
  positions: Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const radius = 200;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      rotation: (i - 3) * 8,
      scale: 0.4,
    };
  }),
};

/**
 * Timeline/horizontal scroll style
 */
export const LAYOUT_TIMELINE: CollageLayout = {
  name: "timeline",
  positions: [
    { x: -350, y: 0, rotation: -5, scale: 0.4 },
    { x: -175, y: 30, rotation: 3, scale: 0.4 },
    { x: 0, y: -20, rotation: -2, scale: 0.42 },
    { x: 175, y: 25, rotation: 4, scale: 0.4 },
    { x: 350, y: -10, rotation: -3, scale: 0.4 },
  ],
};

/**
 * Vertical stack
 */
export const LAYOUT_VERTICAL_STACK: CollageLayout = {
  name: "vertical-stack",
  positions: [
    { x: 0, y: -250, rotation: -8, scale: 0.45 },
    { x: 20, y: -80, rotation: 5, scale: 0.45 },
    { x: -15, y: 90, rotation: -3, scale: 0.45 },
    { x: 10, y: 260, rotation: 6, scale: 0.45 },
  ],
};

/**
 * Couple together - two stickers close, slightly overlapping
 */
export const LAYOUT_COUPLE: CollageLayout = {
  name: "couple",
  positions: [
    { x: -80, y: 0, rotation: -5, scale: 0.7 },
    { x: 80, y: 20, rotation: 5, scale: 0.65 },
  ],
};

/**
 * All layouts mapped by name
 */
export const COLLAGE_LAYOUTS: Record<string, CollageLayout> = {
  duo: LAYOUT_DUO,
  "duo-diagonal": LAYOUT_DUO_DIAGONAL,
  trio: LAYOUT_TRIO,
  "trio-row": LAYOUT_TRIO_ROW,
  quad: LAYOUT_QUAD,
  "quad-scattered": LAYOUT_QUAD_SCATTERED,
  "polaroid-stack": LAYOUT_POLAROID_STACK,
  heart: LAYOUT_HEART,
  circle: LAYOUT_CIRCLE,
  timeline: LAYOUT_TIMELINE,
  "vertical-stack": LAYOUT_VERTICAL_STACK,
  couple: LAYOUT_COUPLE,
};

export type LayoutName = keyof typeof COLLAGE_LAYOUTS;

/**
 * Get layout by name
 */
export function getLayout(name: LayoutName): CollageLayout {
  return COLLAGE_LAYOUTS[name] || LAYOUT_DUO;
}

/**
 * Get layout that fits the number of images
 */
export function getLayoutForCount(count: number): CollageLayout {
  if (count <= 1) return LAYOUT_DUO; // Will only use first position
  if (count === 2) return LAYOUT_DUO;
  if (count === 3) return LAYOUT_TRIO;
  if (count === 4) return LAYOUT_QUAD;
  if (count <= 6) return LAYOUT_CIRCLE;
  return LAYOUT_HEART;
}

/**
 * Generate entry positions (off-screen) for each sticker
 */
export function getEntryPositions(
  layout: CollageLayout,
  direction: "random" | "left" | "right" | "top" | "bottom" | "edges" = "random"
): StickerPosition[] {
  const screenWidth = 1080;
  const screenHeight = 1920;

  return layout.positions.map((pos, i) => {
    let entryX = pos.x;
    let entryY = pos.y;

    switch (direction) {
      case "left":
        entryX = -screenWidth / 2 - 200;
        break;
      case "right":
        entryX = screenWidth / 2 + 200;
        break;
      case "top":
        entryY = -screenHeight / 2 - 200;
        break;
      case "bottom":
        entryY = screenHeight / 2 + 200;
        break;
      case "edges":
        // Alternate from different edges
        const edge = i % 4;
        if (edge === 0) entryX = -screenWidth / 2 - 200;
        else if (edge === 1) entryX = screenWidth / 2 + 200;
        else if (edge === 2) entryY = -screenHeight / 2 - 200;
        else entryY = screenHeight / 2 + 200;
        break;
      case "random":
      default:
        // Random edge
        const randomEdge = Math.floor(Math.random() * 4);
        if (randomEdge === 0) entryX = -screenWidth / 2 - 200;
        else if (randomEdge === 1) entryX = screenWidth / 2 + 200;
        else if (randomEdge === 2) entryY = -screenHeight / 2 - 200;
        else entryY = screenHeight / 2 + 200;
        break;
    }

    return {
      x: entryX,
      y: entryY,
      rotation: pos.rotation + (Math.random() - 0.5) * 30,
      scale: 0.3,
    };
  });
}
