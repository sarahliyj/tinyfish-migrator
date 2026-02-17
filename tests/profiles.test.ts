import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { matchPatterns } from "../src/scanner/pattern-matcher.js";
import { analyzeDependencies } from "../src/scanner/dependency-analyzer.js";
import { walkFiles } from "../src/scanner/walker.js";
import { scanCodebase } from "../src/tools/scan-codebase.js";
import { getMigrationPlan } from "../src/tools/get-migration-plan.js";
import { getProfile, listProfiles } from "../src/profiles/registry.js";
import { reactClassToHooksProfile } from "../src/profiles/react-class-to-hooks.js";
import { webpackToViteProfile } from "../src/profiles/webpack-to-vite.js";
import { jsToTypescriptProfile } from "../src/profiles/js-to-typescript.js";
import { angularLegacyToModernProfile } from "../src/profiles/angular-legacy-to-modern.js";
import { expressToFastifyProfile } from "../src/profiles/express-to-fastify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Registry ---

describe("profile registry", () => {
  it("lists all 6 profiles", () => {
    const ids = listProfiles();
    expect(ids).toContain("vue2-to-vue3");
    expect(ids).toContain("react-class-to-hooks");
    expect(ids).toContain("webpack-to-vite");
    expect(ids).toContain("js-to-typescript");
    expect(ids).toContain("angular-legacy-to-modern");
    expect(ids).toContain("express-to-fastify");
    expect(ids).toHaveLength(6);
  });

  it("retrieves each profile by id", () => {
    for (const id of listProfiles()) {
      const profile = getProfile(id);
      expect(profile).toBeDefined();
      expect(profile!.id).toBe(id);
    }
  });
});

// --- Schema validation ---

describe("profile schema validation", () => {
  const allProfiles = [
    reactClassToHooksProfile,
    webpackToViteProfile,
    jsToTypescriptProfile,
    angularLegacyToModernProfile,
    expressToFastifyProfile,
  ];

  for (const profile of allProfiles) {
    describe(profile.id, () => {
      it("has non-empty research queries with prompts", () => {
        expect(profile.researchQueries.length).toBeGreaterThan(0);
        for (const q of profile.researchQueries) {
          expect(q.label).toBeTruthy();
          expect(q.url).toBeTruthy();
          expect(q.prompt.length).toBeGreaterThan(20);
        }
      });

      it("has non-empty researchKeywords", () => {
        expect(profile.researchKeywords.length).toBeGreaterThan(0);
      });

      it("has preparationSteps", () => {
        expect(profile.preparationSteps.length).toBeGreaterThan(0);
      });

      it("has phaseTemplates", () => {
        expect(profile.phaseTemplates.length).toBeGreaterThan(0);
      });

      it("has cleanupSteps", () => {
        expect(profile.cleanupSteps.length).toBeGreaterThan(0);
      });

      it("has pattern rules", () => {
        expect(profile.patternRules.length).toBeGreaterThan(0);
      });
    });
  }
});

// --- React Class to Hooks ---

describe("react-class-to-hooks", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "react-class-sample");

  it("detects class component patterns in UserProfile.jsx", async () => {
    const file = path.join(FIXTURE, "src", "UserProfile.jsx");
    const hits = await matchPatterns(file, reactClassToHooksProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("class-component");
    expect(ruleIds).toContain("component-did-mount");
    expect(ruleIds).toContain("component-did-update");
    expect(ruleIds).toContain("component-will-unmount");
    expect(ruleIds).toContain("this-state");
    expect(ruleIds).toContain("set-state");
    expect(ruleIds).toContain("this-props");
    expect(ruleIds).toContain("create-ref");
    expect(ruleIds).toContain("should-component-update");
  });

  it("detects PureComponent and getDerivedStateFromProps in Counter.jsx", async () => {
    const file = path.join(FIXTURE, "src", "Counter.jsx");
    const hits = await matchPatterns(file, reactClassToHooksProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("pure-component");
    expect(ruleIds).toContain("get-derived-state");
    expect(ruleIds).toContain("this-state");
    expect(ruleIds).toContain("set-state");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, reactClassToHooksProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("react");
    expect(names).toContain("react-dom");
    expect(names).toContain("enzyme");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "react-class-to-hooks");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(3);
  });

  it("produces a phased plan", async () => {
    const plan = await getMigrationPlan(FIXTURE, "react-class-to-hooks");
    expect(plan.phases.length).toBeGreaterThanOrEqual(3);
    const names = plan.phases.map((p) => p.name);
    expect(names).toContain("Preparation");
    expect(names).toContain("Cleanup & Validation");
  });
});

// --- Webpack to Vite ---

describe("webpack-to-vite", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "webpack-sample");

  it("detects webpack patterns in webpack.config.js", async () => {
    const file = path.join(FIXTURE, "webpack.config.js");
    const hits = await matchPatterns(file, webpackToViteProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("module-exports");
    expect(ruleIds).toContain("html-webpack-plugin");
    expect(ruleIds).toContain("webpack-define-plugin");
    expect(ruleIds).toContain("file-loader-url");
  });

  it("detects module system and env patterns in src/index.js", async () => {
    const file = path.join(FIXTURE, "src", "index.js");
    const hits = await matchPatterns(file, webpackToViteProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("require-call");
    expect(ruleIds).toContain("module-exports");
    expect(ruleIds).toContain("process-env");
    expect(ruleIds).toContain("webpack-hot");
    expect(ruleIds).toContain("webpack-require-context");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, webpackToViteProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("webpack");
    expect(names).toContain("webpack-cli");
    expect(names).toContain("webpack-dev-server");
    expect(names).toContain("babel-loader");
    expect(names).toContain("css-loader");
    expect(names).toContain("style-loader");
    expect(names).toContain("file-loader");
    expect(names).toContain("url-loader");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "webpack-to-vite");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(8);
  });
});

// --- JS to TypeScript ---

describe("js-to-typescript", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "js-to-ts-sample");

  it("detects JS patterns in utils.js", async () => {
    const file = path.join(FIXTURE, "src", "utils.js");
    const hits = await matchPatterns(file, jsToTypescriptProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("require-import");
    expect(ruleIds).toContain("module-exports-cjs");
    expect(ruleIds).toContain("jsdoc-type");
    expect(ruleIds).toContain("jsdoc-param");
    expect(ruleIds).toContain("implicit-any-param");
  });

  it("detects prototype patterns in User.js", async () => {
    const file = path.join(FIXTURE, "src", "models", "User.js");
    const hits = await matchPatterns(file, jsToTypescriptProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("prototype-class");
    expect(ruleIds).toContain("module-exports-cjs");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, jsToTypescriptProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("eslint");
    expect(names).toContain("babel-eslint");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "js-to-typescript");
    expect(result.stats.totalHits).toBeGreaterThan(3);
  });
});

// --- Angular Legacy to Modern ---

describe("angular-legacy-to-modern", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "angular-sample");

  it("detects NgModule patterns in app.module.ts", async () => {
    const file = path.join(FIXTURE, "src", "app", "app.module.ts");
    const hits = await matchPatterns(file, angularLegacyToModernProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("ng-module");
    expect(ruleIds).toContain("ng-module-declarations");
  });

  it("detects component patterns in user-list.component.ts", async () => {
    const file = path.join(FIXTURE, "src", "app", "user-list", "user-list.component.ts");
    const hits = await matchPatterns(file, angularLegacyToModernProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("non-standalone-component");
    expect(ruleIds).toContain("on-init-lifecycle");
    expect(ruleIds).toContain("view-child-decorator");
    expect(ruleIds).toContain("behavior-subject");
  });

  it("detects control flow directives in template", async () => {
    const file = path.join(FIXTURE, "src", "app", "user-list", "user-list.component.html");
    const hits = await matchPatterns(file, angularLegacyToModernProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("ngif-directive");
    expect(ruleIds).toContain("ngfor-directive");
    expect(ruleIds).toContain("ngswitch-directive");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, angularLegacyToModernProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("@angular/core");
    expect(names).toContain("@angular/cli");
    expect(names).toContain("@angular/common");
    expect(names).toContain("@ngrx/store");
    expect(names).toContain("rxjs");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "angular-legacy-to-modern");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(5);
  });
});

// --- Express to Fastify ---

describe("express-to-fastify", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "express-sample");

  it("detects express patterns in app.js", async () => {
    const file = path.join(FIXTURE, "src", "app.js");
    const hits = await matchPatterns(file, expressToFastifyProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("express-app-create");
    expect(ruleIds).toContain("express-router");
    expect(ruleIds).toContain("app-use-middleware");
    expect(ruleIds).toContain("res-json");
    expect(ruleIds).toContain("res-status");
    expect(ruleIds).toContain("error-middleware");
    expect(ruleIds).toContain("app-listen");
  });

  it("detects middleware patterns in auth.js", async () => {
    const file = path.join(FIXTURE, "src", "middleware", "auth.js");
    const hits = await matchPatterns(file, expressToFastifyProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("next-callback");
    expect(ruleIds).toContain("res-status");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, expressToFastifyProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("express");
    expect(names).toContain("body-parser");
    expect(names).toContain("cors");
    expect(names).toContain("helmet");
    expect(names).toContain("morgan");
    expect(names).toContain("multer");
    expect(names).toContain("serve-static");
    expect(names).toContain("express-rate-limit");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "express-to-fastify");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(8);
  });

  it("produces a phased plan", async () => {
    const plan = await getMigrationPlan(FIXTURE, "express-to-fastify");
    expect(plan.phases.length).toBeGreaterThanOrEqual(3);
    const names = plan.phases.map((p) => p.name);
    expect(names).toContain("Preparation");
    expect(names).toContain("Cleanup & Validation");
  });
});
