import type { ScanResult, PatternHit, DependencyIssue } from "./scan-result.js";
import type { ResearchEntry } from "./research-result.js";

export interface CorrelatedIssue {
  pattern: PatternHit;
  relatedResearch: ResearchEntry[];
}

export interface ResearchSummary {
  sourcesConsulted: { label: string; url: string }[];
  keyInsights: string[];
  errors: string[];
}

export interface MigrationReport {
  profileId: string;
  projectPath: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  summary: string;
  correlatedIssues: CorrelatedIssue[];
  dependencyIssues: DependencyIssue[];
  scanResult: ScanResult;
  researchAvailable: boolean;
  researchSummary: ResearchSummary;
}
