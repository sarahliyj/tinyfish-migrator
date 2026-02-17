import type { PatternHit } from "../types/scan-result.js";

const SEVERITY_WEIGHTS: Record<string, number> = {
  breaking: 3,
  deprecated: 1,
  warning: 0.5,
};

export function classifyDifficulty(
  hits: PatternHit[],
): "low" | "medium" | "high" {
  let score = 0;
  for (const hit of hits) {
    score += SEVERITY_WEIGHTS[hit.severity] ?? 0;
  }

  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}
