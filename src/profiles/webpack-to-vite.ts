import type { MigrationProfile } from "./types.js";

export const webpackToViteProfile: MigrationProfile = {
  id: "webpack-to-vite",
  name: "Webpack to Vite",
  description: "Migration profile for migrating from Webpack to Vite build tool",

  patternRules: [
    {
      id: "require-call",
      category: "Module System",
      pattern: /\brequire\s*\(\s*['"][^'"]+['"]\s*\)/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "breaking",
      message: "CommonJS require() must be converted to ESM import. Vite uses native ES modules.",
    },
    {
      id: "module-exports",
      category: "Module System",
      pattern: /module\.exports\s*=/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "module.exports must be converted to ESM export. Vite uses native ES modules.",
    },
    {
      id: "webpack-require-context",
      category: "Webpack API",
      pattern: /require\.context\s*\(/,
      fileGlob: "**/*.{js,ts,jsx,tsx,vue}",
      severity: "breaking",
      message: "require.context is webpack-specific. Replace with import.meta.glob() in Vite.",
    },
    {
      id: "webpack-hot",
      category: "Webpack API",
      pattern: /module\.hot\b/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "breaking",
      message: "module.hot is webpack HMR API. Replace with import.meta.hot in Vite.",
    },
    {
      id: "process-env",
      category: "Environment Variables",
      pattern: /process\.env\.\w+/,
      fileGlob: "**/*.{js,ts,jsx,tsx,vue}",
      severity: "breaking",
      message: "process.env.* must be replaced with import.meta.env.* in Vite. Prefix variables with VITE_.",
    },
    {
      id: "webpack-define-plugin",
      category: "Webpack Config",
      pattern: /new\s+webpack\.DefinePlugin/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "DefinePlugin should be replaced with Vite's define config option.",
    },
    {
      id: "webpack-loader-config",
      category: "Webpack Config",
      pattern: /module\s*:\s*\{[\s\S]*?rules\s*:/,
      fileGlob: "**/webpack.config.{js,ts}",
      severity: "breaking",
      message: "Webpack loader rules must be converted to Vite plugins or removed (many are built-in).",
    },
    {
      id: "css-modules-require",
      category: "CSS Handling",
      pattern: /require\s*\(\s*['"][^'"]+\.css['"]\s*\)/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "deprecated",
      message: "CSS require should be converted to ESM import. Vite handles CSS imports natively.",
    },
    {
      id: "file-loader-url",
      category: "Asset Handling",
      pattern: /file-loader|url-loader/,
      fileGlob: "**/webpack.config.{js,ts}",
      severity: "deprecated",
      message: "file-loader/url-loader are not needed. Vite handles assets natively.",
    },
    {
      id: "html-webpack-plugin",
      category: "Webpack Plugins",
      pattern: /HtmlWebpackPlugin/,
      fileGlob: "**/webpack.config.{js,ts}",
      severity: "breaking",
      message: "HtmlWebpackPlugin is not needed. Vite uses index.html in project root as entry point.",
    },
  ],

  dependencyRules: [
    {
      name: "webpack",
      severity: "breaking",
      message: "Webpack must be replaced with Vite.",
    },
    {
      name: "webpack-cli",
      severity: "breaking",
      message: "webpack-cli should be removed. Vite has its own CLI.",
    },
    {
      name: "webpack-dev-server",
      severity: "breaking",
      message: "webpack-dev-server should be removed. Vite has a built-in dev server.",
    },
    {
      name: "babel-loader",
      severity: "deprecated",
      message: "babel-loader is not needed. Vite uses esbuild for transformation.",
    },
    {
      name: "css-loader",
      severity: "deprecated",
      message: "css-loader is not needed. Vite handles CSS natively.",
    },
    {
      name: "style-loader",
      severity: "deprecated",
      message: "style-loader is not needed. Vite handles CSS injection natively.",
    },
    {
      name: "file-loader",
      severity: "deprecated",
      message: "file-loader is not needed. Vite handles static assets natively.",
    },
    {
      name: "url-loader",
      severity: "deprecated",
      message: "url-loader is not needed. Vite handles asset inlining natively.",
    },
  ],

  researchQueries: [
    {
      label: "Vite Migration Guide",
      url: "https://vite.dev/guide/migration",
      prompt: "Extract step-by-step instructions for migrating from webpack to Vite. List webpack loader/plugin equivalents in Vite. Show config translation examples for common webpack configurations like loaders, plugins, and dev server settings.",
    },
    {
      label: "Vite Features Overview",
      url: "https://vite.dev/guide/features",
      prompt: "List Vite features that replace webpack functionality: HMR, code splitting, asset handling, env variables, CSS support, JSON import, glob import. Note differences in behavior compared to webpack.",
    },
  ],

  researchKeywords: [
    "webpack", "vite", "esbuild", "rollup",
    "loader", "plugin", "HMR", "hot module replacement",
    "code splitting", "dynamic import", "lazy loading",
    "process.env", "import.meta", "import.meta.glob",
    "require", "module.exports", "CommonJS", "ESM",
    "css modules", "PostCSS", "sass", "less",
    "asset handling", "static assets", "public directory",
  ],

  configFilePatterns: ["webpack.config", "babel.config", ".babelrc", "postcss.config"],

  preparationSteps: [
    {
      title: "Create migration branch",
      description: "Create a dedicated branch for the webpack-to-vite migration.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Install Vite",
      description: "Install vite and any necessary Vite plugins (e.g., @vitejs/plugin-react, @vitejs/plugin-vue).",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Create vite.config.ts",
      description: "Create initial Vite configuration file translating webpack settings.",
      affectedFiles: ["vite.config.ts"],
      effort: "medium",
    },
    {
      title: "Move index.html to project root",
      description: "Vite uses index.html as entry point in the project root, not in a public folder.",
      affectedFiles: ["index.html"],
      effort: "low",
    },
  ],

  phaseTemplates: [
    {
      name: "Module System Conversion",
      description: "Convert CommonJS require/exports to ES module import/export syntax",
      categories: ["Module System"],
    },
    {
      name: "Webpack API Replacement",
      description: "Replace webpack-specific APIs with Vite equivalents",
      categories: ["Webpack API", "Environment Variables"],
    },
    {
      name: "Config & Plugin Migration",
      description: "Migrate webpack configuration, loaders, and plugins to Vite equivalents",
      categories: ["Webpack Config", "Webpack Plugins", "CSS Handling", "Asset Handling"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove webpack dependencies",
      description: "Uninstall webpack, webpack-cli, webpack-dev-server, and all webpack loaders/plugins.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Remove webpack config files",
      description: "Delete webpack.config.js/ts and related config files no longer needed.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Update npm scripts",
      description: "Update package.json scripts to use vite instead of webpack commands.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the migration.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Production build verification",
      description: "Run vite build and verify production output matches expectations.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
