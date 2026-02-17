import type { MigrationProfile } from "./types.js";

export const angularLegacyToModernProfile: MigrationProfile = {
  id: "angular-legacy-to-modern",
  name: "Angular Legacy to Modern (v14→v17+)",
  description: "Migration profile for upgrading Angular from v14-era patterns to modern Angular (v17+ standalone, signals, new control flow)",

  patternRules: [
    {
      id: "ng-module",
      category: "NgModule",
      pattern: /@NgModule\s*\(\s*\{/,
      fileGlob: "**/*.ts",
      severity: "deprecated",
      message: "NgModule can be replaced with standalone components in Angular 17+.",
    },
    {
      id: "ng-module-declarations",
      category: "NgModule",
      pattern: /declarations\s*:\s*\[/,
      fileGlob: "**/*.ts",
      severity: "deprecated",
      message: "NgModule declarations should be migrated to standalone components with imports.",
    },
    {
      id: "non-standalone-component",
      category: "Standalone Components",
      pattern: /@Component\s*\(\s*\{(?![\s\S]*standalone\s*:\s*true)/,
      fileGlob: "**/*.ts",
      severity: "deprecated",
      message: "Component should be converted to standalone: true for modern Angular.",
    },
    {
      id: "ngif-directive",
      category: "Control Flow",
      pattern: /\*ngIf\s*=/,
      fileGlob: "**/*.{html,ts}",
      severity: "deprecated",
      message: "*ngIf should be replaced with @if block syntax in Angular 17+.",
    },
    {
      id: "ngfor-directive",
      category: "Control Flow",
      pattern: /\*ngFor\s*=/,
      fileGlob: "**/*.{html,ts}",
      severity: "deprecated",
      message: "*ngFor should be replaced with @for block syntax in Angular 17+.",
    },
    {
      id: "ngswitch-directive",
      category: "Control Flow",
      pattern: /\[ngSwitch\]/,
      fileGlob: "**/*.{html,ts}",
      severity: "deprecated",
      message: "[ngSwitch] should be replaced with @switch block syntax in Angular 17+.",
    },
    {
      id: "subscribe-manual",
      category: "Signals",
      pattern: /\.subscribe\s*\(/,
      fileGlob: "**/*.ts",
      severity: "warning",
      message: "Manual .subscribe() can often be replaced with signals and the async pipe or toSignal().",
    },
    {
      id: "behavior-subject",
      category: "Signals",
      pattern: /new\s+BehaviorSubject/,
      fileGlob: "**/*.ts",
      severity: "warning",
      message: "BehaviorSubject can be replaced with signal() in Angular 17+ for simple reactive state.",
    },
    {
      id: "on-init-lifecycle",
      category: "Lifecycle",
      pattern: /implements\s+OnInit\b/,
      fileGlob: "**/*.ts",
      severity: "warning",
      message: "Consider using inject() and constructor-based initialization or afterNextRender() for DOM-dependent init.",
    },
    {
      id: "view-child-decorator",
      category: "Queries",
      pattern: /@ViewChild\s*\(/,
      fileGlob: "**/*.ts",
      severity: "deprecated",
      message: "@ViewChild decorator should be replaced with viewChild() signal query in Angular 17+.",
    },
  ],

  dependencyRules: [
    {
      name: "@angular/core",
      severity: "breaking",
      message: "Upgrade @angular/core to v17+ for standalone components, signals, and new control flow.",
    },
    {
      name: "@angular/cli",
      severity: "breaking",
      message: "Upgrade @angular/cli to v17+ for latest schematics and migration support.",
    },
    {
      name: "@angular/common",
      severity: "breaking",
      message: "Upgrade @angular/common to v17+ to match core version.",
    },
    {
      name: "@ngrx/store",
      severity: "warning",
      message: "Consider using Angular signals for simple state management instead of NgRx.",
    },
    {
      name: "rxjs",
      severity: "warning",
      message: "Some RxJS patterns can be replaced with signals in Angular 17+.",
    },
  ],

  researchQueries: [
    {
      label: "Angular Update Guide",
      url: "https://angular.dev/update-guide",
      prompt: "Extract all breaking changes and deprecations between Angular 14 and Angular 17. List the migration steps for standalone components, new control flow syntax (@if, @for, @switch), and signals. Include any automatic migration schematics available.",
    },
    {
      label: "Angular Standalone Components",
      url: "https://angular.dev/guide/components/importing",
      prompt: "Show how to convert NgModule-based components to standalone. List the imports needed and patterns for lazy loading standalone components. Explain the imports array in standalone components vs NgModule declarations.",
    },
    {
      label: "Angular Signals Guide",
      url: "https://angular.dev/guide/signals",
      prompt: "Explain Angular signals: signal(), computed(), effect(). Show how to convert BehaviorSubject patterns to signals, how to use toSignal() and toObservable() for RxJS interop, and signal-based component inputs/outputs.",
    },
  ],

  researchKeywords: [
    "standalone", "NgModule", "signals", "signal", "computed", "effect",
    "control flow", "@if", "@for", "@switch", "@defer",
    "inject", "injection", "dependency injection",
    "viewChild", "contentChild", "input", "output",
    "BehaviorSubject", "Observable", "toSignal", "toObservable",
    "deprecated", "breaking change", "migration", "schematic",
    "lazy loading", "route", "router",
  ],

  configFilePatterns: ["angular.json", "tsconfig", "karma.conf"],

  preparationSteps: [
    {
      title: "Create migration branch",
      description: "Create a dedicated branch for the Angular modernization.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Run ng update",
      description: "Use ng update @angular/core @angular/cli to run official migration schematics.",
      affectedFiles: ["package.json", "angular.json"],
      effort: "medium",
    },
    {
      title: "Update TypeScript version",
      description: "Ensure TypeScript version matches Angular 17+ requirements (TS 5.2+).",
      affectedFiles: ["package.json", "tsconfig.json"],
      effort: "low",
    },
  ],

  phaseTemplates: [
    {
      name: "Standalone Component Migration",
      description: "Convert NgModule-based components to standalone components",
      categories: ["NgModule", "Standalone Components"],
    },
    {
      name: "Control Flow Migration",
      description: "Replace structural directives (*ngIf, *ngFor, *ngSwitch) with new @-syntax",
      categories: ["Control Flow"],
    },
    {
      name: "Signals & Reactivity",
      description: "Adopt signals for reactive state management and component queries",
      categories: ["Signals", "Queries"],
    },
    {
      name: "Lifecycle Modernization",
      description: "Update lifecycle patterns to modern Angular conventions",
      categories: ["Lifecycle"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove empty NgModules",
      description: "Delete NgModule files that no longer have declarations after standalone migration.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the modernization.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Production build verification",
      description: "Run ng build --configuration=production and verify output.",
      affectedFiles: [],
      effort: "low",
    },
  ],
};
