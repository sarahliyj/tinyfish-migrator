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
import { angularjsToAngularProfile } from "../src/profiles/angularjs-to-angular.js";
import { python2ToPython3Profile } from "../src/profiles/python2-to-python3.js";
import { mysqlToPostgresqlProfile } from "../src/profiles/mysql-to-postgresql.js";
import { craToNextjsProfile } from "../src/profiles/cra-to-nextjs.js";
import { jqueryToVanillaProfile } from "../src/profiles/jquery-to-vanilla.js";
import { restToGraphqlProfile } from "../src/profiles/rest-to-graphql.js";
import { javaToKotlinProfile } from "../src/profiles/java-to-kotlin.js";
import { commonjsToEsmProfile } from "../src/profiles/commonjs-to-esm.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Registry ---

describe("profile registry", () => {
  it("lists all 14 profiles", () => {
    const ids = listProfiles();
    expect(ids).toContain("vue2-to-vue3");
    expect(ids).toContain("react-class-to-hooks");
    expect(ids).toContain("webpack-to-vite");
    expect(ids).toContain("js-to-typescript");
    expect(ids).toContain("angular-legacy-to-modern");
    expect(ids).toContain("express-to-fastify");
    expect(ids).toContain("angularjs-to-angular");
    expect(ids).toContain("python2-to-python3");
    expect(ids).toContain("mysql-to-postgresql");
    expect(ids).toContain("cra-to-nextjs");
    expect(ids).toContain("jquery-to-vanilla");
    expect(ids).toContain("rest-to-graphql");
    expect(ids).toContain("java-to-kotlin");
    expect(ids).toContain("commonjs-to-esm");
    expect(ids).toHaveLength(14);
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
    angularjsToAngularProfile,
    python2ToPython3Profile,
    mysqlToPostgresqlProfile,
    craToNextjsProfile,
    jqueryToVanillaProfile,
    restToGraphqlProfile,
    javaToKotlinProfile,
    commonjsToEsmProfile,
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

// --- AngularJS to Angular ---

describe("angularjs-to-angular", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "angularjs-sample");

  it("detects AngularJS patterns in app.js", async () => {
    const file = path.join(FIXTURE, "src", "app.js");
    const hits = await matchPatterns(file, angularjsToAngularProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("angular-module");
    expect(ruleIds).toContain("factory-service");
    expect(ruleIds).toContain("service-definition");
    expect(ruleIds).toContain("filter-definition");
    expect(ruleIds).toContain("directive-definition");
    expect(ruleIds).toContain("scope-usage");
    expect(ruleIds).toContain("http-service");
    expect(ruleIds).toContain("rootscope-usage");
    expect(ruleIds).toContain("watch-expression");
    expect(ruleIds).toContain("broadcast-emit");
    expect(ruleIds).toContain("inject-annotation");
  });

  it("detects template directives in main.html", async () => {
    const file = path.join(FIXTURE, "src", "templates", "main.html");
    const hits = await matchPatterns(file, angularjsToAngularProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("ng-app-directive");
    expect(ruleIds).toContain("ng-controller");
    expect(ruleIds).toContain("ng-model");
    expect(ruleIds).toContain("ng-show-hide");
    expect(ruleIds).toContain("ng-repeat");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, angularjsToAngularProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("angular");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "angularjs-to-angular");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(1);
  });

  it("produces a phased plan", async () => {
    const plan = await getMigrationPlan(FIXTURE, "angularjs-to-angular");
    expect(plan.phases.length).toBeGreaterThanOrEqual(3);
    const names = plan.phases.map((p) => p.name);
    expect(names).toContain("Preparation");
    expect(names).toContain("Cleanup & Validation");
  });
});

// --- Python 2 to Python 3 ---

describe("python2-to-python3", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "python2-sample");

  it("detects Python 2 patterns in app.py", async () => {
    const file = path.join(FIXTURE, "src", "app.py");
    const hits = await matchPatterns(file, python2ToPython3Profile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("print-statement");
    expect(ruleIds).toContain("raw-input");
    expect(ruleIds).toContain("xrange-usage");
    expect(ruleIds).toContain("unicode-literal");
    expect(ruleIds).toContain("dict-iteritems");
    expect(ruleIds).toContain("dict-itervalues");
    expect(ruleIds).toContain("dict-iterkeys");
    expect(ruleIds).toContain("dict-has-key");
    expect(ruleIds).toContain("long-builtin");
    expect(ruleIds).toContain("urllib2-import");
    expect(ruleIds).toContain("cpickle-import");
    expect(ruleIds).toContain("stringio-import");
    expect(ruleIds).toContain("except-comma");
    expect(ruleIds).toContain("raise-string");
    expect(ruleIds).toContain("metaclass-attribute");
    expect(ruleIds).toContain("exec-statement");
  });

  it("detects patterns in utils.py", async () => {
    const file = path.join(FIXTURE, "src", "utils.py");
    const hits = await matchPatterns(file, python2ToPython3Profile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("urllib2-import");
    expect(ruleIds).toContain("stringio-import");
    expect(ruleIds).toContain("xrange-usage");
    expect(ruleIds).toContain("dict-iteritems");
    expect(ruleIds).toContain("dict-has-key");
    expect(ruleIds).toContain("raw-input");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "python2-to-python3");
    expect(result.stats.totalHits).toBeGreaterThan(10);
  });
});

// --- MySQL to PostgreSQL ---

describe("mysql-to-postgresql", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "mysql-sample");

  it("detects MySQL patterns in schema.sql", async () => {
    const file = path.join(FIXTURE, "src", "schema.sql");
    const hits = await matchPatterns(file, mysqlToPostgresqlProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("backtick-identifiers");
    expect(ruleIds).toContain("auto-increment");
    expect(ruleIds).toContain("enum-type");
    expect(ruleIds).toContain("unsigned-type");
    expect(ruleIds).toContain("tinyint-mediumint");
    expect(ruleIds).toContain("double-type");
    expect(ruleIds).toContain("now-function");
  });

  it("detects MySQL patterns in queries.sql", async () => {
    const file = path.join(FIXTURE, "src", "queries.sql");
    const hits = await matchPatterns(file, mysqlToPostgresqlProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("backtick-identifiers");
    expect(ruleIds).toContain("ifnull-function");
    expect(ruleIds).toContain("limit-offset-syntax");
    expect(ruleIds).toContain("group-concat");
    expect(ruleIds).toContain("on-duplicate-key");
    expect(ruleIds).toContain("replace-into");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, mysqlToPostgresqlProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("mysql2");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "mysql-to-postgresql");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(1);
  });
});

// --- CRA to Next.js ---

describe("cra-to-nextjs", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "cra-sample");

  it("detects CRA patterns in App.jsx", async () => {
    const file = path.join(FIXTURE, "src", "App.jsx");
    const hits = await matchPatterns(file, craToNextjsProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("react-router-import");
    expect(ruleIds).toContain("browser-router");
    expect(ruleIds).toContain("use-navigate");
    expect(ruleIds).toContain("use-location");
    expect(ruleIds).toContain("react-app-env");
    expect(ruleIds).toContain("react-helmet");
    expect(ruleIds).toContain("react-lazy");
  });

  it("detects patterns in index.js", async () => {
    const file = path.join(FIXTURE, "src", "index.js");
    const hits = await matchPatterns(file, craToNextjsProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("service-worker");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, craToNextjsProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("react-scripts");
    expect(names).toContain("react-router-dom");
    expect(names).toContain("react-helmet");
    expect(names).toContain("react-app-rewired");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "cra-to-nextjs");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(4);
  });
});

// --- jQuery to Vanilla JS ---

describe("jquery-to-vanilla", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "jquery-sample");

  it("detects jQuery patterns in main.js", async () => {
    const file = path.join(FIXTURE, "src", "main.js");
    const hits = await matchPatterns(file, jqueryToVanillaProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("jquery-selector");
    expect(ruleIds).toContain("document-ready");
    expect(ruleIds).toContain("ajax-calls");
    expect(ruleIds).toContain("event-binding");
    expect(ruleIds).toContain("css-method");
    expect(ruleIds).toContain("animate-method");
    expect(ruleIds).toContain("dom-manipulation");
    expect(ruleIds).toContain("show-hide-toggle");
    expect(ruleIds).toContain("val-method");
    expect(ruleIds).toContain("attr-prop-data");
    expect(ruleIds).toContain("each-utility");
    expect(ruleIds).toContain("extend-utility");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, jqueryToVanillaProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("jquery");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "jquery-to-vanilla");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(1);
  });
});

// --- REST to GraphQL ---

describe("rest-to-graphql", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "rest-sample");

  it("detects REST patterns in routes/users.js", async () => {
    const file = path.join(FIXTURE, "src", "routes", "users.js");
    const hits = await matchPatterns(file, restToGraphqlProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("express-route-crud");
    expect(ruleIds).toContain("api-url-pattern");
    expect(ruleIds).toContain("res-status-pattern");
    expect(ruleIds).toContain("req-method-check");
  });

  it("detects REST client patterns in client.js", async () => {
    const file = path.join(FIXTURE, "src", "client.js");
    const hits = await matchPatterns(file, restToGraphqlProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("axios-crud");
    expect(ruleIds).toContain("api-url-pattern");
    expect(ruleIds).toContain("fetch-api-call");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, restToGraphqlProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("axios");
    expect(names).toContain("swagger-ui-express");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "rest-to-graphql");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(2);
  });
});

// --- Java to Kotlin ---

describe("java-to-kotlin", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "java-sample");

  it("detects Java patterns in User.java", async () => {
    const file = path.join(FIXTURE, "src", "User.java");
    const hits = await matchPatterns(file, javaToKotlinProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("null-check");
    expect(ruleIds).toContain("getter-setter");
    expect(ruleIds).toContain("static-method");
    expect(ruleIds).toContain("instanceof-check");
    expect(ruleIds).toContain("final-class");
    expect(ruleIds).toContain("void-return");
    expect(ruleIds).toContain("arraylist-creation");
    expect(ruleIds).toContain("hashmap-creation");
    expect(ruleIds).toContain("anonymous-class");
    expect(ruleIds).toContain("string-concatenation");
    expect(ruleIds).toContain("equals-method");
  });

  it("detects Java patterns in Utils.java", async () => {
    const file = path.join(FIXTURE, "src", "Utils.java");
    const hits = await matchPatterns(file, javaToKotlinProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("static-method");
    expect(ruleIds).toContain("null-check");
    expect(ruleIds).toContain("instanceof-check");
    expect(ruleIds).toContain("arraylist-creation");
    expect(ruleIds).toContain("hashmap-creation");
    expect(ruleIds).toContain("try-catch-block");
    expect(ruleIds).toContain("getter-setter");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "java-to-kotlin");
    expect(result.stats.totalHits).toBeGreaterThan(10);
  });
});

// --- CommonJS to ESM ---

describe("commonjs-to-esm", () => {
  const FIXTURE = path.join(__dirname, "fixtures", "commonjs-sample");

  it("detects CommonJS patterns in index.js", async () => {
    const file = path.join(FIXTURE, "src", "index.js");
    const hits = await matchPatterns(file, commonjsToEsmProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("require-call");
    expect(ruleIds).toContain("module-exports");
    expect(ruleIds).toContain("dirname-usage");
    expect(ruleIds).toContain("filename-usage");
    expect(ruleIds).toContain("require-resolve");
    expect(ruleIds).toContain("dynamic-require");
    expect(ruleIds).toContain("json-require");
  });

  it("detects CommonJS patterns in utils.js", async () => {
    const file = path.join(FIXTURE, "src", "utils.js");
    const hits = await matchPatterns(file, commonjsToEsmProfile.patternRules);

    const ruleIds = hits.map((h) => h.rule);
    expect(ruleIds).toContain("require-call");
    expect(ruleIds).toContain("exports-property");
    expect(ruleIds).toContain("dirname-usage");
    expect(ruleIds).toContain("filename-usage");
    expect(ruleIds).toContain("require-resolve");
    expect(ruleIds).toContain("dynamic-require");
  });

  it("detects dependencies", async () => {
    const issues = await analyzeDependencies(FIXTURE, commonjsToEsmProfile.dependencyRules);
    const names = issues.map((i) => i.name);
    expect(names).toContain("esm");
    expect(names).toContain("@babel/register");
    expect(names).toContain("ts-node");
  });

  it("produces a scan result", async () => {
    const result = await scanCodebase(FIXTURE, "commonjs-to-esm");
    expect(result.stats.totalHits).toBeGreaterThan(5);
    expect(result.dependencyIssues.length).toBe(3);
  });
});
