export interface PlanStep {
  title: string;
  description: string;
  affectedFiles: string[];
  effort: "low" | "medium" | "high";
}

export interface Phase {
  name: string;
  order: number;
  description: string;
  steps: PlanStep[];
}

export interface MigrationPlan {
  profileId: string;
  projectPath: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  phases: Phase[];
  totalFiles: number;
  estimatedEffort: string;
}
