import type { MigrationProfile } from "./types.js";

export const commonjsToEsmProfile: MigrationProfile = {
  id: "commonjs-to-esm",
  name: "CommonJS to ES Modules",
  description: "Migration profile for migrating from CommonJS (require/module.exports) to ES Modules (import/export)",

  patternRules: [
    {
      id: "require-call",
      category: "Module Import",
      pattern: /\brequire\s*\(\s*['"][^'"]+['"]\s*\)/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "require() must be replaced with import statement or import() for dynamic imports.",
    },
    {
      id: "module-exports",
      category: "Module Export",
      pattern: /\bmodule\.exports\b/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "module.exports must be replaced with export default or named exports.",
    },
    {
      id: "exports-property",
      category: "Module Export",
      pattern: /\bexports\.\w+\s*=/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "exports.x = ... must be replaced with export const/function declarations.",
    },
    {
      id: "dirname-usage",
      category: "Node.js Globals",
      pattern: /\b__dirname\b/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "__dirname is not available in ES modules. Use import.meta.dirname (Node 21.2+) or fileURLToPath(import.meta.url).",
    },
    {
      id: "filename-usage",
      category: "Node.js Globals",
      pattern: /\b__filename\b/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "__filename is not available in ES modules. Use import.meta.filename (Node 21.2+) or fileURLToPath(import.meta.url).",
    },
    {
      id: "require-resolve",
      category: "Module Resolution",
      pattern: /\brequire\.resolve\s*\(/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "require.resolve() must be replaced with import.meta.resolve() in ES modules.",
    },
    {
      id: "dynamic-require",
      category: "Module Import",
      pattern: /\brequire\s*\(\s*[^'"]/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "Dynamic require() with variables must be replaced with dynamic import().",
    },
    {
      id: "json-require",
      category: "Module Import",
      pattern: /\brequire\s*\(\s*['"][^'"]+\.json['"]\s*\)/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "JSON require must be replaced with import assertion: import data from './file.json' with { type: 'json' }.",
    },
    {
      id: "require-extensions",
      category: "Module Resolution",
      pattern: /\brequire\.extensions\b/,
      fileGlob: "**/*.{js,ts,cjs,mjs}",
      severity: "breaking",
      message: "require.extensions is deprecated and not available in ES modules.",
    },
  ],

  dependencyRules: [
    {
      name: "esm",
      severity: "deprecated",
      message: "esm package is not needed with native ES module support. Use 'type: \"module\"' in package.json.",
    },
    {
      name: "@babel/register",
      severity: "warning",
      message: "@babel/register for CJS transforms may not be needed with native ES modules.",
    },
    {
      name: "ts-node",
      severity: "warning",
      message: "ts-node may need --esm flag or tsx as an alternative for ES module support.",
    },
  ],

  researchQueries: [
    {
      label: "Node.js ESM Documentation",
      url: "https://nodejs.org/api/esm.html",
      prompt: "Extract the complete guide for using ES modules in Node.js. Include package.json type field, import/export syntax, interop with CommonJS, import.meta properties, JSON imports, dynamic imports, and conditional exports. Provide code examples.",
    },
    {
      label: "Pure ESM Package Guide",
      url: "https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c",
      prompt: "Extract the guide for creating and migrating to pure ESM packages. Include package.json configuration, exports field, file extensions, __dirname replacement, JSON imports, and common pitfalls. Show before/after code examples.",
    },
  ],

  researchKeywords: [
    "commonjs", "esm", "es modules", "import", "export",
    "require", "module.exports", "exports",
    "__dirname", "__filename", "import.meta",
    "type module", "package.json",
    ".mjs", ".cjs", "file extension",
    "dynamic import", "import assertion",
    "interop", "default export", "named export",
  ],

  configFilePatterns: ["package.json", "tsconfig.json"],

  preparationSteps: [
    {
      title: "Add type: module to package.json",
      description: "Set \"type\": \"module\" in package.json to enable ES module resolution by default.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Update TypeScript config",
      description: "Set module/moduleResolution to Node16/NodeNext in tsconfig.json if using TypeScript.",
      affectedFiles: ["tsconfig.json"],
      effort: "low",
    },
    {
      title: "Add file extensions to imports",
      description: "ES modules require explicit file extensions (.js) in import specifiers.",
      affectedFiles: [],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Module Imports",
      description: "Convert require() calls to import statements and dynamic import()",
      categories: ["Module Import", "Module Resolution"],
    },
    {
      name: "Module Exports",
      description: "Convert module.exports and exports.x to export declarations",
      categories: ["Module Export"],
    },
    {
      name: "Node.js Globals & Config",
      description: "Replace __dirname/__filename with import.meta equivalents and update configuration",
      categories: ["Node.js Globals"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove CJS compatibility packages",
      description: "Uninstall esm, @babel/register, and other CommonJS-related tooling.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Rename .js to .mjs if needed",
      description: "If not using type: module, rename files to .mjs extension.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the migration.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
