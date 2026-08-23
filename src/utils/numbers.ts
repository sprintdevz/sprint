/** Numeric helpers. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function roundToInt(value: number): number {
  return Math.round(value);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/** Sliding-window average (equal weights). */
export function movingAverage(values: number[], window: number): number[] {
  if (window <= 0) return values.slice();
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    out.push(mean(slice));
  }
  return out;
}

/** Percentile rank of `value` inside `sortedValues` (ascending). Returns 0..1. */
export function percentileRank(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) return 0.5;
  const less = sortedValues.filter((v) => v < value).length;
  const equal = sortedValues.filter((v) => v === value).length;
  return (less + equal / 2) / sortedValues.length;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Deterministic pseudo-random for reproducible session generation. */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}