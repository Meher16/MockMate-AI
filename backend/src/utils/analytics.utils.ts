export function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function computeScoreChange(recentScores: number[], priorScores: number[]): number | null {
  const recentAvg = average(recentScores);
  const priorAvg = average(priorScores);
  if (recentAvg == null || priorAvg == null) return null;
  return Math.round((recentAvg - priorAvg) * 10) / 10;
}
