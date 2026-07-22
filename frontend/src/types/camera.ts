export interface CameraMetrics {
  faceDetected: boolean;
  faceVisibility: number;
  eyeContactScore: number;
  lookingAway: boolean;
  multipleFaces: boolean;
  headStability: number;
  headMovementLevel: "stable" | "moderate" | "high";
  timestamp: number;
}

export interface CameraMetricsSummary {
  samples: number;
  avgEyeContact: number;
  lookingAwayCount: number;
  multipleFacesCount: number;
  avgFaceVisibility: number;
  avgHeadStability: number;
}

export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export const LANDMARK = {
  NOSE_TIP: 1,
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
} as const;

export function createEmptyMetrics(): CameraMetrics {
  return {
    faceDetected: false,
    faceVisibility: 0,
    eyeContactScore: 0,
    lookingAway: true,
    multipleFaces: false,
    headStability: 100,
    headMovementLevel: "stable",
    timestamp: Date.now(),
  };
}

export function summarizeMetrics(history: CameraMetrics[]): CameraMetricsSummary {
  if (history.length === 0) {
    return {
      samples: 0,
      avgEyeContact: 0,
      lookingAwayCount: 0,
      multipleFacesCount: 0,
      avgFaceVisibility: 0,
      avgHeadStability: 0,
    };
  }

  return {
    samples: history.length,
    avgEyeContact: Math.round(
      history.reduce((s, m) => s + m.eyeContactScore, 0) / history.length
    ),
    lookingAwayCount: history.filter((m) => m.lookingAway).length,
    multipleFacesCount: history.filter((m) => m.multipleFaces).length,
    avgFaceVisibility: Math.round(
      history.reduce((s, m) => s + m.faceVisibility, 0) / history.length
    ),
    avgHeadStability: Math.round(
      history.reduce((s, m) => s + m.headStability, 0) / history.length
    ),
  };
}
