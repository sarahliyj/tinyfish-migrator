import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { scanCodebase } from "./tools/scan-codebase.js";
import { analyzeMigration } from "./tools/analyze-migration.js";
import { getMigrationPlan, generateAdHocPlan } from "./tools/get-migration-plan.js";
import { analyzeAdHocMigration, inventoryFiles } from "./tools/analyze-adhoc-migration.js";
import { generateAdHocProfile, inferFileGlob } from "./profiles/adhoc-profile.js";
import { getProfile, detectProfile, listProfiles } from "./profiles/registry.js";
import type { MigrationReport } from "./types/migration-report.js";
import type { MigrationPlan } from "./types/migration-plan.js";
import type { ScanResult } from "./types/scan-result.js";

async function resolveProfileId(
  projectPath: string,
  profileId?: string,
): Promise<string> {
  if (profileId) {
    const profile = getProfile(profileId);
    if (!profile) {
      const available = listProfiles().join(", ");
      throw new Error(
        `Unknown profile "${profileId}". Available: ${available}`,
      );
    }
    return profileId;
  }

  const detected = await detectProfile(projectPath);
  if (detected) {
    return detected.id;
  }

  const available = listProfiles().join(", ");
  throw new Error(
    `Could not auto-detect migration profile for this project. ` +
    `Please specify profile_id. Available: ${available}`,
  );
}

/**
 * Map common source/target aliases to existing predefined profile IDs.
 * Returns the profile ID if a match is found, undefined otherwise.
 */
export function findMatchingPredefinedProfile(
  source: string,
  target: string,
): string | undefined {
  const s = source.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  const aliases: Record<string, [string[], string[]]> = {
    "vue2-to-vue3": [["vue 2", "vue2"], ["vue 3", "vue3"]],
    "react-class-to-hooks": [["react class", "react classes", "class components"], ["react hooks", "hooks", "functional components"]],
    "webpack-to-vite": [["webpack"], ["vite"]],
    "js-to-typescript": [["javascript", "js"], ["typescript", "ts"]],
    "angular-legacy-to-modern": [["angular legacy", "angularjs", "angular.js", "angular 1"], ["angular modern", "angular 2+", "angular"]],
    "express-to-fastify": [["express", "express.js", "expressjs"], ["fastify", "fastify.js"]],
  };

  for (const [profileId, [sourceAliases, targetAliases]] of Object.entries(aliases)) {
    const sourceMatch = sourceAliases.some((a) => s.includes(a));
    const targetMatch = targetAliases.some((a) => t.includes(a));
    if (sourceMatch && targetMatch) {
      return profileId;
    }
  }

  return undefined;
}

export function registerTools(server: McpServer): void {
  const profileDesc =
    `Migration profile ID (e.g. ${listProfiles().join(", ")}). ` +
    `If omitted, auto-detected from the project's dependencies.`;

  // --- Scan Codebase ---
  server.tool(
    "scan_codebase",
    "Scan a project directory for migration issues using pattern matching and dependency analysis",
    {
      project_path: z.string().describe("Absolute path to the project root directory"),
      profile_id: z.string().optional().describe(profileDesc),
    },
    async ({ project_path, profile_id }) => {
      try {
        const resolved = await resolveProfileId(project_path, profile_id);
        const result = await scanCodebase(project_path, resolved);
        return {
          content: [{ type: "text" as const, text: formatScanResult(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Scan failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );

  // --- Analyze Migration ---
  server.tool(
    "analyze_migration",
    "Run a full migration analysis: scans codebase and fetches live web research via Mino (TinyFish agent), then correlates findings into a risk assessment",
    {
      project_path: z.string().describe("Absolute path to the project root directory"),
      profile_id: z.string().optional().describe(profileDesc),
    },
    async ({ project_path, profile_id }) => {
      try {
        const resolved = await resolveProfileId(project_path, profile_id);
        const report = await analyzeMigration(project_path, resolved);
        return {
          content: [{ type: "text" as const, text: formatReport(report) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Analysis failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );

  // --- Get Migration Plan ---
  server.tool(
    "get_migration_plan",
    "Generate a phased migration plan with file-level steps and effort estimates, powered by Mino (TinyFish agent) web research",
    {
      project_path: z.string().describe("Absolute path to the project root directory"),
      profile_id: z.string().optional().describe(profileDesc),
    },
    async ({ project_path, profile_id }) => {
      try {
        const resolved = await resolveProfileId(project_path, profile_id);
        const plan = await getMigrationPlan(project_path, resolved);
        return {
          content: [{ type: "text" as const, text: formatPlan(plan) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Plan generation failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );

  // --- Analyze Custom Migration ---
  server.tool(
    "analyze_custom_migration",
    "Analyze ANY migration (e.g. Java to Python, MySQL to PostgreSQL). Uses Mino (TinyFish agent) to discover and research migration guides automatically. Falls back to predefined profiles when available.",
    {
      source: z.string().describe("Source technology, language, or framework (e.g. 'Java', 'Express', 'MySQL')"),
      target: z.string().describe("Target technology, language, or framework (e.g. 'Python', 'Fastify', 'PostgreSQL')"),
      project_path: z.string().describe("Absolute path to the project root directory"),
      context: z.string().optional().describe("Optional additional context about the migration (e.g. 'We use Spring Boot 2.7' or 'Our app is a REST API')"),
      file_extensions: z.array(z.string()).optional().describe("Optional list of file extensions to scan (e.g. ['.java', '.xml']). Auto-detected if omitted."),
    },
    async ({ source, target, project_path, context, file_extensions }) => {
      try {
        // Check if a predefined profile matches first
        const predefined = findMatchingPredefinedProfile(source, target);
        if (predefined) {
          const report = await analyzeMigration(project_path, predefined);
          return {
            content: [{
              type: "text" as const,
              text: `*Matched predefined profile: **${predefined}***\n\n` + formatReport(report),
            }],
          };
        }

        // Ad-hoc path: generate profile via Mino discovery
        const profile = await generateAdHocProfile(
          source,
          target,
          project_path,
          context,
          file_extensions,
        );
        const fileGlob = inferFileGlob(source, file_extensions);
        const report = await analyzeAdHocMigration(project_path, profile, fileGlob);
        return {
          content: [{ type: "text" as const, text: formatAdHocReport(report, source, target) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Custom migration analysis failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    },
  );
}

// --- Formatting helpers ---

function formatScanResult(result: ScanResult): string {
  const lines: string[] = [];
  lines.push(`# Codebase Scan Results`);
  lines.push(`**Profile:** ${result.profileId} | **Path:** ${result.projectPath}\n`);

  lines.push(`## Summary`);
  lines.push(`- Files scanned: **${result.stats.totalFiles}**`);
  lines.push(`- Files with issues: **${result.stats.filesWithIssues}**`);
  lines.push(`- Total issues: **${result.stats.totalHits}**`);
  lines.push(`- Breaking changes: **${result.stats.breakingChanges}**`);
  lines.push(`- Deprecations: **${result.stats.deprecations}**`);
  lines.push(`- Warnings: **${result.stats.warnings}**\n`);

  if (result.dependencyIssues.length > 0) {
    lines.push(`## Dependency Issues`);
    for (const dep of result.dependencyIssues) {
      lines.push(`- **${dep.name}** (${dep.currentVersion}) [${dep.severity}]: ${dep.message}`);
    }
    lines.push("");
  }

  if (result.files.length > 0) {
    lines.push(`## Files with Issues`);
    const sorted = [...result.files].sort((a, b) => b.hits.length - a.hits.length);
    for (const file of sorted.slice(0, 20)) {
      const short = file.file.replace(result.projectPath + "/", "");
      lines.push(`\n### ${short} (${file.difficulty} difficulty, ${file.hits.length} hits)`);
      for (const hit of file.hits) {
        lines.push(`- Line ${hit.line} [${hit.severity}] **${hit.category}**: ${hit.message}`);
      }
    }
    if (sorted.length > 20) {
      lines.push(`\n*...and ${sorted.length - 20} more files*`);
    }
  }

  return lines.join("\n");
}

function formatReport(report: MigrationReport): string {
  const lines: string[] = [];
  lines.push(`# Migration Analysis Report`);
  lines.push(`**Profile:** ${report.profileId} | **Path:** ${report.projectPath}\n`);

  lines.push(`## Risk Assessment`);
  lines.push(`- Risk level: **${report.riskLevel.toUpperCase()}**`);
  lines.push(`- Risk score: **${report.riskScore}**`);
  lines.push(`- Files scanned: **${report.scanResult.stats.totalFiles}**`);
  lines.push(`- Issues found: **${report.scanResult.stats.totalHits}** across **${report.scanResult.stats.filesWithIssues}** files`);
  lines.push(`- Breaking: **${report.scanResult.stats.breakingChanges}** | Deprecated: **${report.scanResult.stats.deprecations}** | Warnings: **${report.scanResult.stats.warnings}**\n`);

  // --- Mino Research Section ---
  lines.push(`## Web Research (powered by Mino / TinyFish Agent)`);
  if (report.researchAvailable) {
    lines.push(`The following online sources were consulted in real-time via the **Mino TinyFish agent** to enrich this analysis:\n`);
    for (const source of report.researchSummary.sourcesConsulted) {
      lines.push(`- [${source.label}](${source.url})`);
    }
    if (report.researchSummary.keyInsights.length > 0) {
      lines.push(`\n### Key Insights from Mino Research`);
      for (const insight of report.researchSummary.keyInsights) {
        lines.push(`${insight}`);
      }
    }
  } else {
    lines.push(`> Mino web research was not available for this analysis.`);
    if (report.researchSummary.errors.length > 0) {
      lines.push(`> Reason: ${report.researchSummary.errors.join("; ")}`);
    }
    lines.push(`> Results below are based on local codebase scanning only.`);
  }
  lines.push("");

  // --- Correlated Issues ---
  if (report.correlatedIssues.length > 0) {
    lines.push(`## Correlated Issues (Scan + Research)`);
    for (const issue of report.correlatedIssues) {
      const researchTag = issue.relatedResearch.length > 0
        ? ` — *enriched by ${issue.relatedResearch.length} Mino source(s)*`
        : "";
      lines.push(`\n### ${issue.pattern.category}: ${issue.pattern.rule}${researchTag}`);
      lines.push(`- **Severity:** ${issue.pattern.severity}`);
      lines.push(`- **Found in:** ${issue.pattern.file.replace(report.projectPath + "/", "")} (line ${issue.pattern.line})`);
      lines.push(`- **Issue:** ${issue.pattern.message}`);
      if (issue.relatedResearch.length > 0) {
        lines.push(`- **Mino research context:**`);
        for (const r of issue.relatedResearch) {
          const snippet = r.content.slice(0, 150).replace(/\n/g, " ");
          lines.push(`  - From [${r.query}](${r.url}): "${snippet}..."`);
        }
      }
    }
    lines.push("");
  }

  // --- Dependencies ---
  if (report.dependencyIssues.length > 0) {
    lines.push(`## Dependency Issues`);
    for (const dep of report.dependencyIssues) {
      lines.push(`- **${dep.name}** (${dep.currentVersion}) [${dep.severity}]: ${dep.message}`);
    }
  }

  return lines.join("\n");
}

function formatAdHocReport(report: MigrationReport, source: string, target: string): string {
  const lines: string[] = [];
  lines.push(`# Custom Migration Analysis: ${source} to ${target}`);
  lines.push(`**Profile:** ${report.profileId} (ad-hoc, Mino-discovered) | **Path:** ${report.projectPath}\n`);

  lines.push(`## Risk Assessment`);
  lines.push(`- Risk level: **${report.riskLevel.toUpperCase()}**`);
  lines.push(`- Risk score: **${report.riskScore}**`);
  lines.push(`- Source files found: **${report.scanResult.stats.totalFiles}**\n`);

  // --- Mino Research Section ---
  lines.push(`## Web Research (powered by Mino / TinyFish Agent)`);
  if (report.researchAvailable) {
    lines.push(`Mino automatically discovered and researched the following sources for **${source} to ${target}** migration guidance:\n`);
    for (const source of report.researchSummary.sourcesConsulted) {
      lines.push(`- [${source.label}](${source.url})`);
    }
    if (report.researchSummary.keyInsights.length > 0) {
      lines.push(`\n### Key Insights from Mino Research`);
      for (const insight of report.researchSummary.keyInsights) {
        lines.push(`${insight}`);
      }
    }
  } else {
    lines.push(`> Mino web research was not available for this analysis.`);
    if (report.researchSummary.errors.length > 0) {
      lines.push(`> Reason: ${report.researchSummary.errors.join("; ")}`);
    }
    lines.push(`> Results below are based on file inventory only.`);
  }
  lines.push("");

  lines.push(`## Summary`);
  lines.push(`> ${report.summary.split("\n").join("\n> ")}`);

  return lines.join("\n");
}

function formatPlan(plan: MigrationPlan): string {
  const lines: string[] = [];
  lines.push(`# Migration Plan`);
  lines.push(`**Profile:** ${plan.profileId} | **Path:** ${plan.projectPath}\n`);
  lines.push(`- Risk level: **${plan.riskLevel.toUpperCase()}**`);
  lines.push(`- Total files affected: **${plan.totalFiles}**`);
  lines.push(`- Estimated effort: **${plan.estimatedEffort}**\n`);
  lines.push(`> ${plan.summary.split("\n").join("\n> ")}\n`);

  if (plan.phases.length === 0) {
    lines.push(`No migration steps needed.`);
    return lines.join("\n");
  }

  for (const phase of plan.phases) {
    lines.push(`## Phase ${phase.order}: ${phase.name}`);
    lines.push(`*${phase.description}*\n`);
    for (const step of phase.steps) {
      const fileCount = step.affectedFiles.length;
      lines.push(`### [${step.effort.toUpperCase()}] ${step.title}`);
      lines.push(`${step.description}`);
      if (fileCount > 0) {
        lines.push(`\nAffected files (${fileCount}):`);
        for (const f of step.affectedFiles.slice(0, 10)) {
          const short = f.replace(plan.projectPath + "/", "");
          lines.push(`- \`${short}\``);
        }
        if (fileCount > 10) {
          lines.push(`- *...and ${fileCount - 10} more*`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
