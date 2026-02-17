import { describe, it, expect } from "vitest";
import { runResearch } from "../src/research/research-queries.js";
import { extractKeywords } from "../src/research/mino-client.js";

describe("runResearch", () => {
  it("throws for unknown profile", async () => {
    await expect(runResearch("nonexistent")).rejects.toThrow(
      "Unknown migration profile",
    );
  });
});

describe("extractKeywords", () => {
  it("extracts matching keywords from content", () => {
    const content = "Vue 3 removed $on and $off. Use mitt instead. The Composition API replaces mixins.";
    const keywords = ["$on", "$off", "composition api", "mixin", "pinia"];
    const result = extractKeywords(content, keywords);

    expect(result).toContain("$on");
    expect(result).toContain("$off");
    expect(result).toContain("composition api");
    expect(result).toContain("mixin");
    expect(result).not.toContain("pinia");
  });

  it("is case-insensitive", () => {
    const content = "Use CREATEAPP instead of new Vue()";
    const keywords = ["createApp"];
    const result = extractKeywords(content, keywords);
    expect(result).toContain("createApp");
  });
});
