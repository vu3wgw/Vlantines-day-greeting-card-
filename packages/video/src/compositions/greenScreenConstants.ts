/**
 * Green screen slot definitions — each slot maps a user image
 * to a time range in the template video where green pixels appear.
 */
export const GREEN_SCREEN_SLOTS = [
  { slotIndex: 0, startAtFrame: 180, endAtFrame: 405, greenThreshold: 155, redLimit: 100, blueLimit: 100 },
  { slotIndex: 1, startAtFrame: 450, endAtFrame: 705, greenThreshold: 100, redLimit: 130, blueLimit: 130 },
  { slotIndex: 2, startAtFrame: 750, endAtFrame: 960, greenThreshold: 155, redLimit: 100, blueLimit: 100 },
  { slotIndex: 3, startAtFrame: 1020, endAtFrame: 1245, greenThreshold: 155, redLimit: 100, blueLimit: 100 },
  { slotIndex: 4, startAtFrame: 1275, endAtFrame: 1530, greenThreshold: 155, redLimit: 100, blueLimit: 100 },
] as const;

export const GREEN_SCREEN_CONFIG = {
  fps: 30,
  width: 416,
  height: 752,
  durationInFrames: 2111,
  templateVideoSrc: "valentine-template.mp4",
  slotCount: 5,
} as const;
