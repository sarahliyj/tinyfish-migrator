import type { MigrationProfile } from "./types.js";

export const python2ToPython3Profile: MigrationProfile = {
  id: "python2-to-python3",
  name: "Python 2 to Python 3",
  description: "Migration profile for migrating from Python 2 to Python 3",

  patternRules: [
    {
      id: "print-statement",
      category: "Syntax",
      pattern: /\bprint\s+(?![\s(])[^\n=]+/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "print statement must be converted to print() function call.",
    },
    {
      id: "except-comma",
      category: "Exception Handling",
      pattern: /\bexcept\s+\w+\s*,\s*\w+/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "'except Exception, e' must be changed to 'except Exception as e'.",
    },
    {
      id: "unicode-literal",
      category: "Strings",
      pattern: /\bu["']/,
      fileGlob: "**/*.py",
      severity: "warning",
      message: "u'' unicode literals are unnecessary in Python 3 (all strings are unicode by default).",
    },
    {
      id: "raw-input",
      category: "Built-ins",
      pattern: /\braw_input\s*\(/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "raw_input() is removed in Python 3. Use input() instead.",
    },
    {
      id: "xrange-usage",
      category: "Built-ins",
      pattern: /\bxrange\s*\(/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "xrange() is removed in Python 3. Use range() instead (which behaves like xrange in Python 3).",
    },
    {
      id: "dict-iteritems",
      category: "Dictionary Methods",
      pattern: /\.iteritems\s*\(\s*\)/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: ".iteritems() is removed in Python 3. Use .items() instead.",
    },
    {
      id: "dict-itervalues",
      category: "Dictionary Methods",
      pattern: /\.itervalues\s*\(\s*\)/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: ".itervalues() is removed in Python 3. Use .values() instead.",
    },
    {
      id: "dict-iterkeys",
      category: "Dictionary Methods",
      pattern: /\.iterkeys\s*\(\s*\)/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: ".iterkeys() is removed in Python 3. Use .keys() instead.",
    },
    {
      id: "dict-has-key",
      category: "Dictionary Methods",
      pattern: /\.has_key\s*\(/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: ".has_key() is removed in Python 3. Use the 'in' operator instead.",
    },
    {
      id: "long-builtin",
      category: "Built-ins",
      pattern: /\blong\s*\(/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "long() is removed in Python 3. int handles arbitrary precision.",
    },
    {
      id: "urllib2-import",
      category: "Standard Library",
      pattern: /\bimport\s+urllib2\b/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "urllib2 is removed in Python 3. Use urllib.request and urllib.error instead.",
    },
    {
      id: "cpickle-import",
      category: "Standard Library",
      pattern: /\bimport\s+cPickle\b/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "cPickle is removed in Python 3. Use pickle (which auto-uses the C implementation).",
    },
    {
      id: "stringio-import",
      category: "Standard Library",
      pattern: /\bfrom\s+StringIO\s+import\b|\bimport\s+StringIO\b/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "StringIO module is removed in Python 3. Use io.StringIO or io.BytesIO instead.",
    },
    {
      id: "exec-statement",
      category: "Syntax",
      pattern: /\bexec\s+[^\s(]/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "exec statement must be changed to exec() function call in Python 3.",
    },
    {
      id: "raise-string",
      category: "Exception Handling",
      pattern: /\braise\s+["']/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "Raising string exceptions is not supported in Python 3. Use raise Exception('message').",
    },
    {
      id: "metaclass-attribute",
      category: "Classes",
      pattern: /__metaclass__\s*=/,
      fileGlob: "**/*.py",
      severity: "breaking",
      message: "__metaclass__ attribute must be changed to metaclass keyword argument in class definition.",
    },
    {
      id: "integer-division",
      category: "Operators",
      pattern: /(?<!\/)\/(?!\/|=|\*)/,
      fileGlob: "**/*.py",
      severity: "warning",
      message: "Division operator / returns float in Python 3. Use // for integer division if needed.",
    },
  ],

  dependencyRules: [],

  researchQueries: [
    {
      label: "Python 3 Porting Guide",
      url: "https://docs.python.org/3/howto/pyporting.html",
      prompt: "Extract the complete guide for porting Python 2 code to Python 3. Include strategies for maintaining single-codebase compatibility, key syntax changes, library changes, and recommended tools (2to3, python-modernize, futurize). Provide code examples.",
    },
    {
      label: "What's New in Python 3.0",
      url: "https://docs.python.org/3/whatsnew/3.0.html",
      prompt: "Extract all breaking changes and new features in Python 3.0. Focus on print function, integer division, text vs bytes, removed modules, syntax changes, and library reorganization. Include migration examples.",
    },
  ],

  researchKeywords: [
    "python2", "python3", "2to3", "futurize",
    "print", "unicode", "bytes", "str",
    "xrange", "range", "raw_input", "input",
    "iteritems", "itervalues", "has_key",
    "urllib2", "cPickle", "StringIO",
    "exec", "raise", "__metaclass__",
    "division", "integer division",
  ],

  configFilePatterns: ["setup.py", "setup.cfg", "requirements.txt", "tox.ini"],

  preparationSteps: [
    {
      title: "Run 2to3 analysis",
      description: "Run `2to3 -w` in dry-run mode to identify all automatic fixable patterns.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Add __future__ imports",
      description: "Add 'from __future__ import print_function, division, absolute_import, unicode_literals' to all files for incremental compatibility.",
      affectedFiles: [],
      effort: "medium",
    },
    {
      title: "Set up CI for both Python versions",
      description: "Configure tox or CI to test against both Python 2 and Python 3 during migration.",
      affectedFiles: ["tox.ini"],
      effort: "medium",
    },
  ],

  phaseTemplates: [
    {
      name: "Syntax Modernization",
      description: "Fix print statements, except syntax, exec statements, and raise patterns",
      categories: ["Syntax", "Exception Handling"],
    },
    {
      name: "Built-in & Operator Changes",
      description: "Replace removed builtins (xrange, raw_input, long) and fix division behavior",
      categories: ["Built-ins", "Operators"],
    },
    {
      name: "Dictionary & String Methods",
      description: "Replace removed dict methods and update string handling for unicode-by-default",
      categories: ["Dictionary Methods", "Strings"],
    },
    {
      name: "Standard Library Updates",
      description: "Update imports for reorganized standard library modules",
      categories: ["Standard Library", "Classes"],
    },
  ],

  cleanupSteps: [
    {
      title: "Remove __future__ imports",
      description: "Once fully on Python 3, remove unnecessary __future__ imports.",
      affectedFiles: [],
      effort: "low",
    },
    {
      title: "Remove Python 2 compatibility shims",
      description: "Remove six, future, and other Python 2/3 compatibility libraries.",
      affectedFiles: ["requirements.txt"],
      effort: "medium",
    },
    {
      title: "Run full test suite on Python 3",
      description: "Execute all tests under Python 3 and fix any remaining failures.",
      affectedFiles: [],
      effort: "medium",
    },
  ],
};
