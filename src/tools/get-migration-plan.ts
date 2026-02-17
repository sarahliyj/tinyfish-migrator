import path from "node:path";
import { analyzeMigration } from "./analyze-migration.js";
import { getProfile } from "../profiles/registry.js";
import type { MigrationPlan, Phase, PlanStep } from "../types/migration-plan.js";
import type { MigrationReport } from "../types/migration-report.js";
import type { FileMatch } from "../types/scan-result.js";
import type { FileInventory } from "./analyze-adhoc-migration.js";

export async function getMigrationPlan(
  projectPath: string,
  profileId: string,
): Promise<MigrationPlan> {
  const report = await analyzeMigration(projectPath, profileId);
  const profile = getProfile(profileId);

  if (report.scanResult.stats.totalHits === 0 && report.dependencyIssues.length === 0) {
    return {
      profileId,
      projectPath,
      riskLevel: "low",
      summary: "No migration issues detected. The codebase appears ready or no matching patterns found.",
      phases: [],
      totalFiles: 0,
      estimatedEffort: "Minimal",
    };
  }

  const phases = generatePhases(report, profileId);
  const totalFiles = new Set(report.scanResult.files.map((f) => f.file)).size;

  return {
    profileId,
    projectPath,
    riskLevel: report.riskLevel,
    summary: report.summary,
    phases,
    totalFiles,
    estimatedEffort: estimateEffort(report),
  };
}

function generatePhases(report: MigrationReport, profileId: string): Phase[] {
  const phases: Phase[] = [];
  const profile = getProfile(profileId);
  const filesByCategory = groupFilesByCategory(report.scanResult.files);
  let order = 1;

  // Phase 1: Preparation (from profile or fallback)
  if (profile && profile.preparationSteps.length > 0) {
    phases.push({
      name: "Preparation",
      order: order++,
      description: "Set up tooling and prepare for migration",
      steps: profile.preparationSteps.map((step) => ({
        title: step.title,
        description: step.description,
        affectedFiles: step.affectedFiles.length > 0
          ? step.affectedFiles
          : getConfigFiles(report, profile.configFilePatterns),
        effort: step.effort,
      })),
    });
  } else {
    phases.push({
      name: "Preparation",
      order: order++,
      description: "Set up tooling and create a migration branch",
      steps: [
        {
          title: "Create migration branch",
          description: "Create a dedicated branch for the migration work.",
          affectedFiles: [],
          effort: "low",
        },
      ],
    });
  }

  // Phase 2: Dependency Upgrades
  if (report.dependencyIssues.length > 0) {
    phases.push({
      name: "Dependency Upgrades",
      order: order++,
      description: "Upgrade dependencies to compatible versions",
      steps: report.dependencyIssues.map((dep) => ({
        title: `Upgrade ${dep.name}`,
        description: dep.message,
        affectedFiles: ["package.json"],
        effort: dep.severity === "breaking" ? "high" as const : "medium" as const,
      })),
    });
  }

  // Profile-driven phase templates
  if (profile && profile.phaseTemplates.length > 0) {
    for (const template of profile.phaseTemplates) {
      const files = collectFilesForCategories(filesByCategory, template.categories);
      if (files.length > 0) {
        phases.push({
          name: template.name,
          order: order++,
          description: template.description,
          steps: buildStepsForCategories(filesByCategory, template.categories),
        });
      }
    }
  } else {
    // Fallback: group all remaining categories into one phase
    const allCategories = Array.from(filesByCategory.keys());
    if (allCategories.length > 0) {
      phases.push({
        name: "Code Changes",
        order: order++,
        description: "Update code patterns for the migration",
        steps: buildStepsForCategories(filesByCategory, allCategories),
      });
    }
  }

  // Cleanup phase (from profile or fallback)
  if (profile && profile.cleanupSteps.length > 0) {
    phases.push({
      name: "Cleanup & Validation",
      order: order++,
      description: "Final cleanup and verification",
      steps: profile.cleanupSteps.map((step) => ({
        title: step.title,
        description: step.description,
        affectedFiles: step.affectedFiles,
        effort: step.effort,
      })),
    });
  } else {
    phases.push({
      name: "Cleanup & Validation",
      order: order++,
      description: "Run full test suite and verify production build",
      steps: [
        {
          title: "Run full test suite",
          description: "Execute all tests and fix any remaining failures.",
          affectedFiles: [],
          effort: "medium",
        },
        {
          title: "Production build verification",
          description: "Verify production build completes without errors.",
          affectedFiles: [],
          effort: "low",
        },
      ],
    });
  }

  return phases;
}

function groupFilesByCategory(
  files: FileMatch[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const file of files) {
    for (const hit of file.hits) {
      if (!map.has(hit.category)) {
        map.set(hit.category, new Set());
      }
      map.get(hit.category)!.add(file.file);
    }
  }
  return map;
}

function collectFilesForCategories(
  filesByCategory: Map<string, Set<string>>,
  categories: string[],
): string[] {
  const files = new Set<string>();
  for (const cat of categories) {
    const catFiles = filesByCategory.get(cat);
    if (catFiles) {
      for (const f of catFiles) files.add(f);
    }
  }
  return Array.from(files);
}

function buildStepsForCategories(
  filesByCategory: Map<string, Set<string>>,
  categories: string[],
): PlanStep[] {
  const steps: PlanStep[] = [];
  for (const cat of categories) {
    const files = filesByCategory.get(cat);
    if (files && files.size > 0) {
      const fileList = Array.from(files);
      steps.push({
        title: `Fix ${cat} issues`,
        description: `Update ${files.size} file(s) with ${cat} migration issues.`,
        affectedFiles: fileList,
        effort: fileList.length > 5 ? "high" : fileList.length > 2 ? "medium" : "low",
      });
    }
  }
  return steps;
}

function getConfigFiles(report: MigrationReport, patterns: string[]): string[] {
  const configFiles: string[] = [];
  for (const file of report.scanResult.files) {
    if (patterns.some((p) => file.file.includes(p))) {
      configFiles.push(file.file);
    }
  }
  return configFiles;
}

function estimateEffort(report: MigrationReport): string {
  const { totalHits, filesWithIssues } = report.scanResult.stats;
  const depCount = report.dependencyIssues.length;

  if (totalHits > 100 || filesWithIssues > 50) return "Large (weeks)";
  if (totalHits > 30 || filesWithIssues > 15) return "Medium (days)";
  if (totalHits > 10 || depCount > 3) return "Small (1-2 days)";
  return "Minimal (hours)";
}

/**
 * Generate a migration plan for an ad-hoc (non-predefined) migration.
 * Builds phases from file inventory + research — no profile templates needed.
 */
export function generateAdHocPlan(
  report: MigrationReport,
  inventory: FileInventory,
  source: string,
  target: string,
): MigrationPlan {
  const phases: Phase[] = [];
  let order = 1;

  // Phase 1: Preparation
  phases.push({
    name: "Preparation",
    order: order++,
    description: `Set up tooling and prepare for ${source} to ${target} migration`,
    steps: [
      {
        title: "Create migration branch",
        description: "Create a dedicated branch for the migration work.",
        affectedFiles: [],
        effort: "low",
      },
      {
        title: "Review Mino research findings",
        description:
          `Review the migration research gathered by Mino to understand key differences ` +
          `between ${source} and ${target}, breaking changes, and recommended approaches.`,
        affectedFiles: [],
        effort: "low",
      },
    ],
  });

  // Phase 2: Tooling & Dependencies (if manifests found)
  if (inventory.manifests.length > 0) {
    phases.push({
      name: "Tooling & Dependencies",
      order: order++,
      description: `Update project dependencies and build tooling for ${target}`,
      steps: inventory.manifests.map((manifest) => ({
        title: `Update ${path.basename(manifest)}`,
        description: `Review and update dependencies in ${path.basename(manifest)} for ${target} compatibility.`,
        affectedFiles: [manifest],
        effort: "medium" as const,
      })),
    });
  }

  // Phase 3: Code Migration (grouped by file extension)
  const extEntries = Object.entries(inventory.byExtension)
    .sort(([, a], [, b]) => b - a);

  if (extEntries.length > 0) {
    const steps: PlanStep[] = extEntries.map(([ext, count]) => ({
      title: `Migrate ${ext} files (${count})`,
      description: `Update ${count} ${ext} file(s) from ${source} patterns to ${target} equivalents.`,
      affectedFiles: [],
      effort: (count > 20 ? "high" : count > 5 ? "medium" : "low") as "low" | "medium" | "high",
    }));

    phases.push({
      name: "Code Migration",
      order: order++,
      description: `Migrate source files from ${source} to ${target}`,
      steps,
    });
  }

  // Phase 4: Cleanup
  phases.push({
    name: "Cleanup & Validation",
    order: order++,
    description: "Final cleanup and verification",
    steps: [
      {
        title: "Run full test suite",
        description: "Execute all tests and fix any remaining failures.",
        affectedFiles: [],
        effort: "medium",
      },
      {
        title: "Production build verification",
        description: "Verify production build completes without errors.",
        affectedFiles: [],
        effort: "low",
      },
    ],
  });

  // Estimate effort from inventory size
  let estimatedEffort: string;
  if (inventory.totalFiles > 200) estimatedEffort = "Large (weeks)";
  else if (inventory.totalFiles > 50) estimatedEffort = "Medium (days)";
  else if (inventory.totalFiles > 10) estimatedEffort = "Small (1-2 days)";
  else estimatedEffort = "Minimal (hours)";

  return {
    profileId: report.profileId,
    projectPath: report.projectPath,
    riskLevel: report.riskLevel,
    summary: report.summary,
    phases,
    totalFiles: inventory.totalFiles,
    estimatedEffort,
  };
}
