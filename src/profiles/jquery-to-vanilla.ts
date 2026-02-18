import type { MigrationProfile } from "./types.js";

export const jqueryToVanillaProfile: MigrationProfile = {
  id: "jquery-to-vanilla",
  name: "jQuery to Vanilla JS",
  description: "Migration profile for migrating from jQuery to vanilla JavaScript DOM APIs",

  patternRules: [
    {
      id: "jquery-selector",
      category: "DOM Selection",
      pattern: /\$\s*\(\s*['"`]/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "breaking",
      message: "$() selectors must be replaced with document.querySelector/querySelectorAll.",
    },
    {
      id: "document-ready",
      category: "Initialization",
      pattern: /\$\s*\(\s*document\s*\)\s*\.ready\s*\(|\$\s*\(\s*function/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "breaking",
      message: "$(document).ready() should be replaced with DOMContentLoaded event or defer script attribute.",
    },
    {
      id: "ajax-calls",
      category: "HTTP",
      pattern: /\$\s*\.\s*(?:ajax|get|post|getJSON)\s*\(/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "breaking",
      message: "$.ajax/$.get/$.post must be replaced with fetch() API or XMLHttpRequest.",
    },
    {
      id: "event-binding",
      category: "Events",
      pattern: /\.\s*on\s*\(\s*['"][a-z]+['"]/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "breaking",
      message: ".on() event binding must be replaced with addEventListener().",
    },
    {
      id: "css-method",
      category: "Styling",
      pattern: /\.\s*css\s*\(\s*['"`]/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: ".css() should be replaced with element.style property or classList manipulation.",
    },
    {
      id: "animate-method",
      category: "Animation",
      pattern: /\.\s*animate\s*\(\s*\{/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: ".animate() should be replaced with CSS transitions/animations or Web Animations API.",
    },
    {
      id: "dom-manipulation",
      category: "DOM Manipulation",
      pattern: /\.\s*(?:append|prepend|after|before)\s*\(/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: ".append/.prepend should be replaced with element.append/prepend or insertAdjacentHTML.",
    },
    {
      id: "show-hide-toggle",
      category: "Visibility",
      pattern: /\.\s*(?:hide|show|toggle)\s*\(\s*\)/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: ".hide/.show/.toggle should be replaced with classList.toggle or style.display.",
    },
    {
      id: "val-method",
      category: "Form Values",
      pattern: /\.\s*val\s*\(\s*\)/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: ".val() should be replaced with element.value property.",
    },
    {
      id: "attr-prop-data",
      category: "Attributes",
      pattern: /\.\s*(?:attr|prop|data)\s*\(\s*['"`]/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: ".attr/.prop/.data should be replaced with getAttribute/setAttribute or dataset property.",
    },
    {
      id: "each-utility",
      category: "Utilities",
      pattern: /\$\s*\.\s*each\s*\(/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: "$.each() should be replaced with Array.forEach, for...of, or Array.map.",
    },
    {
      id: "extend-utility",
      category: "Utilities",
      pattern: /\$\s*\.\s*extend\s*\(/,
      fileGlob: "**/*.{js,ts,html}",
      severity: "deprecated",
      message: "$.extend() should be replaced with Object.assign() or spread operator.",
    },
  ],

  dependencyRules: [
    {
      name: "jquery",
      severity: "breaking",
      message: "jQuery must be removed. All jQuery usage should be converted to native DOM APIs.",
    },
  ],

  researchQueries: [
    {
      label: "You Might Not Need jQuery",
      url: "https://youmightnotneedjquery.com/",
      prompt: "Extract the jQuery-to-vanilla-JS conversion patterns. For each jQuery method, show the equivalent vanilla JavaScript code. Cover selectors, DOM manipulation, events, AJAX, animations, and utility methods. Include browser compatibility notes.",
    },
    {
      label: "MDN DOM API Reference",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
      prompt: "Extract the modern DOM API methods that replace common jQuery operations. Cover querySelector/querySelectorAll, addEventListener, classList, fetch, element.append, insertAdjacentHTML, dataset, and the Web Animations API. Include code examples.",
    },
  ],

  researchKeywords: [
    "jquery", "vanilla js", "native dom",
    "querySelector", "querySelectorAll", "addEventListener",
    "fetch", "classList", "dataset",
    "append", "prepend", "insertAdjacentHTML",
    "DOMContentLoaded", "style", "animation",
    "getAttribute", "setAttribute", "element.value",
  ],

  configFilePatterns: ["package.json"],

  preparationSteps: [
    {
      title: "Audit jQuery usage",
      description: "Identify all jQuery usage patterns and categorize by complexity (simple selectors vs. complex plugins).",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Check browser support requirements",
      description: "Verify target browsers support the native APIs needed (querySelector, fetch, classList, etc.).",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Set up polyfills if needed",
      description: "Add polyfills for fetch, classList, or other APIs if supporting older browsers.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
  ],

  phaseTemplates: [
    {
      name: "DOM Selection & Initialization",
      description: "Convert jQuery selectors and document.ready to native equivalents",
      categories: ["DOM Selection", "Initialization"],
    },
    {
      name: "Events & HTTP",
      description: "Convert jQuery event handlers and AJAX calls to addEventListener and fetch",
      categories: ["Events", "HTTP"],
    },
    {
      name: "DOM Manipulation & Styling",
      description: "Convert jQuery DOM manipulation, styling, and animation methods",
      categories: ["DOM Manipulation", "Styling", "Animation", "Visibility"],
    },
    {
      name: "Forms, Attributes & Utilities",
      description: "Convert form value access, attribute methods, and utility functions",
      categories: ["Form Values", "Attributes", "Utilities"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove jQuery dependency",
      description: "Uninstall jquery package and remove script tags loading jQuery CDN.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Remove jQuery plugins",
      description: "Identify and replace any jQuery plugins with vanilla alternatives.",
      affectedFiles: ["package.json"],
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
