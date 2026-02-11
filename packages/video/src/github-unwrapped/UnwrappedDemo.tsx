/**
 * GitHub Unwrapped Demo - Wrapper for the full GitHub Unwrapped animation
 * This imports their Main composition so we can see it in Remotion Studio
 */

import React from "react";
import { Main } from "./Main";
import type { z } from "zod";
import type { compositionSchema } from "./config";

export type UnwrappedDemoProps = z.infer<typeof compositionSchema>;

export const UnwrappedDemo: React.FC<UnwrappedDemoProps> = (props) => {
  return <Main {...props} />;
};

// Sample default props for preview (Jonny Burger's data from their demo)
export const unwrappedDemoDefaultProps: UnwrappedDemoProps = {
  login: "JonnyBurger",
  corner: "bottom-left",
  topLanguages: {
    language1: {
      type: "designed",
      name: "TypeScript",
      percent: 0.6348066751851184,
    },
    language2: {
      type: "other",
      color: "#fcb32c",
      name: "MDX",
      percent: 0.3204561738200702,
    },
    language3: {
      type: "designed",
      name: "JavaScript",
      percent: 0.03752374246343604,
    },
  },
  showHelperLine: false,
  planet: "Gold",
  starsGiven: 9,
  issuesClosed: 195,
  issuesOpened: 39,
  totalPullRequests: 873,
  topWeekday: "4",
  totalContributions: 9489,
  topHour: "10",
  longestStreak: 180,
  graphData: Array.from({ length: 24 }, (_, i) => ({
    productivity: Math.floor(Math.random() * 50),
    time: i,
  })),
  openingSceneStartAngle: "left",
  rocket: "blue",
  contributionData: {
    weeks: Array.from({ length: 52 }, (_, week) => ({
      contributionDays: Array.from({ length: 7 }, (__, day) => ({
        contributionCount: Math.floor(Math.random() * 20),
        date: `2023-${String(week + 1).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}`,
      })),
    })),
  },
  sampleStarredRepos: [
    { name: "remotion-dev/remotion", owner: "remotion-dev" },
    { name: "facebook/react", owner: "facebook" },
    { name: "microsoft/typescript", owner: "microsoft" },
  ],
};
