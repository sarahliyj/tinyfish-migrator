import { getProfile } from "../profiles/registry.js";
import { walkFiles } from "../scanner/walker.js";
import { matchPatterns } from "../scanner/pattern-matcher.js";
import { analyzeDependencies } from "../scanner/dependency-analyzer.js";
import { classifyDifficulty } from "../scanner/difficulty-classifier.js";
import type { ScanResult, FileMatch, PatternHit } from "../types/scan-result.js";

export async function scanCodebase(
  projectPath: string,
  profileId: string,
): Promise<ScanResult> {
  const profile = getProfile(profileId);
  if (!profile) {
    const { listProfiles } = await import("../profiles/registry.js");
    throw new Error(
      `Unknown migration profile: "${profileId}". Available: ${listProfiles().join(", ")}`,
    );
  }

  // Collect unique file globs from pattern rules
  const globs = [...new Set(profile.patternRules.map((r) => r.fileGlob))];

  // Walk all matching files
  const allFiles: string[] = [];
  for (const g of globs) {
    const files = await walkFiles(projectPath, g);
    allFiles.push(...files);
  }
  const uniqueFiles = [...new Set(allFiles)].sort();

  // Match patterns per file
  const fileMatches: FileMatch[] = [];
  const allHits: PatternHit[] = [];

  for (const file of uniqueFiles) {
    const hits = await matchPatterns(file, profile.patternRules);
    if (hits.length > 0) {
      allHits.push(...hits);
      fileMatches.push({
        file,
        hits,
        difficulty: classifyDifficulty(hits),
      });
    }
  }

  // Analyze dependencies
  const dependencyIssues = await analyzeDependencies(
    projectPath,
    profile.dependencyRules,
  );

  const stats = {
    totalFiles: uniqueFiles.length,
    filesWithIssues: fileMatches.length,
    totalHits: allHits.length,
    breakingChanges: allHits.filter((h) => h.severity === "breaking").length,
    deprecations: allHits.filter((h) => h.severity === "deprecated").length,
    warnings: allHits.filter((h) => h.severity === "warning").length,
  };

  return {
    profileId,
    projectPath,
    files: fileMatches,
    dependencyIssues,
    stats,
  };
}
