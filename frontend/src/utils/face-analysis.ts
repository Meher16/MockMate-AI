import type { CameraMetrics, FaceLandmark } from "@/types/camera";
import { LANDMARK, createEmptyMetrics } from "@/types/camera";

const YAW_THRESHOLD = 0.08;
const PITCH_THRESHOLD = 0.1;
const CENTER_MIN = 0.32;
const CENTER_MAX = 0.68;

function dist(a: FaceLandmark, b: FaceLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function estimateHeadPose(landmarks: FaceLandmark[]) {
  const nose = landmarks[LANDMARK.NOSE_TIP];
  const leftEye = landmarks[LANDMARK.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARK.RIGHT_EYE_OUTER];
  const forehead = landmarks[LANDMARK.FOREHEAD];
  const chin = landmarks[LANDMARK.CHIN];

  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeWidth = Math.abs(rightEye.x - leftEye.x) || 0.01;
  const yaw = (nose.x - eyeMidX) / eyeWidth;

  const faceHeight = Math.abs(chin.y - forehead.y) || 0.01;
  const pitch = (nose.y - forehead.y) / faceHeight - 0.55;

  return { yaw, pitch };
}

function computeFaceVisibility(landmarks: FaceLandmark[]): number {
  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;

  for (const lm of landmarks) {
    minX = Math.min(minX, lm.x);
    maxX = Math.max(maxX, lm.x);
    minY = Math.min(minY, lm.y);
    maxY = Math.max(maxY, lm.y);
  }

  const inFrame =
    minX >= 0.02 && maxX <= 0.98 && minY >= 0.02 && maxY <= 0.98;
  const sizeScore = Math.min(100, Math.round((maxX - minX) * 200));
  return inFrame ? Math.max(40, sizeScore) : Math.round(sizeScore * 0.5);
}

function computeEyeContact(landmarks: FaceLandmark[], yaw: number, pitch: number): number {
  const nose = landmarks[LANDMARK.NOSE_TIP];
  let score = 100;

  if (nose.x < CENTER_MIN || nose.x > CENTER_MAX) score -= 30;
  if (Math.abs(yaw) > YAW_THRESHOLD) score -= Math.min(40, Math.abs(yaw) * 200);
  if (Math.abs(pitch) > PITCH_THRESHOLD) score -= Math.min(30, Math.abs(pitch) * 150);

  const leftOpen = dist(landmarks[LANDMARK.LEFT_EYE_TOP], landmarks[LANDMARK.LEFT_EYE_BOTTOM]);
  const rightOpen = dist(landmarks[LANDMARK.RIGHT_EYE_TOP], landmarks[LANDMARK.RIGHT_EYE_BOTTOM]);
  const eyeWidth = dist(landmarks[LANDMARK.LEFT_EYE_OUTER], landmarks[LANDMARK.RIGHT_EYE_OUTER]) || 0.01;
  const avgOpen = (leftOpen + rightOpen) / 2 / eyeWidth;
  if (avgOpen < 0.08) score -= 25;

  return Math.max(0, Math.min(100, Math.round(score)));
}

const noseHistory: { x: number; y: number; t: number }[] = [];
const MAX_HISTORY = 30;

function computeHeadStability(nose: FaceLandmark): { stability: number; level: CameraMetrics["headMovementLevel"] } {
  noseHistory.push({ x: nose.x, y: nose.y, t: Date.now() });
  if (noseHistory.length > MAX_HISTORY) noseHistory.shift();

  if (noseHistory.length < 5) {
    return { stability: 100, level: "stable" };
  }

  const xs = noseHistory.map((p) => p.x);
  const ys = noseHistory.map((p) => p.y);
  const avgX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
  const variance =
    xs.reduce((s, x) => s + (x - avgX) ** 2, 0) / xs.length +
    ys.reduce((s, y) => s + (y - avgY) ** 2, 0) / ys.length;

  const movement = Math.sqrt(variance);
  const stability = Math.max(0, Math.min(100, Math.round(100 - movement * 800)));

  let level: CameraMetrics["headMovementLevel"] = "stable";
  if (movement > 0.025) level = "high";
  else if (movement > 0.012) level = "moderate";

  return { stability, level };
}

export function resetHeadStabilityHistory(): void {
  noseHistory.length = 0;
}

export function analyzeFaceLandmarks(
  landmarks: FaceLandmark[],
  faceCount: number
): CameraMetrics {
  if (!landmarks.length) {
    return createEmptyMetrics();
  }

  const { yaw, pitch } = estimateHeadPose(landmarks);
  const faceVisibility = computeFaceVisibility(landmarks);
  const eyeContactScore = computeEyeContact(landmarks, yaw, pitch);
  const nose = landmarks[LANDMARK.NOSE_TIP];
  const { stability, level } = computeHeadStability(nose);

  const lookingAway =
    Math.abs(yaw) > YAW_THRESHOLD * 1.5 ||
    Math.abs(pitch) > PITCH_THRESHOLD * 1.5 ||
    nose.x < CENTER_MIN - 0.05 ||
    nose.x > CENTER_MAX + 0.05;

  return {
    faceDetected: true,
    faceVisibility,
    eyeContactScore,
    lookingAway,
    multipleFaces: faceCount > 1,
    headStability: stability,
    headMovementLevel: level,
    timestamp: Date.now(),
  };
}
