import type { MigrationProfile } from "./types.js";

export const expressToFastifyProfile: MigrationProfile = {
  id: "express-to-fastify",
  name: "Express to Fastify",
  description: "Migration profile for migrating from Express.js to Fastify web framework",

  patternRules: [
    {
      id: "express-app-create",
      category: "App Initialization",
      pattern: /\bexpress\s*\(\s*\)/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "express() should be replaced with Fastify() instance creation.",
    },
    {
      id: "express-router",
      category: "Routing",
      pattern: /express\.Router\s*\(\s*\)/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "express.Router() should be replaced with Fastify plugin pattern using fastify.register().",
    },
    {
      id: "app-use-middleware",
      category: "Middleware",
      pattern: /app\.use\s*\(\s*(?!['"]\/)/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "app.use() middleware pattern should be replaced with Fastify hooks (onRequest, preHandler) or plugins.",
    },
    {
      id: "req-body-access",
      category: "Request Handling",
      pattern: /req\.body\b/,
      fileGlob: "**/*.{js,ts}",
      severity: "warning",
      message: "req.body works in Fastify but body parsing is built-in. Remove body-parser middleware.",
    },
    {
      id: "res-send",
      category: "Response Handling",
      pattern: /res\.send\s*\(/,
      fileGlob: "**/*.{js,ts}",
      severity: "deprecated",
      message: "res.send() should be replaced with reply.send() in Fastify.",
    },
    {
      id: "res-json",
      category: "Response Handling",
      pattern: /res\.json\s*\(/,
      fileGlob: "**/*.{js,ts}",
      severity: "deprecated",
      message: "res.json() should be replaced with reply.send() in Fastify (auto-serializes objects).",
    },
    {
      id: "res-status",
      category: "Response Handling",
      pattern: /res\.status\s*\(\s*\d+\s*\)/,
      fileGlob: "**/*.{js,ts}",
      severity: "deprecated",
      message: "res.status() should be replaced with reply.code() in Fastify.",
    },
    {
      id: "error-middleware",
      category: "Error Handling",
      pattern: /function\s*\(\s*err\s*,\s*req\s*,\s*res\s*,\s*next\s*\)/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "Express error middleware (err, req, res, next) should be replaced with Fastify setErrorHandler().",
    },
    {
      id: "next-callback",
      category: "Middleware",
      pattern: /\bnext\s*\(\s*\)/,
      fileGlob: "**/*.{js,ts}",
      severity: "deprecated",
      message: "next() callback pattern is replaced by Fastify's hook system (done callback or async/await).",
    },
    {
      id: "app-listen",
      category: "App Initialization",
      pattern: /app\.listen\s*\(/,
      fileGlob: "**/*.{js,ts}",
      severity: "deprecated",
      message: "app.listen() should be replaced with fastify.listen({ port, host }).",
    },
  ],

  dependencyRules: [
    {
      name: "express",
      severity: "breaking",
      message: "Express must be replaced with Fastify.",
    },
    {
      name: "body-parser",
      severity: "deprecated",
      message: "body-parser is not needed. Fastify has built-in body parsing.",
    },
    {
      name: "cors",
      severity: "deprecated",
      message: "cors middleware should be replaced with @fastify/cors plugin.",
    },
    {
      name: "helmet",
      severity: "deprecated",
      message: "helmet should be replaced with @fastify/helmet plugin.",
    },
    {
      name: "express-rate-limit",
      severity: "deprecated",
      message: "express-rate-limit should be replaced with @fastify/rate-limit plugin.",
    },
    {
      name: "morgan",
      severity: "deprecated",
      message: "morgan logger should be removed. Fastify has built-in pino logging.",
    },
    {
      name: "multer",
      severity: "deprecated",
      message: "multer should be replaced with @fastify/multipart plugin.",
    },
    {
      name: "serve-static",
      severity: "deprecated",
      message: "serve-static should be replaced with @fastify/static plugin.",
    },
  ],

  researchQueries: [
    {
      label: "Fastify Migration Guide",
      url: "https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/",
      prompt: "Extract the key differences between Express and Fastify. Show how to convert Express middleware, routes, and error handlers to Fastify equivalents. List Fastify plugins that replace common Express middleware. Include code examples for route definitions, middleware conversion, and error handling.",
    },
    {
      label: "Fastify Plugin Ecosystem",
      url: "https://fastify.dev/docs/latest/Guides/Ecosystem/",
      prompt: "List the most popular Fastify plugins and which Express packages they replace. Include @fastify/cors, @fastify/helmet, @fastify/static, @fastify/multipart, @fastify/rate-limit, @fastify/cookie, @fastify/session, @fastify/jwt, and others. Show how to register and configure each plugin.",
    },
  ],

  researchKeywords: [
    "fastify", "express", "middleware", "plugin",
    "route", "handler", "hook", "decorator",
    "onRequest", "preHandler", "preValidation", "preSerialization",
    "reply", "request", "send", "code",
    "schema", "validation", "serialization",
    "body-parser", "cors", "helmet", "rate-limit",
    "pino", "logging", "error handler",
  ],

  configFilePatterns: ["tsconfig", "package.json"],

  preparationSteps: [
    {
      title: "Create migration branch",
      description: "Create a dedicated branch for the Express-to-Fastify migration.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Install Fastify and plugins",
      description: "Install fastify and replacement plugins: @fastify/cors, @fastify/helmet, @fastify/static, etc.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Create Fastify app entry point",
      description: "Create a new Fastify server initialization alongside the Express one for incremental migration.",
      affectedFiles: [],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "App Initialization & Routing",
      description: "Convert Express app creation and route definitions to Fastify",
      categories: ["App Initialization", "Routing"],
    },
    {
      name: "Middleware to Hooks/Plugins",
      description: "Convert Express middleware to Fastify hooks and plugins",
      categories: ["Middleware", "Error Handling"],
    },
    {
      name: "Request/Response API",
      description: "Update request and response API calls to Fastify equivalents",
      categories: ["Request Handling", "Response Handling"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove Express dependencies",
      description: "Uninstall express, body-parser, cors, helmet, morgan, and other Express middleware.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Add Fastify JSON schemas",
      description: "Add JSON Schema validation to routes for request/response validation and serialization.",
      affectedFiles: [],
      effort: "high",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the migration.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Production deployment verification",
      description: "Verify the Fastify server starts, handles requests correctly, and performance is acceptable.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
