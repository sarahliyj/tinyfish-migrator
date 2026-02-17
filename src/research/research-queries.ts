import { getProfile } from "../profiles/registry.js";
import { fetchMinoResearch } from "./mino-client.js";
import type { MigrationProfile } from "../profiles/types.js";
import type { ResearchResult } from "../types/research-result.js";
import type { ResearchEntry } from "../types/research-result.js";

export async function runResearch(profileId: string): Promise<ResearchResult> {
  const profile = getProfile(profileId);
  if (!profile) {
    throw new Error(`Unknown migration profile: "${profileId}"`);
  }

  return runResearchWithProfile(profile);
}

export async function runResearchWithProfile(
  profile: MigrationProfile,
): Promise<ResearchResult> {
  const promises = profile.researchQueries.map((q) =>
    fetchMinoResearch(q, profile.researchKeywords),
  );

  const results = await Promise.allSettled(promises);

  const entries: ResearchEntry[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      entries.push(result.value);
    } else {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      errors.push(reason);
      console.error("Mino research query failed:", reason);
    }
  }

  return { profileId: profile.id, entries, errors };
}
