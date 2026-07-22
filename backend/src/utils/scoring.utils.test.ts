import { describe, expect, it } from 'vitest';
import {
  aggregateCameraMetrics,
  computeCommunicationScore,
  computeConfidenceFromCamera,
  computeOverallScore,
  computeResumeMatch,
  isBehavioralCategory,
  scoreToPercent,
} from './scoring.utils';

describe('scoreToPercent', () => {
  it('converts 1-10 scale to percentage', () => {
    expect(scoreToPercent(7.5)).toBe(75);
    expect(scoreToPercent(10)).toBe(100);
    expect(scoreToPercent(0)).toBe(0);
  });

  it('clamps out-of-range values', () => {
    expect(scoreToPercent(12)).toBe(100);
    expect(scoreToPercent(-1)).toBe(0);
  });
});

describe('computeCommunicationScore', () => {
  it('returns 50 for empty answers', () => {
    expect(computeCommunicationScore([])).toBe(50);
  });

  it('rewards structured, detailed answers', () => {
    const detailed =
      'First, I analyzed the problem because it was complex. For instance, I used React hooks specifically. Finally, I deployed the solution with tests.';
    const brief = 'Yes it works.';

    expect(computeCommunicationScore([detailed])).toBeGreaterThan(
      computeCommunicationScore([brief])
    );
  });
});

describe('computeResumeMatch', () => {
  it('returns default when no resume text', () => {
    expect(computeResumeMatch(undefined, ['I know JavaScript'])).toBe(70);
  });

  it('increases score when answers mention resume keywords', () => {
    const resume = 'Experienced in React TypeScript Node.js PostgreSQL';
    const matched = computeResumeMatch(resume, [
      'I have built many React and TypeScript applications with Node.js',
    ]);
    const unmatched = computeResumeMatch(resume, ['I enjoy cooking and hiking']);

    expect(matched).toBeGreaterThan(unmatched);
  });
});

describe('computeConfidenceFromCamera', () => {
  it('returns default when no metrics', () => {
    expect(computeConfidenceFromCamera([])).toBe(65);
  });

  it('penalizes looking away and multiple faces', () => {
    const good = computeConfidenceFromCamera([
      { avgEyeContact: 90, avgHeadStability: 85, lookingAwayCount: 0, multipleFacesCount: 0, samples: 10 },
    ]);
    const poor = computeConfidenceFromCamera([
      { avgEyeContact: 50, avgHeadStability: 40, lookingAwayCount: 10, multipleFacesCount: 3, samples: 10 },
    ]);

    expect(good).toBeGreaterThan(poor);
  });
});

describe('isBehavioralCategory', () => {
  it('detects behavioral categories', () => {
    expect(isBehavioralCategory('Behavioral Leadership')).toBe(true);
    expect(isBehavioralCategory('HR Round')).toBe(true);
    expect(isBehavioralCategory('Technical')).toBe(false);
    expect(isBehavioralCategory(null)).toBe(false);
  });
});

describe('computeOverallScore', () => {
  it('applies weighted formula', () => {
    const score = computeOverallScore({
      technicalScore: 80,
      communicationScore: 70,
      confidenceScore: 60,
      problemSolvingScore: 75,
      resumeMatchScore: 65,
      behavioralScore: 70,
    });

    expect(score).toBe(72);
  });
});

describe('aggregateCameraMetrics', () => {
  it('returns null for empty metrics', () => {
    expect(aggregateCameraMetrics([null, undefined])).toBeNull();
  });

  it('averages camera metrics across questions', () => {
    const result = aggregateCameraMetrics([
      { avgEyeContact: 80, avgHeadStability: 70, lookingAwayCount: 2, multipleFacesCount: 0, samples: 5 },
      { avgEyeContact: 60, avgHeadStability: 90, lookingAwayCount: 1, multipleFacesCount: 1, samples: 5 },
    ]);

    expect(result).toEqual({
      avgEyeContact: 70,
      avgHeadStability: 80,
      totalLookingAway: 3,
      totalMultipleFaces: 1,
      questionsWithCamera: 2,
    });
  });
});
