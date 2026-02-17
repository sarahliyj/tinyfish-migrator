import fs from "node:fs/promises";
import path from "node:path";
import type { DependencyRule } from "../profiles/types.js";
import type { DependencyIssue } from "../types/scan-result.js";

export async function analyzeDependencies(
  projectPath: string,
  rules: DependencyRule[],
): Promise<DependencyIssue[]> {
  const pkgPath = path.join(projectPath, "package.json");
  let pkg: Record<string, unknown>;

  try {
    const raw = await fs.readFile(pkgPath, "utf-8");
    pkg = JSON.parse(raw);
  } catch {
    console.error(`Could not read package.json at ${pkgPath}`);
    return [];
  }

  const allDeps: Record<string, string> = {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  };

  const issues: DependencyIssue[] = [];

  for (const rule of rules) {
    const version = allDeps[rule.name];
    if (version) {
      issues.push({
        name: rule.name,
        currentVersion: version,
        message: rule.message,
        severity: rule.severity,
      });
    }
  }

  return issues;
}
