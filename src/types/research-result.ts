export interface ResearchEntry {
  query: string;
  url: string;
  content: string;
  keywords: string[];
}

export interface ResearchResult {
  profileId: string;
  entries: ResearchEntry[];
  errors: string[];
}
