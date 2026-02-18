import type { MigrationProfile } from "./types.js";

export const craToNextjsProfile: MigrationProfile = {
  id: "cra-to-nextjs",
  name: "Create React App to Next.js",
  description: "Migration profile for migrating from Create React App (CRA) to Next.js",

  patternRules: [
    {
      id: "react-router-import",
      category: "Routing",
      pattern: /\bfrom\s+['"]react-router-dom['"]/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "breaking",
      message: "react-router-dom imports must be replaced with Next.js file-based routing and next/navigation.",
    },
    {
      id: "browser-router",
      category: "Routing",
      pattern: /\bBrowserRouter\b/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "breaking",
      message: "BrowserRouter must be removed. Next.js uses file-based routing with the app/ directory.",
    },
    {
      id: "use-navigate",
      category: "Routing",
      pattern: /\buseNavigate\s*\(\s*\)/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "breaking",
      message: "useNavigate() must be replaced with useRouter() from next/navigation.",
    },
    {
      id: "use-location",
      category: "Routing",
      pattern: /\buseLocation\s*\(\s*\)/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "breaking",
      message: "useLocation() must be replaced with usePathname() and useSearchParams() from next/navigation.",
    },
    {
      id: "react-app-env",
      category: "Environment Variables",
      pattern: /\bREACT_APP_\w+/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "breaking",
      message: "REACT_APP_ env vars must be renamed to NEXT_PUBLIC_ for client-side access in Next.js.",
    },
    {
      id: "public-index-html",
      category: "Entry Point",
      pattern: /public\/index\.html/,
      fileGlob: "**/*.{js,jsx,ts,tsx,json}",
      severity: "breaking",
      message: "public/index.html is not used in Next.js. Use app/layout.tsx for the HTML shell.",
    },
    {
      id: "react-helmet",
      category: "Head Management",
      pattern: /\bfrom\s+['"]react-helmet['"]/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "breaking",
      message: "react-helmet must be replaced with Next.js Metadata API or <Head> from next/head.",
    },
    {
      id: "react-lazy",
      category: "Code Splitting",
      pattern: /\bReact\.lazy\s*\(/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "deprecated",
      message: "React.lazy() can be replaced with next/dynamic for code splitting in Next.js.",
    },
    {
      id: "service-worker",
      category: "PWA",
      pattern: /\bserviceWorker\b/,
      fileGlob: "**/*.{js,jsx,ts,tsx}",
      severity: "deprecated",
      message: "CRA service worker setup should be replaced with next-pwa or removed.",
    },
    {
      id: "react-scripts-start",
      category: "Build Scripts",
      pattern: /react-scripts\s+(?:start|build|test)/,
      fileGlob: "**/*.{json}",
      severity: "breaking",
      message: "react-scripts commands must be replaced with next dev/build/start commands.",
    },
  ],

  dependencyRules: [
    {
      name: "react-scripts",
      severity: "breaking",
      message: "react-scripts must be replaced with next framework.",
    },
    {
      name: "react-router-dom",
      severity: "breaking",
      message: "react-router-dom should be replaced with Next.js file-based routing.",
    },
    {
      name: "react-helmet",
      severity: "deprecated",
      message: "react-helmet should be replaced with Next.js Metadata API.",
    },
    {
      name: "react-app-rewired",
      severity: "deprecated",
      message: "react-app-rewired is not needed. Use next.config.js for configuration.",
    },
  ],

  researchQueries: [
    {
      label: "Next.js CRA Migration Guide",
      url: "https://nextjs.org/docs/app/building-your-application/upgrading/from-create-react-app",
      prompt: "Extract the complete guide for migrating from Create React App to Next.js. Include step-by-step instructions for converting routing, environment variables, build configuration, and static assets. Provide code examples for each migration pattern.",
    },
    {
      label: "Next.js App Router Documentation",
      url: "https://nextjs.org/docs/app",
      prompt: "Extract the key concepts of the Next.js App Router. Include file-based routing, layouts, server components, client components, metadata API, and data fetching patterns. Show how each maps from traditional React/CRA patterns.",
    },
  ],

  researchKeywords: [
    "create-react-app", "cra", "next.js", "nextjs",
    "react-router", "file-based routing", "app router",
    "react-scripts", "next dev", "next build",
    "REACT_APP_", "NEXT_PUBLIC_",
    "react-helmet", "metadata", "head",
    "code splitting", "next/dynamic",
    "server components", "client components",
  ],

  configFilePatterns: ["package.json", "next.config.js", "next.config.mjs"],

  preparationSteps: [
    {
      title: "Install Next.js",
      description: "Install next alongside react-scripts for incremental migration.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Create Next.js directory structure",
      description: "Create app/ directory with layout.tsx and initial page.tsx.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Create next.config.js",
      description: "Set up Next.js configuration to handle existing CRA patterns.",
      affectedFiles: ["next.config.js"],
      effort: "low",
    },
  ],

  phaseTemplates: [
    {
      name: "Entry Point & Configuration",
      description: "Replace CRA entry point and build configuration with Next.js equivalents",
      categories: ["Entry Point", "Build Scripts"],
    },
    {
      name: "Routing Migration",
      description: "Convert react-router routes to Next.js file-based routing",
      categories: ["Routing"],
    },
    {
      name: "Environment & Head Management",
      description: "Rename env vars and replace react-helmet with Metadata API",
      categories: ["Environment Variables", "Head Management", "Code Splitting", "PWA"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove CRA dependencies",
      description: "Uninstall react-scripts, react-router-dom, react-helmet, and react-app-rewired.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Remove CRA files",
      description: "Delete public/index.html, src/index.js entry point, and CRA-specific config files.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the migration.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
