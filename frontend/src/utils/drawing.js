/**
 * High-performance canvas drawing utility for MediaPipe landmarks.
 * Renders glowing skeleton, hands, and facial contours with sub-pixel alignment.
 * Un-mirrors text labels so they remain readable on mirrored canvas elements.
 */

const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17],
];

const POSE_CONNECTIONS = [
  // Shoulders & Chest
  [11, 12],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Torso
  [11, 23], [12, 24], [23, 24],
  // Left leg
  [23, 25], [25, 27],
  // Right leg
  [24, 26], [26, 28],
];

// Key facial contour landmark indices
const FACE_KEY_POINTS = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

/**
 * Draw detected landmarks onto a 2D canvas context.
 */
export function drawLandmarks(ctx, landmarks, width, height, options = {}) {
  const {
    showPose = true,
    showHands = true,
    showFace = true,
  } = options;

  ctx.clearRect(0, 0, width, height);
  if (!landmarks) return;

  // ── 1. Pose Skeleton ──────────────────────────────────────────────
  if (showPose && landmarks.pose && landmarks.pose.length > 0) {
    const pose = landmarks.pose;

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)'; // Bright Indigo
    ctx.lineCap = 'round';

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const p1 = pose[startIdx];
      const p2 = pose[endIdx];

      if (p1 && p2 && (p1.visibility ?? 1) > 0.35 && (p2.visibility ?? 1) > 0.35) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    // Pose joints
    for (let i = 0; i < pose.length; i++) {
      const p = pose[i];
      if (p && (p.visibility ?? 1) > 0.35) {
        const x = p.x * width;
        const y = p.y * height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  }

  // ── 2. Face Mesh Contours ─────────────────────────────────────────
  if (showFace && landmarks.face && landmarks.face.length > 0) {
    const face = landmarks.face;
    ctx.fillStyle = 'rgba(192, 132, 252, 0.55)'; // Lavender
    for (const idx of FACE_KEY_POINTS) {
      const p = face[idx];
      if (p) {
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  // ── 3. Hands & Fingers ────────────────────────────────────────────
  if (showHands && landmarks.hands && landmarks.hands.length > 0) {
    for (let h = 0; h < landmarks.hands.length; h++) {
      const hand = landmarks.hands[h];
      const cat = landmarks.handedness?.[h]?.[0];
      const label = (cat?.categoryName || cat?.displayName || '').toLowerCase();
      const isRight = label === 'right';

      const strokeColor = isRight ? 'rgba(34, 197, 94, 0.95)' : 'rgba(236, 72, 153, 0.95)';
      const fillColor = isRight ? '#22c55e' : '#ec4899';

      // Connect finger joints
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = 'round';

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const p1 = hand[startIdx];
        const p2 = hand[endIdx];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      }

      // Draw hand joints
      for (let i = 0; i < hand.length; i++) {
        const p = hand[i];
        if (p) {
          const x = p.x * width;
          const y = p.y * height;
          const isTip = [4, 8, 12, 16, 20].includes(i);

          ctx.beginPath();
          ctx.arc(x, y, isTip ? 4.5 : 3, 0, 2 * Math.PI);
          ctx.fillStyle = fillColor;
          ctx.fill();

          if (isTip) {
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        }
      }

      // Wrist Hand Tag (un-mirrored so text is readable on mirrored canvas)
      if (hand[0]) {
        const wristX = hand[0].x * width;
        const wristY = hand[0].y * height + 20;

        ctx.save();
        ctx.translate(wristX, wristY);
        ctx.scale(-1, 1); // Un-mirror the text so it's not backwards!

        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
        const tagText = isRight ? 'Right Hand' : 'Left Hand';
        const textMetrics = ctx.measureText(tagText);
        const padding = 4;
        ctx.fillRect(-textMetrics.width / 2 - padding, -10, textMetrics.width + padding * 2, 16);

        ctx.fillStyle = fillColor;
        ctx.textAlign = 'center';
        ctx.fillText(tagText, 0, 2);
        ctx.restore();
      }
    }
  }
}
