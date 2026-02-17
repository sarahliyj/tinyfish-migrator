export interface PatternRule {
  id: string;
  category: string;
  pattern: RegExp;
  fileGlob: string;
  severity: "breaking" | "deprecated" | "warning";
  message: string;
}

export interface DependencyRule {
  name: string;
  versionRange?: string;
  severity: "breaking" | "deprecated" | "warning";
  message: string;
}

export interface ResearchQuery {
  label: string;
  url: string;
  prompt: string;
}

export interface PreparationStep {
  title: string;
  description: string;
  affectedFiles: string[];
  effort: "low" | "medium" | "high";
}

export interface PhaseTemplate {
  name: string;
  description: string;
  categories: string[];
}

export interface MigrationProfile {
  id: string;
  name: string;
  description: string;
  patternRules: PatternRule[];
  dependencyRules: DependencyRule[];
  researchQueries: ResearchQuery[];
  researchKeywords: string[];
  configFilePatterns: string[];
  preparationSteps: PreparationStep[];
  phaseTemplates: PhaseTemplate[];
  cleanupSteps: PreparationStep[];
}
