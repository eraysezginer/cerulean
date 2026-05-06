import { flagPolarity, type CompanyFlagDetail, type Confidence } from "@/data/flag-types";

type Counts = {
  negativeHigh: number;
  negativeMedium: number;
  negativeLow: number;
  positiveHigh: number;
  positiveMedium: number;
  positiveLow: number;
};

const BASELINE = 50;
const NEGATIVE_WEIGHTS: Record<Confidence, number> = {
  High: 12,
  Medium: 8,
  Low: 4,
};
const POSITIVE_WEIGHTS: Record<Confidence, number> = {
  High: 10,
  Medium: 6,
  Low: 3,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function computeHealthScoreV1FromCounts(c: Counts): number {
  const negativeImpact =
    c.negativeHigh * NEGATIVE_WEIGHTS.High +
    c.negativeMedium * NEGATIVE_WEIGHTS.Medium +
    c.negativeLow * NEGATIVE_WEIGHTS.Low;
  const positiveImpact =
    c.positiveHigh * POSITIVE_WEIGHTS.High +
    c.positiveMedium * POSITIVE_WEIGHTS.Medium +
    c.positiveLow * POSITIVE_WEIGHTS.Low;
  return clamp(Math.round(BASELINE + positiveImpact - negativeImpact), 0, 100);
}

export function computeHealthScoreV1FromFlags(flags: CompanyFlagDetail[]): number {
  const counts: Counts = {
    negativeHigh: 0,
    negativeMedium: 0,
    negativeLow: 0,
    positiveHigh: 0,
    positiveMedium: 0,
    positiveLow: 0,
  };

  for (const flag of flags) {
    const polarity = flagPolarity(flag);
    if (polarity === "positive") {
      if (flag.confidence === "High") counts.positiveHigh += 1;
      else if (flag.confidence === "Medium") counts.positiveMedium += 1;
      else counts.positiveLow += 1;
    } else {
      if (flag.confidence === "High") counts.negativeHigh += 1;
      else if (flag.confidence === "Medium") counts.negativeMedium += 1;
      else counts.negativeLow += 1;
    }
  }
  return computeHealthScoreV1FromCounts(counts);
}
