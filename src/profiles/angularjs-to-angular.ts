import type { MigrationProfile } from "./types.js";

export const angularjsToAngularProfile: MigrationProfile = {
  id: "angularjs-to-angular",
  name: "AngularJS to Angular",
  description: "Migration profile for migrating from AngularJS 1.x to Angular 2+",

  patternRules: [
    {
      id: "ng-app-directive",
      category: "Bootstrap",
      pattern: /ng-app\s*=/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "ng-app directive must be replaced with Angular bootstrapModule() or bootstrapApplication().",
    },
    {
      id: "ng-controller",
      category: "Architecture",
      pattern: /ng-controller\s*=/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "ng-controller must be replaced with Angular components.",
    },
    {
      id: "ng-repeat",
      category: "Template Directives",
      pattern: /ng-repeat\s*=/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "ng-repeat must be replaced with *ngFor directive in Angular.",
    },
    {
      id: "ng-show-hide",
      category: "Template Directives",
      pattern: /ng-(?:show|hide)\s*=/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "ng-show/ng-hide should be replaced with [hidden] binding or *ngIf in Angular.",
    },
    {
      id: "ng-model",
      category: "Data Binding",
      pattern: /ng-model\s*=/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "ng-model must be replaced with [(ngModel)] two-way binding in Angular.",
    },
    {
      id: "scope-usage",
      category: "Architecture",
      pattern: /\$scope\b/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "$scope must be eliminated. Use component class properties and methods instead.",
    },
    {
      id: "angular-module",
      category: "Module System",
      pattern: /angular\.module\s*\(/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "angular.module() must be replaced with Angular @NgModule or standalone components.",
    },
    {
      id: "directive-definition",
      category: "Architecture",
      pattern: /\.directive\s*\(\s*['"]/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: ".directive() must be rewritten as an Angular @Directive or @Component.",
    },
    {
      id: "factory-service",
      category: "Dependency Injection",
      pattern: /\.factory\s*\(\s*['"]/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: ".factory() must be replaced with an Angular @Injectable service.",
    },
    {
      id: "service-definition",
      category: "Dependency Injection",
      pattern: /\.service\s*\(\s*['"]/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: ".service() must be replaced with an Angular @Injectable service.",
    },
    {
      id: "filter-definition",
      category: "Pipes",
      pattern: /\.filter\s*\(\s*['"]/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: ".filter() must be replaced with an Angular @Pipe.",
    },
    {
      id: "inject-annotation",
      category: "Dependency Injection",
      pattern: /\$inject\b/,
      fileGlob: "**/*.{js,html}",
      severity: "deprecated",
      message: "$inject annotations are replaced by Angular's constructor-based dependency injection.",
    },
    {
      id: "http-service",
      category: "HTTP",
      pattern: /\$http\b/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "$http must be replaced with Angular HttpClient.",
    },
    {
      id: "rootscope-usage",
      category: "Architecture",
      pattern: /\$rootScope\b/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "$rootScope must be replaced with Angular services or state management.",
    },
    {
      id: "watch-expression",
      category: "Change Detection",
      pattern: /\$watch\s*\(/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "$watch must be replaced with Angular change detection, OnChanges, or RxJS observables.",
    },
    {
      id: "broadcast-emit",
      category: "Events",
      pattern: /\$(?:broadcast|emit)\s*\(/,
      fileGlob: "**/*.{js,html}",
      severity: "breaking",
      message: "$broadcast/$emit must be replaced with Angular services, @Output EventEmitter, or RxJS subjects.",
    },
  ],

  dependencyRules: [
    {
      name: "angular",
      severity: "breaking",
      message: "AngularJS (angular) must be replaced with @angular/core.",
    },
  ],

  researchQueries: [
    {
      label: "Angular Upgrade Guide",
      url: "https://angular.io/guide/upgrade",
      prompt: "Extract the complete guide for upgrading from AngularJS to Angular. Include the ngUpgrade module usage, hybrid app setup, step-by-step migration of controllers to components, services to injectables, and directives. Provide code examples for each migration pattern.",
    },
    {
      label: "ngUpgrade API Reference",
      url: "https://angular.io/api/upgrade",
      prompt: "Extract the ngUpgrade API documentation. Show how to use UpgradeModule, downgradeComponent, downgradeInjectable for running AngularJS and Angular side by side during migration. Include setup code and usage examples.",
    },
  ],

  researchKeywords: [
    "angularjs", "angular", "ngupgrade", "upgrade",
    "ng-app", "ng-controller", "ng-repeat", "ng-model",
    "$scope", "$rootScope", "$http", "$watch",
    "directive", "component", "service", "factory",
    "module", "bootstrap", "dependency injection",
    "template", "pipe", "filter",
  ],

  configFilePatterns: ["package.json", ".bowerrc", "bower.json"],

  preparationSteps: [
    {
      title: "Set up Angular project alongside AngularJS",
      description: "Create an Angular project structure and configure ngUpgrade for hybrid operation.",
      affectedFiles: ["package.json"],
      effort: "high",
    },
    {
      title: "Switch to component-based architecture in AngularJS",
      description: "Refactor controllers to AngularJS 1.5+ components before migrating to Angular.",
      affectedFiles: [],
      effort: "high",
    },
    {
      title: "Install ngUpgrade dependencies",
      description: "Install @angular/upgrade and configure the hybrid bootstrap process.",
      affectedFiles: ["package.json"],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Bootstrap & Module Migration",
      description: "Set up Angular bootstrap and migrate AngularJS modules to Angular modules",
      categories: ["Bootstrap", "Module System"],
    },
    {
      name: "Architecture Migration",
      description: "Convert controllers, directives, factories and services to Angular components and services",
      categories: ["Architecture", "Dependency Injection"],
    },
    {
      name: "Template & Data Binding",
      description: "Update templates from AngularJS directives to Angular syntax",
      categories: ["Template Directives", "Data Binding", "Pipes"],
    },
    {
      name: "HTTP & Events",
      description: "Migrate $http to HttpClient and $broadcast/$emit to Angular patterns",
      categories: ["HTTP", "Events", "Change Detection"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove AngularJS dependency",
      description: "Uninstall angular, angular-route, angular-resource, and all AngularJS packages.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Remove ngUpgrade bridge",
      description: "Once all components are migrated, remove @angular/upgrade and hybrid bootstrap.",
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
