import { describe, it, expect, vi } from "vitest";
import {
  parseDiscoveredUrls,
  inferFileGlob,
  buildSearchUrl,
  buildKeywords,
  buildDiscoveryPrompt,
  buildDeepResearchPrompt,
  generateAdHocProfile,
} from "../src/profiles/adhoc-profile.js";
import { findMatchingPredefinedProfile } from "../src/server.js";

describe("buildSearchUrl", () => {
  it("encodes source and target into a DuckDuckGo URL", () => {
    const url = buildSearchUrl("Java", "Python");
    expect(url).toBe(
      "https://duckduckgo.com/?q=Java%20to%20Python%20migration%20guide",
    );
  });

  it("handles multi-word names", () => {
    const url = buildSearchUrl("React Class Components", "React Hooks");
    expect(url).toContain("React%20Class%20Components%20to%20React%20Hooks");
  });
});

describe("parseDiscoveredUrls", () => {
  it("parses a clean JSON array of URLs", () => {
    const response = '["https://docs.example.com/guide", "https://tutorial.dev/migrate"]';
    const urls = parseDiscoveredUrls(response);
    expect(urls).toEqual([
      "https://docs.example.com/guide",
      "https://tutorial.dev/migrate",
    ]);
  });

  it("extracts JSON array embedded in surrounding text", () => {
    const response =
      'Here are the top URLs:\n["https://docs.example.com/guide", "https://tutorial.dev/migrate"]\nHope this helps!';
    const urls = parseDiscoveredUrls(response);
    expect(urls).toEqual([
      "https://docs.example.com/guide",
      "https://tutorial.dev/migrate",
    ]);
  });

  it("falls back to regex extraction when JSON parsing fails", () => {
    const response =
      "Found these resources:\n- https://docs.example.com/guide\n- https://tutorial.dev/migrate\n- http://blog.example.org/tips";
    const urls = parseDiscoveredUrls(response);
    expect(urls).toContain("https://docs.example.com/guide");
    expect(urls).toContain("https://tutorial.dev/migrate");
    expect(urls).toContain("http://blog.example.org/tips");
  });

  it("filters out search engine URLs", () => {
    const response =
      '["https://duckduckgo.com/?q=test", "https://google.com/search?q=test", "https://docs.example.com/guide"]';
    const urls = parseDiscoveredUrls(response);
    expect(urls).toEqual(["https://docs.example.com/guide"]);
  });

  it("limits to 5 URLs maximum", () => {
    const urls = Array.from(
      { length: 8 },
      (_, i) => `https://example.com/guide-${i}`,
    );
    const response = JSON.stringify(urls);
    const result = parseDiscoveredUrls(response);
    expect(result).toHaveLength(5);
  });

  it("returns empty array for garbage input", () => {
    const urls = parseDiscoveredUrls("No URLs here, just random text.");
    expect(urls).toEqual([]);
  });

  it("deduplicates URLs in regex fallback", () => {
    const response =
      "Check https://example.com/guide and also https://example.com/guide for details.";
    const urls = parseDiscoveredUrls(response);
    expect(urls).toEqual(["https://example.com/guide"]);
  });

  it("strips trailing punctuation from regex-extracted URLs", () => {
    const response = "See https://example.com/guide, and https://example.com/docs.";
    const urls = parseDiscoveredUrls(response);
    expect(urls).toContain("https://example.com/guide");
    expect(urls).toContain("https://example.com/docs");
  });

  it("filters non-string and non-URL entries from JSON array", () => {
    const response = '[42, null, "not-a-url", "https://example.com/guide"]';
    const urls = parseDiscoveredUrls(response);
    expect(urls).toEqual(["https://example.com/guide"]);
  });
});

describe("inferFileGlob", () => {
  it("returns correct glob for Java", () => {
    expect(inferFileGlob("Java")).toBe("**/*.java");
  });

  it("returns correct glob for Python", () => {
    expect(inferFileGlob("Python")).toBe("**/*.py");
  });

  it("returns correct glob for Flask (maps to .py)", () => {
    expect(inferFileGlob("Flask")).toBe("**/*.py");
  });

  it("returns correct glob for Vue", () => {
    expect(inferFileGlob("Vue")).toBe("**/*.{vue,js,ts}");
  });

  it("returns correct glob for Go/Golang", () => {
    expect(inferFileGlob("Golang")).toBe("**/*.go");
    expect(inferFileGlob("Go")).toBe("**/*.go");
  });

  it("uses provided file extensions when given", () => {
    expect(inferFileGlob("Java", [".java", ".xml"])).toBe("**/*.{java,xml}");
  });

  it("strips leading dots from file extensions", () => {
    expect(inferFileGlob("anything", [".py", ".pyx"])).toBe("**/*.{py,pyx}");
  });

  it("returns default glob for unknown source", () => {
    const result = inferFileGlob("SomeObscureTech");
    expect(result).toBe("**/*.{js,ts,jsx,tsx,py,java,rb,go,rs,php,cs}");
  });

  it("is case-insensitive for source matching", () => {
    expect(inferFileGlob("JAVA")).toBe("**/*.java");
    expect(inferFileGlob("python")).toBe("**/*.py");
  });
});

describe("buildKeywords", () => {
  it("includes source and target as keywords", () => {
    const keywords = buildKeywords("Java", "Python");
    expect(keywords).toContain("java");
    expect(keywords).toContain("python");
  });

  it("includes common migration terms", () => {
    const keywords = buildKeywords("A", "B");
    expect(keywords).toContain("migration");
    expect(keywords).toContain("breaking change");
    expect(keywords).toContain("deprecated");
  });

  it("splits multi-word names into individual keywords", () => {
    const keywords = buildKeywords("React Class", "React Hooks");
    expect(keywords).toContain("react");
    expect(keywords).toContain("class");
    expect(keywords).toContain("hooks");
  });

  it("skips short words (2 chars or less)", () => {
    const keywords = buildKeywords("C# to Go", "Python");
    // "to" and "c#" split parts — "to" is 2 chars so skipped, but "go" is also 2 chars
    expect(keywords).not.toContain("to");
  });
});

describe("findMatchingPredefinedProfile", () => {
  it("matches Express to Fastify", () => {
    expect(findMatchingPredefinedProfile("Express", "Fastify")).toBe(
      "express-to-fastify",
    );
  });

  it("matches express.js to fastify (case-insensitive)", () => {
    expect(findMatchingPredefinedProfile("Express.js", "Fastify")).toBe(
      "express-to-fastify",
    );
  });

  it("matches Vue 2 to Vue 3", () => {
    expect(findMatchingPredefinedProfile("Vue 2", "Vue 3")).toBe(
      "vue2-to-vue3",
    );
  });

  it("matches Webpack to Vite", () => {
    expect(findMatchingPredefinedProfile("Webpack", "Vite")).toBe(
      "webpack-to-vite",
    );
  });

  it("matches JavaScript to TypeScript", () => {
    expect(findMatchingPredefinedProfile("JavaScript", "TypeScript")).toBe(
      "js-to-typescript",
    );
  });

  it("matches JS to TS abbreviations", () => {
    expect(findMatchingPredefinedProfile("JS", "TS")).toBe(
      "js-to-typescript",
    );
  });

  it("matches React Classes to Hooks", () => {
    expect(
      findMatchingPredefinedProfile("React Class Components", "React Hooks"),
    ).toBe("react-class-to-hooks");
  });

  it("matches AngularJS to Angular", () => {
    expect(findMatchingPredefinedProfile("AngularJS", "Angular")).toBe(
      "angularjs-to-angular",
    );
  });

  it("matches Angular 14 to Angular 17", () => {
    expect(findMatchingPredefinedProfile("Angular 14", "Angular 17")).toBe(
      "angular-legacy-to-modern",
    );
  });

  it("matches Python 2 to Python 3", () => {
    expect(findMatchingPredefinedProfile("Python 2", "Python 3")).toBe(
      "python2-to-python3",
    );
  });

  it("matches MySQL to PostgreSQL", () => {
    expect(findMatchingPredefinedProfile("MySQL", "PostgreSQL")).toBe(
      "mysql-to-postgresql",
    );
  });

  it("matches CRA to Next.js", () => {
    expect(findMatchingPredefinedProfile("Create React App", "Next.js")).toBe(
      "cra-to-nextjs",
    );
  });

  it("matches jQuery to Vanilla JS", () => {
    expect(findMatchingPredefinedProfile("jQuery", "Vanilla JS")).toBe(
      "jquery-to-vanilla",
    );
  });

  it("matches REST to GraphQL", () => {
    expect(findMatchingPredefinedProfile("REST API", "GraphQL")).toBe(
      "rest-to-graphql",
    );
  });

  it("matches Java to Kotlin", () => {
    expect(findMatchingPredefinedProfile("Java", "Kotlin")).toBe(
      "java-to-kotlin",
    );
  });

  it("matches CommonJS to ESM", () => {
    expect(findMatchingPredefinedProfile("CommonJS", "ES Modules")).toBe(
      "commonjs-to-esm",
    );
  });

  it("returns undefined for novel migration", () => {
    expect(findMatchingPredefinedProfile("Perl", "Python")).toBeUndefined();
  });

  it("returns undefined for Flask to Django", () => {
    expect(
      findMatchingPredefinedProfile("Flask", "Django"),
    ).toBeUndefined();
  });
});

describe("buildDiscoveryPrompt", () => {
  it("mentions source and target in prompt", () => {
    const prompt = buildDiscoveryPrompt("Flask", "Django");
    expect(prompt).toContain("Flask");
    expect(prompt).toContain("Django");
    expect(prompt).toContain("JSON array");
  });
});

describe("buildDeepResearchPrompt", () => {
  it("mentions source and target in prompt", () => {
    const prompt = buildDeepResearchPrompt("MySQL", "PostgreSQL");
    expect(prompt).toContain("MySQL");
    expect(prompt).toContain("PostgreSQL");
    expect(prompt).toContain("migration");
  });
});

describe("generateAdHocProfile (with mocked Mino)", () => {
  it("generates a profile with discovered research queries", async () => {
    // Mock fetchMinoResearch to return discovered URLs
    const { fetchMinoResearch } = await import(
      "../src/research/mino-client.js"
    );
    const mockFetch = vi.spyOn(
      await import("../src/research/mino-client.js"),
      "fetchMinoResearch",
    );

    mockFetch.mockResolvedValueOnce({
      query: "URL Discovery",
      url: "https://duckduckgo.com/?q=Flask+to+Django+migration+guide",
      content: '["https://docs.djangoproject.com/migrate", "https://realpython.com/flask-to-django"]',
      keywords: [],
    });

    const profile = await generateAdHocProfile(
      "Flask",
      "Django",
      "/tmp/test-project",
    );

    expect(profile.id).toBe("adhoc-flask-to-django");
    expect(profile.name).toBe("Flask to Django");
    expect(profile.researchQueries).toHaveLength(2);
    expect(profile.researchQueries[0].url).toBe(
      "https://docs.djangoproject.com/migrate",
    );
    expect(profile.researchQueries[1].url).toBe(
      "https://realpython.com/flask-to-django",
    );
    expect(profile.patternRules).toEqual([]);
    expect(profile.dependencyRules).toEqual([]);
    expect(profile.researchKeywords).toContain("flask");
    expect(profile.researchKeywords).toContain("django");

    mockFetch.mockRestore();
  });

  it("produces a valid profile even when Mino discovery fails", async () => {
    const mockFetch = vi.spyOn(
      await import("../src/research/mino-client.js"),
      "fetchMinoResearch",
    );

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const profile = await generateAdHocProfile(
      "Perl",
      "Rust",
      "/tmp/test-project",
    );

    expect(profile.id).toBe("adhoc-perl-to-rust");
    expect(profile.researchQueries).toHaveLength(0);
    expect(profile.researchKeywords).toContain("perl");
    expect(profile.researchKeywords).toContain("rust");

    mockFetch.mockRestore();
  });

  it("passes user context to deep research prompts", async () => {
    const mockFetch = vi.spyOn(
      await import("../src/research/mino-client.js"),
      "fetchMinoResearch",
    );

    mockFetch.mockResolvedValueOnce({
      query: "URL Discovery",
      url: "https://duckduckgo.com/?q=test",
      content: '["https://example.com/guide"]',
      keywords: [],
    });

    const profile = await generateAdHocProfile(
      "MySQL",
      "PostgreSQL",
      "/tmp/test",
      "We use stored procedures heavily",
    );

    expect(profile.researchQueries[0].prompt).toContain(
      "We use stored procedures heavily",
    );

    mockFetch.mockRestore();
  });
});
