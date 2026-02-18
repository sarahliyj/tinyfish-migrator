import type { MigrationProfile } from "./types.js";

export const javaToKotlinProfile: MigrationProfile = {
  id: "java-to-kotlin",
  name: "Java to Kotlin",
  description: "Migration profile for migrating from Java to Kotlin",

  patternRules: [
    {
      id: "null-check",
      category: "Null Safety",
      pattern: /if\s*\(\s*\w+\s*!=\s*null\s*\)/,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "Null checks (if x != null) should be replaced with Kotlin's null safety operators (?., ?:, let).",
    },
    {
      id: "getter-setter",
      category: "Properties",
      pattern: /\bpublic\s+\w+\s+(?:get|set)[A-Z]\w*\s*\(/,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "Getter/setter methods should be replaced with Kotlin properties (val/var).",
    },
    {
      id: "static-method",
      category: "Companion Objects",
      pattern: /\bpublic\s+static\s+/,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "static methods should be moved to Kotlin companion objects or top-level functions.",
    },
    {
      id: "instanceof-check",
      category: "Type System",
      pattern: /\binstanceof\s+/,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "instanceof should be replaced with Kotlin's 'is' operator (with smart casting).",
    },
    {
      id: "try-catch-block",
      category: "Error Handling",
      pattern: /\bcatch\s*\(\s*\w+/,
      fileGlob: "**/*.java",
      severity: "warning",
      message: "try-catch can be simplified with Kotlin's runCatching or Result type.",
    },
    {
      id: "final-class",
      category: "Classes",
      pattern: /\bfinal\s+class\s+/,
      fileGlob: "**/*.java",
      severity: "warning",
      message: "final class is the default in Kotlin. Use 'open' keyword only when inheritance is needed.",
    },
    {
      id: "void-return",
      category: "Functions",
      pattern: /\bpublic\s+void\s+/,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "void return type is replaced by Unit in Kotlin (which can be omitted).",
    },
    {
      id: "arraylist-creation",
      category: "Collections",
      pattern: /new\s+ArrayList\s*</,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "new ArrayList<>() should be replaced with mutableListOf() or listOf() in Kotlin.",
    },
    {
      id: "hashmap-creation",
      category: "Collections",
      pattern: /new\s+HashMap\s*</,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "new HashMap<>() should be replaced with mutableMapOf() or mapOf() in Kotlin.",
    },
    {
      id: "anonymous-class",
      category: "Lambdas",
      pattern: /new\s+\w+\s*\(\s*\)\s*\{/,
      fileGlob: "**/*.java",
      severity: "deprecated",
      message: "Anonymous classes can often be replaced with Kotlin lambda expressions or object expressions.",
    },
    {
      id: "string-concatenation",
      category: "Strings",
      pattern: /"\s*\+\s*\w+\s*\+\s*"/,
      fileGlob: "**/*.java",
      severity: "warning",
      message: "String concatenation should be replaced with Kotlin string templates ($variable or ${expression}).",
    },
    {
      id: "equals-method",
      category: "Equality",
      pattern: /\.equals\s*\(/,
      fileGlob: "**/*.java",
      severity: "warning",
      message: ".equals() can be replaced with == operator in Kotlin (which calls equals()).",
    },
  ],

  dependencyRules: [],

  researchQueries: [
    {
      label: "Kotlin Migration Guide",
      url: "https://kotlinlang.org/docs/migration-guide.html",
      prompt: "Extract the complete guide for migrating from Java to Kotlin. Include syntax changes, null safety, data classes, extension functions, coroutines, and interop considerations. Provide code examples for each Java-to-Kotlin conversion pattern.",
    },
    {
      label: "Java-Kotlin Interop Guide",
      url: "https://kotlinlang.org/docs/java-interop.html",
      prompt: "Extract the Java-Kotlin interoperability guide. Include calling Kotlin from Java, calling Java from Kotlin, nullability annotations, platform types, and SAM conversions. Show how to maintain compatibility during incremental migration.",
    },
  ],

  researchKeywords: [
    "java", "kotlin", "migration", "conversion",
    "null safety", "nullable", "let", "apply",
    "data class", "sealed class", "companion object",
    "coroutines", "suspend", "flow",
    "extension function", "property", "val", "var",
    "lambda", "SAM conversion", "interop",
    "smart cast", "when", "string template",
  ],

  configFilePatterns: ["build.gradle", "build.gradle.kts", "pom.xml"],

  preparationSteps: [
    {
      title: "Add Kotlin support to build",
      description: "Add the Kotlin Gradle/Maven plugin and kotlin-stdlib dependency.",
      affectedFiles: ["build.gradle"],
      effort: "low",
    },
    {
      title: "Configure Java-Kotlin interop",
      description: "Ensure mixed compilation works and configure source sets for both Java and Kotlin.",
      affectedFiles: ["build.gradle"],
      effort: "medium",
    },
    {
      title: "Add nullability annotations to Java code",
      description: "Add @Nullable/@NonNull annotations to Java code for better Kotlin interop.",
      affectedFiles: [],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Data Classes & Properties",
      description: "Convert Java POJOs to Kotlin data classes and replace getters/setters with properties",
      categories: ["Properties", "Classes"],
    },
    {
      name: "Null Safety & Type System",
      description: "Replace null checks with Kotlin null safety operators and instanceof with smart casts",
      categories: ["Null Safety", "Type System", "Equality"],
    },
    {
      name: "Collections & Functions",
      description: "Convert collection creation, static methods, void returns, and lambdas to Kotlin idioms",
      categories: ["Collections", "Companion Objects", "Functions", "Lambdas"],
    },
    {
      name: "Kotlin Idioms",
      description: "Apply Kotlin-specific patterns: string templates, expression bodies, scope functions",
      categories: ["Strings", "Error Handling"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove converted Java files",
      description: "Delete Java source files that have been fully converted to Kotlin.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Apply Kotlin idioms",
      description: "Refactor auto-converted code to use idiomatic Kotlin patterns (scope functions, extension functions, etc.).",
      affectedFiles: [],
      effort: "high",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the migration.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
