import { fetchMinoResearch } from "../research/mino-client.js";
import type { MigrationProfile, ResearchQuery } from "./types.js";

/**
 * Build a DuckDuckGo HTML search URL for migration guide discovery.
 */
export function buildSearchUrl(source: string, target: string): string {
  const query = `${source} to ${target} migration guide`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}

/**
 * Prompt that tells Mino to extract top doc URLs from a search results page.
 */
export function buildDiscoveryPrompt(source: string, target: string): string {
  return (
    `You are looking at search results for "${source} to ${target} migration guide". ` +
    `Extract the top 5 most relevant documentation URLs from the search results. ` +
    `Focus on official migration guides, documentation pages, and well-known tutorial sites. ` +
    `Skip ads, forums, and generic aggregator pages. ` +
    `Return ONLY a JSON array of URL strings, like: ["https://example.com/guide", "https://docs.example.com/migrate"]. ` +
    `If fewer than 5 relevant URLs are found, return as many as you can find.`
  );
}

/**
 * Prompt for extracting migration guidance from a discovered URL.
 */
export function buildDeepResearchPrompt(source: string, target: string): string {
  return (
    `Extract all migration guidance from this page relevant to migrating from ${source} to ${target}. ` +
    `Include: key differences between the two, step-by-step migration instructions, ` +
    `common pitfalls, breaking changes, equivalent APIs/patterns, and any tools that help automate the migration. ` +
    `Be thorough and specific. Include code examples if present on the page.`
  );
}

/**
 * Parse Mino's response to extract discovered URLs.
 * Tries JSON array first, falls back to URL regex extraction.
 */
export function parseDiscoveredUrls(response: string): string[] {
  const isSearchEngine = (url: string) =>
    url.includes("duckduckgo.com") || url.includes("google.com/search");

  // Try parsing as JSON array
  try {
    // Find JSON array in the response (may be surrounded by other text)
    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        const urls = parsed.filter(
          (item): item is string =>
            typeof item === "string" &&
            /^https?:\/\//.test(item) &&
            !isSearchEngine(item),
        );
        if (urls.length > 0) return urls.slice(0, 5);
      }
    }
  } catch {
    // JSON parse failed, fall through to regex
  }

  // Fallback: extract URLs via regex
  const urlRegex = /https?:\/\/[^\s"'<>,)}\]]+/g;
  const matches = response.match(urlRegex) ?? [];

  // Deduplicate and filter out search engine URLs
  const seen = new Set<string>();
  const filtered: string[] = [];
  for (const url of matches) {
    const clean = url.replace(/[.,:;]+$/, ""); // trim trailing punctuation
    if (!seen.has(clean) && !isSearchEngine(clean)) {
      seen.add(clean);
      filtered.push(clean);
    }
  }

  return filtered.slice(0, 5);
}

/**
 * Infer a file glob pattern from the source technology name.
 */
export function inferFileGlob(
  source: string,
  fileExtensions?: string[],
): string {
  if (fileExtensions && fileExtensions.length > 0) {
    const exts = fileExtensions.map((e) => e.replace(/^\./, "")).join(",");
    return `**/*.{${exts}}`;
  }

  const lower = source.toLowerCase();

  const mapping: Record<string, string> = {
    java: "**/*.java",
    python: "**/*.py",
    flask: "**/*.py",
    django: "**/*.py",
    ruby: "**/*.rb",
    rails: "**/*.rb",
    php: "**/*.php",
    laravel: "**/*.php",
    go: "**/*.go",
    golang: "**/*.go",
    rust: "**/*.rs",
    swift: "**/*.swift",
    kotlin: "**/*.kt",
    "c#": "**/*.cs",
    csharp: "**/*.cs",
    ".net": "**/*.cs",
    dotnet: "**/*.cs",
    typescript: "**/*.{ts,tsx}",
    javascript: "**/*.{js,jsx}",
    react: "**/*.{jsx,tsx,js,ts}",
    vue: "**/*.{vue,js,ts}",
    angular: "**/*.{ts,html}",
    svelte: "**/*.{svelte,js,ts}",
    express: "**/*.{js,ts}",
    fastify: "**/*.{js,ts}",
    next: "**/*.{js,jsx,ts,tsx}",
    nuxt: "**/*.{vue,js,ts}",
    webpack: "**/*.{js,ts,json}",
    vite: "**/*.{js,ts,json}",
    mysql: "**/*.sql",
    postgresql: "**/*.sql",
    postgres: "**/*.sql",
    mongodb: "**/*.{js,ts}",
    sqlite: "**/*.sql",
    css: "**/*.css",
    sass: "**/*.{scss,sass}",
    less: "**/*.less",
    tailwind: "**/*.{css,html,jsx,tsx,vue}",
  };

  for (const [key, glob] of Object.entries(mapping)) {
    if (lower.includes(key)) return glob;
  }

  // Default: common source file extensions
  return "**/*.{js,ts,jsx,tsx,py,java,rb,go,rs,php,cs}";
}

/**
 * Generate research keywords from source and target names.
 */
export function buildKeywords(source: string, target: string): string[] {
  const keywords = new Set<string>();

  // Add source and target as keywords
  keywords.add(source.toLowerCase());
  keywords.add(target.toLowerCase());

  // Add individual words from multi-word names
  for (const name of [source, target]) {
    for (const word of name.split(/[\s./-]+/)) {
      if (word.length > 2) {
        keywords.add(word.toLowerCase());
      }
    }
  }

  // Add common migration terms
  keywords.add("migration");
  keywords.add("breaking change");
  keywords.add("deprecated");
  keywords.add("upgrade");
  keywords.add("compatibility");

  return Array.from(keywords);
}

/**
 * Generate an ad-hoc MigrationProfile by using Mino to discover relevant
 * documentation URLs, then building research queries for each.
 *
 * Phase 1: Mino visits DuckDuckGo, extracts top doc URLs.
 * Phase 2: Those URLs become the profile's researchQueries for deep research.
 */
export async function generateAdHocProfile(
  source: string,
  target: string,
  projectPath: string,
  context?: string,
  fileExtensions?: string[],
): Promise<MigrationProfile> {
  const id = `adhoc-${source.toLowerCase().replace(/\s+/g, "-")}-to-${target.toLowerCase().replace(/\s+/g, "-")}`;
  const searchUrl = buildSearchUrl(source, target);
  const discoveryPrompt = buildDiscoveryPrompt(source, target);
  const keywords = buildKeywords(source, target);
  const fileGlob = inferFileGlob(source, fileExtensions);

  // Phase 1: Discovery — Mino visits DuckDuckGo and extracts doc URLs
  let discoveredUrls: string[] = [];
  try {
    const discoveryResult = await fetchMinoResearch(
      { label: "URL Discovery", url: searchUrl, prompt: discoveryPrompt },
      [],
    );
    discoveredUrls = parseDiscoveredUrls(discoveryResult.content);
  } catch (err) {
    console.error("Mino URL discovery failed:", err);
    // Continue with empty URLs — research will just have no entries
  }

  // Build research queries from discovered URLs
  const deepPrompt = buildDeepResearchPrompt(source, target);
  const researchQueries: ResearchQuery[] = discoveredUrls.map((url, i) => ({
    label: `${source} to ${target} Guide #${i + 1}`,
    url,
    prompt: context
      ? `${deepPrompt}\n\nAdditional context from user: ${context}`
      : deepPrompt,
  }));

  return {
    id,
    name: `${source} to ${target}`,
    description: `Ad-hoc migration profile for ${source} to ${target}, powered by Mino web research discovery.`,
    patternRules: [],
    dependencyRules: [],
    researchQueries,
    researchKeywords: keywords,
    configFilePatterns: [],
    preparationSteps: [],
    phaseTemplates: [],
    cleanupSteps: [],
  };
}
