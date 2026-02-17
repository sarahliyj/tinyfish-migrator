import type { MigrationProfile } from "./types.js";

export const reactClassToHooksProfile: MigrationProfile = {
  id: "react-class-to-hooks",
  name: "React Class Components to Hooks",
  description: "Migration profile for converting React class components to functional components with hooks",

  patternRules: [
    {
      id: "class-component",
      category: "Class Components",
      pattern: /class\s+\w+\s+extends\s+(React\.)?Component/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "Class component detected. Convert to a functional component with hooks.",
    },
    {
      id: "pure-component",
      category: "Class Components",
      pattern: /class\s+\w+\s+extends\s+(React\.)?PureComponent/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "PureComponent detected. Convert to React.memo() wrapped functional component.",
    },
    {
      id: "component-did-mount",
      category: "Lifecycle Methods",
      pattern: /componentDidMount\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "componentDidMount should be replaced with useEffect(() => {}, []).",
    },
    {
      id: "component-did-update",
      category: "Lifecycle Methods",
      pattern: /componentDidUpdate\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "componentDidUpdate should be replaced with useEffect with dependencies.",
    },
    {
      id: "component-will-unmount",
      category: "Lifecycle Methods",
      pattern: /componentWillUnmount\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "componentWillUnmount should be replaced with useEffect cleanup function.",
    },
    {
      id: "this-state",
      category: "State Management",
      pattern: /this\.state\b/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "this.state should be replaced with useState hook.",
    },
    {
      id: "set-state",
      category: "State Management",
      pattern: /this\.setState\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "this.setState should be replaced with useState setter function.",
    },
    {
      id: "this-props",
      category: "Props Access",
      pattern: /this\.props\b/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "deprecated",
      message: "this.props should be replaced with destructured function parameters.",
    },
    {
      id: "create-ref",
      category: "Refs",
      pattern: /React\.createRef\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "deprecated",
      message: "React.createRef should be replaced with useRef hook.",
    },
    {
      id: "constructor-method",
      category: "Class Components",
      pattern: /constructor\s*\(\s*props\s*\)/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "Constructor pattern should be replaced with useState for initial state and useEffect for side effects.",
    },
    {
      id: "should-component-update",
      category: "Lifecycle Methods",
      pattern: /shouldComponentUpdate\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "deprecated",
      message: "shouldComponentUpdate should be replaced with React.memo or useMemo.",
    },
    {
      id: "get-derived-state",
      category: "Lifecycle Methods",
      pattern: /getDerivedStateFromProps\s*\(/,
      fileGlob: "**/*.{jsx,tsx,js,ts}",
      severity: "breaking",
      message: "getDerivedStateFromProps should be replaced with useState + useEffect or computed values during render.",
    },
  ],

  dependencyRules: [
    {
      name: "react",
      severity: "warning",
      message: "Ensure React 16.8+ for hooks support. React 18+ recommended.",
    },
    {
      name: "react-dom",
      severity: "warning",
      message: "Ensure react-dom matches React version for hooks support.",
    },
    {
      name: "enzyme",
      severity: "deprecated",
      message: "Enzyme has limited hooks support. Consider migrating to React Testing Library.",
    },
  ],

  researchQueries: [
    {
      label: "React Hooks Introduction",
      url: "https://react.dev/reference/react/hooks",
      prompt: "Extract the motivation for hooks and list all built-in hooks with their use cases. Show class-to-hooks conversion examples for common patterns like state management, lifecycle methods, and refs.",
    },
    {
      label: "React Hooks FAQ",
      url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
      prompt: "Extract common migration pitfalls when converting class components to hooks. List the rules of hooks, patterns for converting componentDidMount and componentWillUnmount to useEffect, and how to share logic with custom hooks.",
    },
    {
      label: "React Hooks Reference",
      url: "https://react.dev/reference/react",
      prompt: "List every built-in hook with its signature, when to use it, and what class pattern it replaces. Include useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue.",
    },
  ],

  researchKeywords: [
    "hooks", "useState", "useEffect", "useContext", "useReducer",
    "useCallback", "useMemo", "useRef", "useLayoutEffect",
    "class component", "functional component", "lifecycle",
    "componentDidMount", "componentDidUpdate", "componentWillUnmount",
    "this.state", "setState", "this.props",
    "React.memo", "PureComponent", "createRef",
    "custom hook", "rules of hooks",
  ],

  configFilePatterns: ["webpack.config", "babel.config", ".babelrc", "tsconfig", "vite.config"],

  preparationSteps: [
    {
      title: "Create migration branch",
      description: "Create a dedicated branch for the class-to-hooks migration.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Verify React version",
      description: "Ensure React 16.8+ is installed for hooks support. Upgrade to React 18+ recommended.",
      affectedFiles: ["package.json"],
      effort: "low",
    },
    {
      title: "Set up ESLint hooks plugin",
      description: "Install eslint-plugin-react-hooks to enforce rules of hooks during migration.",
      affectedFiles: ["package.json", ".eslintrc.js"],
      effort: "low",
    },
  ],

  phaseTemplates: [
    {
      name: "Class Component Conversion",
      description: "Convert class components to functional components with hooks",
      categories: ["Class Components"],
    },
    {
      name: "Lifecycle Migration",
      description: "Replace lifecycle methods with useEffect and other hooks",
      categories: ["Lifecycle Methods"],
    },
    {
      name: "State & Props Refactoring",
      description: "Replace this.state/this.props patterns with hooks",
      categories: ["State Management", "Props Access", "Refs"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove unused class imports",
      description: "Remove Component/PureComponent imports that are no longer needed.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Run full test suite",
      description: "Execute all tests and fix any failures from the conversion.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Update testing utilities",
      description: "Migrate from Enzyme to React Testing Library if applicable.",
      affectedFiles: [],
      effort: "high",
    },
  ],
};
