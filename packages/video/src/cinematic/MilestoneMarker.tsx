/**
 * MilestoneMarker - Floating milestone cards along the journey
 * Displays photo dates, captions, and thumbnails as arrow passes
 */

import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MilestoneFrameSVG } from "../assets/svg/PlaceholderSVGs";

export interface Milestone {
  /** Unique identifier */
  id: string;
  /** Date string (e.g., "February 2022") */
  date: string;
  /** Photo URL */
  photo?: string;
  /** Caption text */
  caption?: string;
  /** Position along arrow path (0-1) */
  position: number;
  /** Is this a favorite/important milestone? */
  isFavorite?: boolean;
}

export interface MilestoneMarkerProps {
  milestone: Milestone;
  /** Current arrow progress (0-1) */
  arrowProgress: number;
  /** Activation distance threshold */
  activationDistance?: number;
  /** Base color for styling */
  color?: string;
}

/**
 * Individual milestone marker
 */
export const MilestoneMarker: React.FC<MilestoneMarkerProps> = ({
  milestone,
  arrowProgress,
  activationDistance = 0.1,
  color = "#d81b60",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate distance from arrow
  const distance = Math.abs(arrowProgress - milestone.position);
  const isActive = distance < activationDistance;

  // Activation spring animation
  const activationSpring = spring({
    frame: isActive ? frame : 0,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  // Scale up when arrow is near
  const scale = interpolate(
    activationSpring,
    [0, 1],
    [0.8, isActive ? 1.3 : 0.8]
  );

  // Fade in/out based on distance
  const opacity = interpolate(
    distance,
    [0, activationDistance, activationDistance * 2],
    [1, 0.8, 0.3],
    { extrapolateRight: "clamp" }
  );

  // Vertical float animation
  const floatY = Math.sin(frame * 0.05) * 10;

  // Glow effect when active
  const glowIntensity = isActive ? activationSpring : 0;

  // Position calculation (you'll need to map this to actual screen coordinates)
  const screenX = interpolate(milestone.position, [0, 1], [100, 980]);
  const screenY = 800; // Fixed height for ground level

  return (
    <div
      style={{
        position: "absolute",
        left: screenX,
        top: screenY + floatY,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        transition: "all 0.3s ease-out",
      }}
    >
      {/* Glow effect */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            inset: -20,
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            opacity: glowIntensity,
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Milestone card */}
      <div
        style={{
          position: "relative",
          width: 250,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 16,
          boxShadow: `0 8px 32px rgba(0,0,0,${0.1 + glowIntensity * 0.2})`,
          border: `2px solid ${color}`,
        }}
      >
        {/* Favorite indicator */}
        {milestone.isFavorite && (
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 40,
              height: 40,
              backgroundColor: color,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            ★
          </div>
        )}

        {/* Photo thumbnail */}
        {milestone.photo && (
          <div
            style={{
              width: "100%",
              height: 180,
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 12,
              backgroundColor: "#f0f0f0",
            }}
          >
            <Img
              src={milestone.photo}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Date */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            color: color,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {milestone.date}
        </div>

        {/* Caption */}
        {milestone.caption && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {milestone.caption}
          </div>
        )}
      </div>

      {/* Connecting line to ground */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: "50%",
          width: 2,
          height: 100,
          backgroundColor: color,
          opacity: 0.3,
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
};

/**
 * Container for all milestones
 */
export interface MilestoneTrackProps {
  milestones: Milestone[];
  arrowProgress: number;
  color?: string;
}

export const MilestoneTrack: React.FC<MilestoneTrackProps> = ({
  milestones,
  arrowProgress,
  color = "#d81b60",
}) => {
  return (
    <AbsoluteFill>
      {milestones.map((milestone) => (
        <MilestoneMarker
          key={milestone.id}
          milestone={milestone}
          arrowProgress={arrowProgress}
          color={color}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Convert user photo dates to milestone positions
 */
export const generateMilestonesFromPhotos = (
  photos: Array<{ date?: string; url: string; caption?: string; isFavorite?: boolean }>
): Milestone[] => {
  // Filter photos with dates and sort by date
  const photosWithDates = photos
    .filter((p) => p.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  // Map to milestone positions (evenly spaced along path)
  return photosWithDates.map((photo, index) => ({
    id: `milestone-${index}`,
    date: photo.date!,
    photo: photo.url,
    caption: photo.caption,
    position: (index + 1) / (photosWithDates.length + 1), // Evenly spaced from 0 to 1
    isFavorite: photo.isFavorite,
  }));
};

/**
 * Milestone with simple text label (for dates without photos)
 */
export const SimpleMilestoneMarker: React.FC<{
  date: string;
  label: string;
  position: number;
  arrowProgress: number;
  color?: string;
}> = ({ date, label, position, arrowProgress, color = "#d81b60" }) => {
  const frame = useCurrentFrame();
  const distance = Math.abs(arrowProgress - position);
  const isActive = distance < 0.1;

  const scale = isActive ? 1.2 : 0.9;
  const opacity = interpolate(distance, [0, 0.2], [1, 0.3], { extrapolateRight: "clamp" });

  const screenX = interpolate(position, [0, 1], [100, 980]);

  return (
    <div
      style={{
        position: "absolute",
        left: screenX,
        top: 900,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "12px 20px",
          borderRadius: 8,
          border: `2px solid ${color}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            fontWeight: 600,
            color: color,
            textAlign: "center",
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "#666",
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
