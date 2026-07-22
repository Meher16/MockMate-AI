export interface CameraMetricsInput {
  avgEyeContact: number;
  avgHeadStability: number;
  lookingAwayCount: number;
  multipleFacesCount: number;
  samples: number;
}

export interface FeedbackScoreInput {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  resumeMatchScore: number;
  behavioralScore: number;
}

export function scoreToPercent(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score * 10)));
}

export function computeCommunicationScore(answers: string[]): number {
  if (!answers.length) return 50;
  let total = 0;
  for (const text of answers) {
    const words = text.split(/\s+/).filter(Boolean).length;
    let s = 50;
    if (words >= 40) s += 20;
    else if (words >= 20) s += 10;
    if (/example|for instance|specifically/i.test(text)) s += 10;
    if (/first|second|finally|because|therefore/i.test(text)) s += 10;
    if (words < 10) s -= 20;
    total += Math.min(100, Math.max(20, s));
  }
  return Math.round(total / answers.length);
}

export function computeResumeMatch(resumeText: string | undefined, answers: string[]): number {
  if (!resumeText) return 70;
  const resumeWords = new Set(
    resumeText.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );
  const answerText = answers.join(' ').toLowerCase();
  let matches = 0;
  let checked = 0;
  for (const word of resumeWords) {
    if (checked > 200) break;
    checked++;
    if (answerText.includes(word)) matches++;
  }
  const ratio = resumeWords.size > 0 ? matches / Math.min(resumeWords.size, 50) : 0;
  return Math.round(Math.min(100, 40 + ratio * 60));
}

export function computeConfidenceFromCamera(
  metrics: Array<CameraMetricsInput | null | undefined>
): number {
  const valid = metrics.filter(Boolean) as CameraMetricsInput[];
  if (!valid.length) return 65;

  let total = 0;
  for (const m of valid) {
    let s = m.avgEyeContact * 0.5 + m.avgHeadStability * 0.3;
    s -= Math.min(30, m.lookingAwayCount * 2);
    s -= Math.min(20, m.multipleFacesCount * 5);
    total += Math.max(0, Math.min(100, s));
  }
  return Math.round(total / valid.length);
}

export function isBehavioralCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  return /behavioral|hr|soft|star/i.test(category);
}

export function computeOverallScore(scores: FeedbackScoreInput): number {
  return Math.round(
    scores.technicalScore * 0.3 +
      scores.communicationScore * 0.2 +
      scores.confidenceScore * 0.15 +
      scores.problemSolvingScore * 0.15 +
      scores.resumeMatchScore * 0.1 +
      scores.behavioralScore * 0.1
  );
}

export function aggregateCameraMetrics(
  metrics: Array<CameraMetricsInput | null | undefined>
) {
  const valid = metrics.filter(Boolean) as CameraMetricsInput[];
  if (!valid.length) return null;

  return {
    avgEyeContact: Math.round(valid.reduce((s, m) => s + m.avgEyeContact, 0) / valid.length),
    avgHeadStability: Math.round(valid.reduce((s, m) => s + m.avgHeadStability, 0) / valid.length),
    totalLookingAway: valid.reduce((s, m) => s + m.lookingAwayCount, 0),
    totalMultipleFaces: valid.reduce((s, m) => s + m.multipleFacesCount, 0),
    questionsWithCamera: valid.length,
  };
}
