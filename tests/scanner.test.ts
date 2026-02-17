import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles } from "../src/scanner/walker.js";
import { matchPatterns } from "../src/scanner/pattern-matcher.js";
import { analyzeDependencies } from "../src/scanner/dependency-analyzer.js";
import { classifyDifficulty } from "../src/scanner/difficulty-classifier.js";
import { vue2ToVue3Profile } from "../src/profiles/vue2-to-vue3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, "fixtures", "vue2-sample");

describe("walker", () => {
  it("finds vue and js files in the fixture", async () => {
    const files = await walkFiles(FIXTURE_PATH, "**/*.{vue,js,ts}");
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.endsWith(".vue"))).toBe(true);
    expect(files.some((f) => f.endsWith(".js"))).toBe(true);
  });
});

describe("pattern-matcher", () => {
  it("detects Vue 2 patterns in UserList.vue", async () => {
    const file = path.join(FIXTURE_PATH, "src", "components", "UserList.vue");
    const hits = await matchPatterns(file, vue2ToVue3Profile.patternRules);

    expect(hits.length).toBeGreaterThan(0);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("filters");
    expect(ruleIds).toContain("event-bus-on");
    expect(ruleIds).toContain("event-bus-off");
    expect(ruleIds).toContain("event-bus-once");
    expect(ruleIds).toContain("set-delete");
    expect(ruleIds).toContain("before-destroy");
    expect(ruleIds).toContain("destroyed");
    expect(ruleIds).toContain("scoped-slots");
    expect(ruleIds).toContain("listeners");
    expect(ruleIds).toContain("children");
    expect(ruleIds).toContain("data-as-object");
  });

  it("detects global API patterns in main.js", async () => {
    const file = path.join(FIXTURE_PATH, "src", "main.js");
    const hits = await matchPatterns(file, vue2ToVue3Profile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("vue-use");
    expect(ruleIds).toContain("vue-component");
    expect(ruleIds).toContain("vue-directive");
    expect(ruleIds).toContain("vue-mixin");
    expect(ruleIds).toContain("vue-filter");
    expect(ruleIds).toContain("vue-prototype");
  });

  it("detects event bus patterns in event-bus.js", async () => {
    const file = path.join(FIXTURE_PATH, "src", "plugins", "event-bus.js");
    const hits = await matchPatterns(file, vue2ToVue3Profile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("event-bus-on");
    expect(ruleIds).toContain("event-bus-off");
    expect(ruleIds).toContain("event-bus-once");
  });
});

describe("dependency-analyzer", () => {
  it("detects Vue 2 dependencies", async () => {
    const issues = await analyzeDependencies(
      FIXTURE_PATH,
      vue2ToVue3Profile.dependencyRules,
    );

    expect(issues.length).toBeGreaterThan(0);
    const names = issues.map((i) => i.name);
    expect(names).toContain("vue");
    expect(names).toContain("vuex");
    expect(names).toContain("vue-router");
    expect(names).toContain("vue-class-component");
    expect(names).toContain("vue-property-decorator");
    expect(names).toContain("@vue/composition-api");
  });
});

describe("difficulty-classifier", () => {
  it("classifies high difficulty for many breaking changes", () => {
    const hits = Array.from({ length: 5 }, (_, i) => ({
      rule: `rule-${i}`,
      category: "test",
      severity: "breaking" as const,
      file: "test.vue",
      line: i + 1,
      match: "test",
      message: "test",
    }));
    expect(classifyDifficulty(hits)).toBe("high");
  });

  it("classifies low difficulty for few warnings", () => {
    const hits = [
      {
        rule: "rule-1",
        category: "test",
        severity: "warning" as const,
        file: "test.vue",
        line: 1,
        match: "test",
        message: "test",
      },
    ];
    expect(classifyDifficulty(hits)).toBe("low");
  });

  it("classifies medium difficulty for moderate issues", () => {
    const hits = [
      ...Array.from({ length: 2 }, (_, i) => ({
        rule: `rule-${i}`,
        category: "test",
        severity: "breaking" as const,
        file: "test.vue",
        line: i + 1,
        match: "test",
        message: "test",
      })),
    ];
    // 2 breaking = 6 points -> medium
    expect(classifyDifficulty(hits)).toBe("medium");
  });
});
