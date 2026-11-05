export interface RatingPair {
  ai: number;
  human: number;
}

export interface AgreementStats {
  n: number;
  /** Share of pairs where the AI level equals the human level. */
  exact: number | null;
  /** Share within one level (the plan's operational target is at least 0.9). */
  adjacent: number | null;
  /** Mean of (AI − human). Positive means the AI is more generous than the human. */
  meanBias: number | null;
  /** Quadratic weighted kappa on the 1–4 scale; 1 = perfect agreement, 0 = chance. */
  qwk: number | null;
  /** confusion[human - 1][ai - 1] = count. */
  confusion: number[][];
}

const LEVELS = [1, 2, 3, 4];

export function quadraticWeightedKappa(pairs: RatingPair[]): number | null {
  const k = LEVELS.length;
  const n = pairs.length;
  if (n === 0) return null;
  const observed = LEVELS.map(() => LEVELS.map(() => 0));
  for (const p of pairs) observed[p.human - 1][p.ai - 1] += 1;
  const humanHist = observed.map((row) => row.reduce((a, b) => a + b, 0));
  const aiHist = LEVELS.map((_, j) =>
    observed.reduce((a, row) => a + row[j], 0),
  );
  let num = 0;
  let den = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const w = (i - j) ** 2 / (k - 1) ** 2;
      num += w * observed[i][j];
      den += w * ((humanHist[i] * aiHist[j]) / n);
    }
  }
  // Every rating identical on both sides: kappa is undefined.
  return den === 0 ? null : 1 - num / den;
}

export function agreementStats(raw: RatingPair[]): AgreementStats {
  const pairs = raw.filter(
    (p) => LEVELS.includes(p.ai) && LEVELS.includes(p.human),
  );
  const n = pairs.length;
  const confusion = LEVELS.map(() => LEVELS.map(() => 0));
  for (const p of pairs) confusion[p.human - 1][p.ai - 1] += 1;
  const share = (pred: (p: RatingPair) => boolean) =>
    n ? pairs.filter(pred).length / n : null;
  return {
    n,
    exact: share((p) => p.ai === p.human),
    adjacent: share((p) => Math.abs(p.ai - p.human) <= 1),
    meanBias: n ? pairs.reduce((a, p) => a + (p.ai - p.human), 0) / n : null,
    qwk: quadraticWeightedKappa(pairs),
    confusion,
  };
}
