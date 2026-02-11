import React from "react";
import { random } from "remotion";
import type { TransitionType, TransitionProps } from "../timeline/types";
import { ALL_TRANSITIONS } from "../timeline/types";
import { CrossFade } from "./CrossFade";
import { SlideLeft, SlideRight, SlideUp, SlideDown } from "./SlideTransition";
import { ZoomTransition } from "./ZoomTransition";
import { BlurTransition } from "./BlurTransition";
import { WipeHorizontal, WipeVertical } from "./WipeTransition";

// Export all transition components
export {
  CrossFade,
  SlideLeft,
  SlideRight,
  SlideUp,
  SlideDown,
  ZoomTransition,
  BlurTransition,
  WipeHorizontal,
  WipeVertical,
};

// Export premium transitions
export * from "./premium";

// Map transition types to components
export const TransitionComponents: Record<
  TransitionType,
  React.FC<TransitionProps>
> = {
  crossfade: CrossFade,
  slideLeft: SlideLeft,
  slideRight: SlideRight,
  slideUp: SlideUp,
  slideDown: SlideDown,
  zoom: ZoomTransition,
  blur: BlurTransition,
  wipeHorizontal: WipeHorizontal,
  wipeVertical: WipeVertical,
};

// Get transition component by type
export function getTransitionComponent(
  type: TransitionType
): React.FC<TransitionProps> {
  return TransitionComponents[type] || CrossFade;
}

// Auto-assign transitions based on seed for variety
export function autoAssignTransitions(
  seed: number,
  imageCount: number
): TransitionType[] {
  const transitions: TransitionType[] = [];

  for (let i = 0; i < imageCount; i++) {
    // Use seed + index for unique but consistent selection
    const randomValue = random(`transition-${seed}-${i}`);
    const randomIndex = Math.floor(randomValue * ALL_TRANSITIONS.length);
    const selected = ALL_TRANSITIONS[randomIndex];
    transitions.push(selected ?? "crossfade");
  }

  return transitions;
}

// Assign transitions ensuring no consecutive duplicates for more variety
export function autoAssignVariedTransitions(
  seed: number,
  imageCount: number
): TransitionType[] {
  const transitions: TransitionType[] = [];
  let lastTransition: TransitionType | null = null;

  for (let i = 0; i < imageCount; i++) {
    let attempts = 0;
    let selectedTransition: TransitionType = "crossfade";

    // Try to avoid consecutive duplicates (max 3 attempts)
    do {
      const randomValue = random(`transition-${seed}-${i}-${attempts}`);
      const randomIndex = Math.floor(randomValue * ALL_TRANSITIONS.length);
      const selected = ALL_TRANSITIONS[randomIndex];
      selectedTransition = selected ?? "crossfade";
      attempts++;
    } while (selectedTransition === lastTransition && attempts < 3);

    transitions.push(selectedTransition);
    lastTransition = selectedTransition;
  }

  return transitions;
}

// Helper to render content with transition
export function renderWithTransition(
  TransitionComponent: React.FC<TransitionProps>,
  progress: number,
  direction: "in" | "out",
  children: React.ReactNode
): React.ReactElement {
  return React.createElement(TransitionComponent, {
    progress,
    direction,
    children,
  });
}
