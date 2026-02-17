export interface PatternHit {
  rule: string;
  category: string;
  severity: "breaking" | "deprecated" | "warning";
  file: string;
  line: number;
  match: string;
  message: string;
}

export interface DependencyIssue {
  name: string;
  currentVersion: string;
  message: string;
  severity: "breaking" | "deprecated" | "warning";
}

export interface FileMatch {
  file: string;
  hits: PatternHit[];
  difficulty: "low" | "medium" | "high";
}

export interface ScanStats {
  totalFiles: number;
  filesWithIssues: number;
  totalHits: number;
  breakingChanges: number;
  deprecations: number;
  warnings: number;
}

export interface ScanResult {
  profileId: string;
  projectPath: string;
  files: FileMatch[];
  dependencyIssues: DependencyIssue[];
  stats: ScanStats;
}
