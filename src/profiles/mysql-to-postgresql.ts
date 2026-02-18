import type { MigrationProfile } from "./types.js";

export const mysqlToPostgresqlProfile: MigrationProfile = {
  id: "mysql-to-postgresql",
  name: "MySQL to PostgreSQL",
  description: "Migration profile for migrating from MySQL to PostgreSQL",

  patternRules: [
    {
      id: "backtick-identifiers",
      category: "SQL Syntax",
      pattern: /`[a-zA-Z_]\w*`/,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "Backtick-quoted identifiers must be replaced with double-quoted identifiers in PostgreSQL.",
    },
    {
      id: "auto-increment",
      category: "Schema",
      pattern: /\bAUTO_INCREMENT\b/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "AUTO_INCREMENT must be replaced with SERIAL or GENERATED ALWAYS AS IDENTITY in PostgreSQL.",
    },
    {
      id: "ifnull-function",
      category: "Functions",
      pattern: /\bIFNULL\s*\(/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "IFNULL() must be replaced with COALESCE() in PostgreSQL.",
    },
    {
      id: "limit-offset-syntax",
      category: "SQL Syntax",
      pattern: /\bLIMIT\s+\d+\s*,\s*\d+/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "LIMIT x,y syntax must be changed to LIMIT y OFFSET x in PostgreSQL.",
    },
    {
      id: "group-concat",
      category: "Functions",
      pattern: /\bGROUP_CONCAT\s*\(/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "GROUP_CONCAT() must be replaced with STRING_AGG() in PostgreSQL.",
    },
    {
      id: "unsigned-type",
      category: "Data Types",
      pattern: /\bUNSIGNED\b/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "UNSIGNED is not supported in PostgreSQL. Use CHECK constraints or appropriate integer types.",
    },
    {
      id: "enum-type",
      category: "Data Types",
      pattern: /\bENUM\s*\(/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "MySQL ENUM must be replaced with PostgreSQL CREATE TYPE ... AS ENUM or CHECK constraints.",
    },
    {
      id: "tinyint-mediumint",
      category: "Data Types",
      pattern: /\b(?:TINYINT|MEDIUMINT)\b/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "TINYINT/MEDIUMINT are not available in PostgreSQL. Use SMALLINT or INTEGER instead.",
    },
    {
      id: "on-duplicate-key",
      category: "SQL Syntax",
      pattern: /\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "ON DUPLICATE KEY UPDATE must be replaced with ON CONFLICT ... DO UPDATE in PostgreSQL.",
    },
    {
      id: "replace-into",
      category: "SQL Syntax",
      pattern: /\bREPLACE\s+INTO\b/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "breaking",
      message: "REPLACE INTO is not available in PostgreSQL. Use INSERT ... ON CONFLICT DO UPDATE instead.",
    },
    {
      id: "mysql-connection-js",
      category: "Client Connection",
      pattern: /\bmysql\.createConnection\s*\(|createPool\s*\(/,
      fileGlob: "**/*.{js,ts}",
      severity: "breaking",
      message: "MySQL client connection must be replaced with PostgreSQL client (pg) connection.",
    },
    {
      id: "mysql-query-placeholder",
      category: "Query Parameters",
      pattern: /\bquery\s*\([^)]*\?/,
      fileGlob: "**/*.{js,ts}",
      severity: "deprecated",
      message: "MySQL uses ? placeholders. PostgreSQL uses $1, $2 numbered placeholders.",
    },
    {
      id: "now-function",
      category: "Functions",
      pattern: /\bNOW\s*\(\s*\)/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "warning",
      message: "NOW() works in PostgreSQL but returns timestamp with timezone. Use CURRENT_TIMESTAMP for standard SQL.",
    },
    {
      id: "double-type",
      category: "Data Types",
      pattern: /\bDOUBLE\b(?!\s+PRECISION)/i,
      fileGlob: "**/*.{sql,js,ts,py,java,rb,php}",
      severity: "deprecated",
      message: "DOUBLE should be written as DOUBLE PRECISION in PostgreSQL.",
    },
  ],

  dependencyRules: [
    {
      name: "mysql",
      severity: "breaking",
      message: "mysql npm package must be replaced with pg (node-postgres).",
    },
    {
      name: "mysql2",
      severity: "breaking",
      message: "mysql2 npm package must be replaced with pg (node-postgres).",
    },
  ],

  researchQueries: [
    {
      label: "PostgreSQL Migration Wiki",
      url: "https://wiki.postgresql.org/wiki/Converting_from_other_Databases#MySQL",
      prompt: "Extract the complete guide for converting from MySQL to PostgreSQL. Include data type mappings, SQL syntax differences, function equivalents, and schema conversion steps. Provide examples for each conversion pattern.",
    },
    {
      label: "PostgreSQL Data Types Documentation",
      url: "https://www.postgresql.org/docs/current/datatype.html",
      prompt: "Extract the PostgreSQL data types that differ from MySQL. Map MySQL types to their PostgreSQL equivalents: TINYINT, MEDIUMINT, UNSIGNED, ENUM, DOUBLE, DATETIME, BLOB, TEXT. Include size limits and behavior differences.",
    },
  ],

  researchKeywords: [
    "mysql", "postgresql", "postgres", "migration",
    "auto_increment", "serial", "identity",
    "backtick", "double quote", "identifier",
    "ifnull", "coalesce", "group_concat", "string_agg",
    "enum", "unsigned", "tinyint", "mediumint",
    "on duplicate key", "on conflict",
    "replace into", "upsert",
    "query parameters", "placeholders",
  ],

  configFilePatterns: ["package.json", "docker-compose.yml", ".env"],

  preparationSteps: [
    {
      title: "Install PostgreSQL and pg driver",
      description: "Install PostgreSQL locally or via Docker, and add the pg npm package.",
      affectedFiles: ["package.json"],
      effort: "medium",
    },
    {
      title: "Export MySQL schema",
      description: "Export the MySQL database schema using mysqldump --no-data for conversion.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Set up parallel database connections",
      description: "Configure the application to connect to both MySQL and PostgreSQL during migration.",
      affectedFiles: [],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Schema Migration",
      description: "Convert MySQL schema to PostgreSQL: data types, constraints, and indexes",
      categories: ["Schema", "Data Types"],
    },
    {
      name: "SQL Syntax & Functions",
      description: "Convert MySQL-specific SQL syntax and functions to PostgreSQL equivalents",
      categories: ["SQL Syntax", "Functions"],
    },
    {
      name: "Application Code",
      description: "Update client connections, query parameters, and ORM configuration",
      categories: ["Client Connection", "Query Parameters"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove MySQL dependencies",
      description: "Uninstall mysql/mysql2 npm packages and remove MySQL configuration.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Data migration and verification",
      description: "Migrate data from MySQL to PostgreSQL and verify integrity.",
      affectedFiles: [],
      effort: "high",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests against PostgreSQL and fix any failures.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
