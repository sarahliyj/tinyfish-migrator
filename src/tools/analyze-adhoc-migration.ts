import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { runResearchWithProfile } from "../research/research-queries.js";
import type { MigrationProfile } from "../profiles/types.js";
import type { MigrationReport, ResearchSummary } from "../types/migration-report.js";
import type { ResearchResult, ResearchEntry } from "../types/research-result.js";
import type { ScanResult } from "../types/scan-result.js";

const IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.nuxt/**",
  "**/.next/**",
  "**/coverage/**",
  "**/*.min.js",
  "**/*.min.css",
];

const MANIFEST_FILES = [
  "package.json",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "requirements.txt",
  "Pipfile",
  "pyproject.toml",
  "Gemfile",
  "Cargo.toml",
  "go.mod",
  "composer.json",
  "*.csproj",
  "*.sln",
  "Makefile",
  "CMakeLists.txt",
];

export interface FileInventory {
  totalFiles: number;
  byExtension: Record<string, number>;
  manifests: string[];
}

/**
 * Walk a project directory and count files by extension, find manifest files.
 */
export async function inventoryFiles(
  projectPath: string,
  fileGlob: string,
): Promise<FileInventory> {
  const pattern = path.join(projectPath, fileGlob);
  const files = await glob(pattern, {
    ignore: IGNORE_PATTERNS.map((p) => path.join(projectPath, p)),
    nodir: true,
    absolute: true,
  });

  const byExtension: Record<string, number> = {};
  for (const file of files) {
    const ext = path.extname(file) || "(no extension)";
    byExtension[ext] = (byExtension[ext] ?? 0) + 1;
  }

  // Find manifest files
  const manifests: string[] = [];
  for (const manifestPattern of MANIFEST_FILES) {
    const manifestGlob = path.join(projectPath, manifestPattern);
    const found = await glob(manifestGlob, { nodir: true, absolute: true });
    manifests.push(...found);
  }

  return {
    totalFiles: files.length,
    byExtension,
    manifests: [...new Set(manifests)].sort(),
  };
}

/**
 * Run ad-hoc migration analysis: file inventory + Mino research in parallel.
 * Produces a research-heavy, scan-light MigrationReport.
 */
export async function analyzeAdHocMigration(
  projectPath: string,
  profile: MigrationProfile,
  fileGlob: string,
): Promise<MigrationReport> {
  // Run inventory and research in parallel
  const [inventory, researchResult] = await Promise.all([
    inventoryFiles(projectPath, fileGlob),
    runResearchWithProfile(profile).catch((err): ResearchResult => {
      console.error("Research failed, proceeding with inventory only:", err);
      return { profileId: profile.id, entries: [], errors: [String(err)] };
    }),
  ]);

  const researchSummary = buildResearchSummary(researchResult);
  const riskScore = estimateAdHocRisk(inventory, researchResult);
  const riskLevel = scoreToLevel(riskScore);
  const summary = buildAdHocSummary(profile, inventory, researchResult, riskLevel);

  // Build a minimal ScanResult since we have no pattern rules
  const scanResult: ScanResult = {
    profileId: profile.id,
    projectPath,
    files: [],
    dependencyIssues: [],
    stats: {
      totalFiles: inventory.totalFiles,
      filesWithIssues: 0,
      totalHits: 0,
      breakingChanges: 0,
      deprecations: 0,
      warnings: 0,
    },
  };

  return {
    profileId: profile.id,
    projectPath,
    riskLevel,
    riskScore,
    summary,
    correlatedIssues: [],
    dependencyIssues: [],
    scanResult,
    researchAvailable: researchResult.entries.length > 0,
    researchSummary,
  };
}

function scoreToLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 50) return "critical";
  if (score >= 20) return "high";
  if (score >= 8) return "medium";
  return "low";
}

function estimateAdHocRisk(
  inventory: FileInventory,
  research: ResearchResult,
): number {
  // For ad-hoc migrations, base risk on project size and research availability
  let score = 0;

  // Project size factor
  if (inventory.totalFiles > 500) score += 15;
  else if (inventory.totalFiles > 100) score += 8;
  else if (inventory.totalFiles > 20) score += 3;

  // If research found content about breaking changes, bump risk
  for (const entry of research.entries) {
    const lower = entry.content.toLowerCase();
    if (lower.includes("breaking change")) score += 5;
    if (lower.includes("incompatible")) score += 3;
    if (lower.includes("deprecated")) score += 2;
  }

  return score;
}

function buildResearchSummary(research: ResearchResult): ResearchSummary {
  const sourcesConsulted = research.entries.map((e) => ({
    label: e.query,
    url: e.url,
  }));

  const keyInsights: string[] = [];
  for (const entry of research.entries) {
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

function buildAdHocSummary(
  profile: MigrationProfile,
  inventory: FileInventory,
  research: ResearchResult,
  riskLevel: string,
): string {
  const lines: string[] = [];

  lines.push(
    `Ad-hoc migration analysis: ${profile.name}. Risk: ${riskLevel.toUpperCase()}.`,
  );
  lines.push(
    `Project inventory: ${inventory.totalFiles} source files found.`,
  );

  const extEntries = Object.entries(inventory.byExtension)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  if (extEntries.length > 0) {
    lines.push(
      `File types: ${extEntries.map(([ext, count]) => `${ext} (${count})`).join(", ")}`,
    );
  }

  if (inventory.manifests.length > 0) {
    const names = inventory.manifests.map((m) => path.basename(m));
    lines.push(`Manifest files: ${names.join(", ")}`);
  }

  if (research.entries.length > 0) {
    lines.push(
      `\n[Mino Web Research] Discovered and consulted ${research.entries.length} online sources via TinyFish agent.`,
    );
  } else if (research.errors.length > 0) {
    lines.push("\n[Mino Web Research] Unavailable — results based on file inventory only.");
  }

  return lines.join("\n");
}
