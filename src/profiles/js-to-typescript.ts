import type { MigrationProfile } from "./types.js";

export const jsToTypescriptProfile: MigrationProfile = {
  id: "js-to-typescript",
  name: "JavaScript to TypeScript",
  description: "Migration profile for incrementally adopting TypeScript in a JavaScript project",

  patternRules: [
    {
      id: "any-type-assertion",
      category: "Type Safety",
      pattern: /as\s+any\b/,
      fileGlob: "**/*.{ts,tsx}",
      severity: "warning",
      message: "Usage of 'as any' bypasses type checking. Replace with proper types.",
    },
    {
      id: "ts-ignore",
      category: "Type Safety",
      pattern: /@ts-ignore\b/,
      fileGlob: "**/*.{ts,tsx}",
      severity: "warning",
      message: "@ts-ignore suppresses type errors. Use @ts-expect-error or fix the type issue.",
    },
    {
      id: "implicit-any-param",
      category: "Function Signatures",
      pattern: /function\s+\w+\s*\([^:)]+\)/,
      fileGlob: "**/*.{js,jsx}",
      severity: "deprecated",
      message: "Function parameters lack type annotations. Add TypeScript types when converting.",
    },
    {
      id: "module-exports-cjs",
      category: "Module System",
      pattern: /module\.exports\s*=/,
      fileGlob: "**/*.js",
      severity: "deprecated",
      message: "CommonJS module.exports should be converted to ESM export for TypeScript.",
    },
    {
      id: "require-import",
      category: "Module System",
      pattern: /\bconst\s+\w+\s*=\s*require\s*\(/,
      fileGlob: "**/*.js",
      severity: "deprecated",
      message: "CommonJS require should be converted to ESM import for TypeScript.",
    },
    {
      id: "jsdoc-type",
      category: "Documentation Types",
      pattern: /@type\s*\{/,
      fileGlob: "**/*.{js,jsx}",
      severity: "warning",
      message: "JSDoc @type annotations can be converted to native TypeScript types.",
    },
    {
      id: "jsdoc-param",
      category: "Documentation Types",
      pattern: /@param\s*\{/,
      fileGlob: "**/*.{js,jsx}",
      severity: "warning",
      message: "JSDoc @param annotations can be converted to TypeScript parameter types.",
    },
    {
      id: "prototype-class",
      category: "Class Patterns",
      pattern: /\.prototype\.\w+\s*=/,
      fileGlob: "**/*.js",
      severity: "deprecated",
      message: "Prototype-based patterns should be converted to TypeScript classes or interfaces.",
    },
  ],

  dependencyRules: [
    {
      name: "typescript",
      severity: "warning",
      message: "TypeScript should be installed as a devDependency. Use version 5.x recommended.",
    },
    {
      name: "@types/node",
      severity: "warning",
      message: "Install @types/node for Node.js type definitions.",
    },
    {
      name: "babel-eslint",
      severity: "deprecated",
      message: "babel-eslint should be replaced with @typescript-eslint/parser.",
    },
    {
      name: "eslint",
      severity: "warning",
      message: "ESLint config should be updated with @typescript-eslint/eslint-plugin.",
    },
  ],

  researchQueries: [
    {
      label: "TypeScript Migration Guide",
      url: "https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html",
      prompt: "Extract the recommended incremental migration strategy from JavaScript to TypeScript. List compiler options to enable gradually. Show examples of adding types to existing JS patterns like functions, classes, and modules.",
    },
    {
      label: "TypeScript Strict Mode",
      url: "https://www.typescriptlang.org/tsconfig/#strict",
      prompt: "List all strict mode flags, what each one catches, and examples of code that would fail under each flag. Include strictNullChecks, noImplicitAny, strictFunctionTypes, strictBindCallApply, and others.",
    },
  ],

  researchKeywords: [
    "typescript", "migration", "type annotation", "interface",
    "strict mode", "noImplicitAny", "strictNullChecks",
    "type assertion", "type guard", "generic",
    "tsconfig", "declaration", "module resolution",
    "any", "unknown", "never", "void",
    "ESM", "CommonJS", "import", "export",
    "JSDoc", "@types", "DefinitelyTyped",
  ],

  configFilePatterns: ["tsconfig", "jsconfig", ".eslintrc", "babel.config", ".babelrc"],

  preparationSteps: [
    {
      title: "Create migration branch",
      description: "Create a dedicated branch for the TypeScript migration.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Install TypeScript and type definitions",
      description: "Install typescript, @types/node, and other needed @types/* packages as devDependencies.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Create tsconfig.json with loose settings",
      description: "Create an initial tsconfig.json with allowJs: true, strict: false, to enable incremental migration.",
      affectedFiles: ["tsconfig.json"],
      effort: "low",
    },
    {
      title: "Update ESLint configuration",
      description: "Add @typescript-eslint/parser and @typescript-eslint/eslint-plugin.",
      affectedFiles: [".eslintrc.js", "package.json"],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Module System Conversion",
      description: "Convert CommonJS require/exports to ESM import/export syntax",
      categories: ["Module System"],
    },
    {
      name: "Type Annotations",
      description: "Add type annotations to function signatures and variables",
      categories: ["Function Signatures", "Documentation Types", "Class Patterns"],
    },
    {
      name: "Type Safety Improvements",
      description: "Remove type escape hatches and improve type safety",
      categories: ["Type Safety"],
    },
  ],

  cleanupSteps: [
    {
      title: "Enable strict mode incrementally",
      description: "Gradually enable strict TypeScript compiler flags: noImplicitAny, strictNullChecks, etc.",
      affectedFiles: ["tsconfig.json"],
      effort: "high",
    },
    {
      title: "Remove JSDoc type annotations",
      description: "Remove JSDoc @type/@param annotations that are now replaced by TypeScript types.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any type-related failures.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Production build verification",
      description: "Verify TypeScript compilation and production build succeed.",
      affectedFiles: [],
      effort: "low",
    },
  ],
};
