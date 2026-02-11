import { AbsoluteFill, Video, Img, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { FC } from 'react';

export interface FrameOverlayProps {
  videoSrc: string;
  images: string[];
}

/**
 * Valentine Frame Overlay Composition
 * Overlays couple images onto the moving photo frames in the Valentine video
 */
export const ValentineFrameOverlay: FC<FrameOverlayProps> = ({ videoSrc, images }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame timings based on video analysis (24fps, 70.5s duration)
  // Frame 1 appears around 10s, Frame 2 around 25s, Frame 3 around 40s
  const frame1Start = fps * 10;
  const frame1End = fps * 18;
  const frame2Start = fps * 21;
  const frame2End = fps * 32;
  const frame3Start = fps * 38;
  const frame3End = fps * 50;

  // Image 1 - Rose bordered frame (appears ~10s)
  const image1Opacity = interpolate(
    frame,
    [frame1Start, frame1Start + 12, frame1End - 12, frame1End],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const image1Scale = interpolate(
    frame,
    [frame1Start, frame1Start + 24, frame1End - 24, frame1End],
    [0.7, 1, 1, 1.2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Image 2 - Ornate gem frame (appears ~25s)
  const image2Opacity = interpolate(
    frame,
    [frame2Start, frame2Start + 12, frame2End - 12, frame2End],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const image2Scale = interpolate(
    frame,
    [frame2Start, frame2Start + 24, frame2End - 24, frame2End],
    [0.8, 1, 1, 1.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Image 3 - Gold leaf frame (appears ~40s)
  const image3Opacity = interpolate(
    frame,
    [frame3Start, frame3Start + 12, frame3End - 12, frame3End],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const image3Scale = interpolate(
    frame,
    [frame3Start, frame3Start + 24, frame3End - 24, frame3End],
    [0.85, 1, 1, 1.15],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background Valentine Video */}
      <AbsoluteFill>
        <Video src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>

      {/* Image 1 Overlay - Rose Frame (~10-18s) */}
      {image1Opacity > 0 && images[0] && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: image1Opacity,
          }}
        >
          <div
            style={{
              width: '55%',
              height: '45%',
              transform: `scale(${image1Scale})`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mixBlendMode: 'screen', // Helps blend with green screen
            }}
          >
            <Img
              src={images[0]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Image 2 Overlay - Ornate Frame (~25-32s) */}
      {image2Opacity > 0 && images[1] && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: image2Opacity,
          }}
        >
          <div
            style={{
              width: '52%',
              height: '48%',
              transform: `scale(${image2Scale})`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mixBlendMode: 'screen',
            }}
          >
            <Img
              src={images[1]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Image 3 Overlay - Gold Leaf Frame (~40-50s) */}
      {image3Opacity > 0 && images[2] && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: image3Opacity,
          }}
        >
          <div
            style={{
              width: '58%',
              height: '50%',
              transform: `scale(${image3Scale})`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mixBlendMode: 'screen',
            }}
          >
            <Img
              src={images[2] || images[0]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
