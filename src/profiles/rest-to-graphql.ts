import type { MigrationProfile } from "./types.js";

export const restToGraphqlProfile: MigrationProfile = {
  id: "rest-to-graphql",
  name: "REST API to GraphQL",
  description: "Migration profile for migrating from REST API to GraphQL",

  patternRules: [
    {
      id: "fetch-api-call",
      category: "HTTP Client",
      pattern: /\bfetch\s*\(\s*[`'"]/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "breaking",
      message: "fetch() calls to REST endpoints must be replaced with GraphQL queries/mutations.",
    },
    {
      id: "axios-crud",
      category: "HTTP Client",
      pattern: /\baxios\s*\.\s*(?:get|post|put|patch|delete)\s*\(/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "breaking",
      message: "axios HTTP methods must be replaced with GraphQL client operations (useQuery, useMutation).",
    },
    {
      id: "express-route-crud",
      category: "Server Routes",
      pattern: /\b(?:app|router)\s*\.\s*(?:get|post|put|patch|delete)\s*\(\s*['"`]/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "breaking",
      message: "Express route handlers must be converted to GraphQL resolvers.",
    },
    {
      id: "api-url-pattern",
      category: "URL Patterns",
      pattern: /\/api\/v\d+\//,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "deprecated",
      message: "/api/v* URL patterns are replaced by a single GraphQL endpoint.",
    },
    {
      id: "req-method-check",
      category: "Server Routes",
      pattern: /req\.method\s*===?\s*['"]/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "deprecated",
      message: "req.method checks are unnecessary with GraphQL (all requests use POST or GET).",
    },
    {
      id: "res-status-pattern",
      category: "Server Routes",
      pattern: /res\s*\.\s*status\s*\(\s*\d{3}\s*\)/,
      fileGlob: "**/*.{js,ts,jsx,tsx}",
      severity: "deprecated",
      message: "HTTP status code patterns should be replaced with GraphQL error handling.",
    },
    {
      id: "swagger-openapi",
      category: "Documentation",
      pattern: /\b(?:swagger|openapi)\b/i,
      fileGlob: "**/*.{js,ts,jsx,tsx,json,yaml,yml}",
      severity: "deprecated",
      message: "Swagger/OpenAPI specs should be replaced with GraphQL schema (which is self-documenting).",
    },
  ],

  dependencyRules: [
    {
      name: "axios",
      severity: "deprecated",
      message: "axios can be replaced with a GraphQL client like @apollo/client or urql.",
    },
    {
      name: "swagger-ui-express",
      severity: "deprecated",
      message: "swagger-ui-express should be replaced with GraphQL Playground or Apollo Studio.",
    },
  ],

  researchQueries: [
    {
      label: "Apollo GraphQL Migration Guide",
      url: "https://www.apollographql.com/docs/react/",
      prompt: "Extract guidance for migrating from REST APIs to GraphQL with Apollo. Include schema design, resolver patterns, client setup with useQuery/useMutation, caching strategy, and how to incrementally migrate from REST. Provide code examples.",
    },
    {
      label: "GraphQL Best Practices",
      url: "https://graphql.org/learn/best-practices/",
      prompt: "Extract GraphQL best practices relevant to REST API migration. Include schema design, pagination patterns, error handling, authentication, and batching. Show how REST patterns map to GraphQL equivalents.",
    },
  ],

  researchKeywords: [
    "rest", "graphql", "apollo", "schema",
    "resolver", "query", "mutation", "subscription",
    "useQuery", "useMutation", "gql",
    "fetch", "axios", "endpoint",
    "swagger", "openapi", "playground",
    "pagination", "cursor", "relay",
  ],

  configFilePatterns: ["package.json", "schema.graphql", "codegen.yml"],

  preparationSteps: [
    {
      title: "Install GraphQL dependencies",
      description: "Install graphql, @apollo/server (or express-graphql), and @apollo/client for the frontend.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Design GraphQL schema",
      description: "Create the GraphQL schema (types, queries, mutations) based on existing REST endpoints.",
      affectedFiles: ["schema.graphql"],
      effort: "high",
    },
    {
      title: "Set up GraphQL server endpoint",
      description: "Add a /graphql endpoint alongside existing REST routes for incremental migration.",
      affectedFiles: [],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Schema & Server Setup",
      description: "Define GraphQL schema and convert REST route handlers to resolvers",
      categories: ["Server Routes"],
    },
    {
      name: "Client Migration",
      description: "Replace REST API calls (fetch, axios) with GraphQL client operations",
      categories: ["HTTP Client", "URL Patterns"],
    },
    {
      name: "Documentation & Cleanup",
      description: "Replace Swagger/OpenAPI with GraphQL introspection and clean up REST patterns",
      categories: ["Documentation"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove REST-specific dependencies",
      description: "Uninstall axios, swagger-ui-express, and other REST-specific packages.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Remove REST routes",
      description: "Delete REST endpoint handlers and route files after all clients use GraphQL.",
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
