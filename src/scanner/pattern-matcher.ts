import fs from "node:fs/promises";
import type { PatternRule } from "../profiles/types.js";
import type { PatternHit } from "../types/scan-result.js";

export async function matchPatterns(
  filePath: string,
  rules: PatternRule[],
): Promise<PatternHit[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const hits: PatternHit[] = [];

  for (const rule of rules) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = rule.pattern.exec(line);
      if (match) {
        hits.push({
          rule: rule.id,
          category: rule.category,
          severity: rule.severity,
          file: filePath,
          line: i + 1,
          match: match[0],
          message: rule.message,
        });
      }
    }
  }

  return hits;
}
