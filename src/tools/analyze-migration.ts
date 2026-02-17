import { scanCodebase } from "./scan-codebase.js";
import { runResearch } from "../research/research-queries.js";
import type { MigrationReport, CorrelatedIssue, ResearchSummary } from "../types/migration-report.js";
import type { ScanResult, PatternHit } from "../types/scan-result.js";
import type { ResearchResult, ResearchEntry } from "../types/research-result.js";

export async function analyzeMigration(
  projectPath: string,
  profileId: string,
): Promise<MigrationReport> {
  // Run scan and research in parallel
  const [scanResult, researchResult] = await Promise.all([
    scanCodebase(projectPath, profileId),
    runResearch(profileId).catch((err): ResearchResult => {
      console.error("Research failed, proceeding with scan only:", err);
      return { profileId, entries: [], errors: [String(err)] };
    }),
  ]);

  const correlatedIssues = correlateFindings(scanResult, researchResult);
  const riskScore = computeRisk(scanResult);
  const riskLevel = scoreToLevel(riskScore);
  const researchSummary = buildResearchSummary(researchResult);
  const summary = generateSummary(scanResult, researchResult, riskLevel);

  return {
    profileId,
    projectPath,
    riskLevel,
    riskScore,
    summary,
    correlatedIssues,
    dependencyIssues: scanResult.dependencyIssues,
    scanResult,
    researchAvailable: researchResult.entries.length > 0,
    researchSummary,
  };
}

function correlateFindings(
  scan: ScanResult,
  research: ResearchResult,
): CorrelatedIssue[] {
  const allHits: PatternHit[] = scan.files.flatMap((f) => f.hits);

  // Deduplicate hits by rule id (keep first occurrence for each rule)
  const seenRules = new Set<string>();
  const uniqueHits: PatternHit[] = [];
  for (const hit of allHits) {
    if (!seenRules.has(hit.rule)) {
      seenRules.add(hit.rule);
      uniqueHits.push(hit);
    }
  }

  return uniqueHits.map((hit) => ({
    pattern: hit,
    relatedResearch: findRelatedResearch(hit, research.entries),
  }));
}

function findRelatedResearch(
  hit: PatternHit,
  entries: ResearchEntry[],
): ResearchEntry[] {
  const hitTerms = [
    hit.rule.toLowerCase(),
    hit.category.toLowerCase(),
    ...hit.message.toLowerCase().split(/\s+/).filter((w) => w.length > 4),
  ];

  return entries.filter((entry) => {
    const entryText = `${entry.content} ${entry.keywords.join(" ")}`.toLowerCase();
    return hitTerms.some((term) => entryText.includes(term));
  });
}

function computeRisk(scan: ScanResult): number {
  const { breakingChanges, deprecations, warnings } = scan.stats;
  const depScore = scan.dependencyIssues.reduce((sum, d) => {
    if (d.severity === "breaking") return sum + 2;
    if (d.severity === "deprecated") return sum + 1;
    return sum + 0.5;
  }, 0);

  return breakingChanges * 3 + deprecations * 1 + warnings * 0.5 + depScore;
}

function scoreToLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 50) return "critical";
  if (score >= 20) return "high";
  if (score >= 8) return "medium";
  return "low";
}

function generateSummary(
  scan: ScanResult,
  research: ResearchResult,
  riskLevel: string,
): string {
  const lines: string[] = [];

  lines.push(
    `Migration risk: ${riskLevel.toUpperCase()}. ` +
      `Scanned ${scan.stats.totalFiles} files, found ${scan.stats.totalHits} issues ` +
      `in ${scan.stats.filesWithIssues} files.`,
  );

  if (scan.stats.breakingChanges > 0) {
    lines.push(`Breaking changes: ${scan.stats.breakingChanges}`);
  }
  if (scan.stats.deprecations > 0) {
    lines.push(`Deprecations: ${scan.stats.deprecations}`);
  }
  if (scan.stats.warnings > 0) {
    lines.push(`Warnings: ${scan.stats.warnings}`);
  }
  if (scan.dependencyIssues.length > 0) {
    lines.push(
      `Dependency issues: ${scan.dependencyIssues.map((d) => d.name).join(", ")}`,
    );
  }
  if (research.entries.length > 0) {
    lines.push(
      `\n[Mino Web Research] Consulted ${research.entries.length} online sources via TinyFish agent.`,
    );
  } else if (research.errors.length > 0) {
    lines.push("\n[Mino Web Research] Unavailable — results based on local scan only.");
  }

  return lines.join("\n");
}

function buildResearchSummary(research: ResearchResult): ResearchSummary {
  const sourcesConsulted = research.entries.map((e) => ({
    label: e.query,
    url: e.url,
  }));

  const keyInsights: string[] = [];
  for (const entry of research.entries) {
    // Extract first meaningful sentences as insights
    const sentences = entry.content
      .split(/[.!?]\s+/)
      .filter((s) => s.length > 20)
      .slice(0, 2);
    if (sentences.length > 0) {
      keyInsights.push(`[${entry.query}]: ${sentences.join(". ")}.`);
    }
    if (entry.keywords.length > 0) {
      keyInsights.push(
        `  Keywords found: ${entry.keywords.join(", ")}`,
      );
    }
  }

  return {
    sourcesConsulted,
    keyInsights,
    errors: research.errors,
  };
}
