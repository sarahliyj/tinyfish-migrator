import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanCodebase } from "../src/tools/scan-codebase.js";
import { getMigrationPlan } from "../src/tools/get-migration-plan.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, "fixtures", "vue2-sample");

describe("scan_codebase", () => {
  it("produces a complete scan result for the Vue 2 fixture", async () => {
    const result = await scanCodebase(FIXTURE_PATH, "vue2-to-vue3");

    expect(result.profileId).toBe("vue2-to-vue3");
    expect(result.projectPath).toBe(FIXTURE_PATH);
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.dependencyIssues.length).toBe(6);
    expect(result.stats.totalHits).toBeGreaterThan(10);
    expect(result.stats.breakingChanges).toBeGreaterThan(0);
  });

  it("throws for unknown profile", async () => {
    await expect(scanCodebase(FIXTURE_PATH, "nonexistent")).rejects.toThrow(
      "Unknown migration profile",
    );
  });
});

describe("get_migration_plan", () => {
  it("produces a phased plan for the Vue 2 fixture", async () => {
    const plan = await getMigrationPlan(FIXTURE_PATH, "vue2-to-vue3");

    expect(plan.profileId).toBe("vue2-to-vue3");
    expect(plan.phases.length).toBeGreaterThanOrEqual(3);
    expect(plan.totalFiles).toBeGreaterThan(0);

    // Check phase names
    const phaseNames = plan.phases.map((p) => p.name);
    expect(phaseNames).toContain("Preparation");
    expect(phaseNames).toContain("Dependency Upgrades");
    expect(phaseNames).toContain("Cleanup & Validation");

    // Check steps have affected files
    const allSteps = plan.phases.flatMap((p) => p.steps);
    expect(allSteps.length).toBeGreaterThan(0);
  });

  it("returns minimal plan for empty project", async () => {
    const emptyPath = path.join(__dirname, "fixtures");
    const plan = await getMigrationPlan(emptyPath, "vue2-to-vue3");

    // No vue files in fixtures root, should have minimal results
    expect(plan.phases.length).toBeLessThanOrEqual(5);
  });
});
