# TinyFish Migrator

An MCP server that gives any AI assistant the ability to analyze codebases and generate migration plans. Uses [Mino (TinyFish)](https://tinyfish.ai) to fetch live migration guides from official docs and correlate them with your code.

## Supported Migrations

| Profile | From | To |
|---------|------|----|
| `vue2-to-vue3` | Vue 2 | Vue 3 |
| `react-class-to-hooks` | React class components | Functional + hooks |
| `webpack-to-vite` | Webpack | Vite |
| `js-to-typescript` | JavaScript | TypeScript |
| `angular-legacy-to-modern` | Angular 14 | Angular 17+ (standalone, signals) |
| `express-to-fastify` | Express | Fastify |
| `angularjs-to-angular` | AngularJS 1.x | Angular 2+ |
| `python2-to-python3` | Python 2 | Python 3 |
| `mysql-to-postgresql` | MySQL | PostgreSQL |
| `cra-to-nextjs` | Create React App | Next.js |
| `jquery-to-vanilla` | jQuery | Vanilla JS |
| `rest-to-graphql` | REST API | GraphQL |
| `java-to-kotlin` | Java | Kotlin |
| `commonjs-to-esm` | CommonJS | ES Modules |

JS/TS profiles are **auto-detected** from your project's `package.json`. Non-JS profiles (Python, Java, SQL) require explicit `profile_id` selection or use `analyze_custom_migration`.

## Setup

Add to your MCP client config and you're done.

**Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tinyfish-migrator": {
      "command": "npx",
      "args": ["-y", "tinyfish-migrator"]
    }
  }
}
```

**Cursor** — edit `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "tinyfish-migrator": {
      "command": "npx",
      "args": ["-y", "tinyfish-migrator"]
    }
  }
}
```

Same config pattern works for any MCP-compatible client (Windsurf, Cline, etc.).

## Usage

Just talk to your AI assistant:

> "Scan my project for migration issues"

> "I want to migrate from Express to Fastify — analyze my codebase and give me a plan"

> "What would it take to convert our class components to hooks?"

The tool auto-detects the migration type from your dependencies and uses Mino to pull live migration guides from official documentation.

### Tools

| Tool | What it does |
|------|-------------|
| `scan_codebase` | Pattern + dependency scan for migration issues |
| `analyze_migration` | Full analysis with Mino web research correlation |
| `get_migration_plan` | Phased migration plan with effort estimates |

## How It Works

```
Your AI assistant
      │
      ▼
┌─────────────────────┐
│  TinyFish Migrator   │  ← MCP server
│  (scan + plan)       │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌──────────┐
│  Local   │ │  Mino    │  ← TinyFish agent fetches live
│  Scanner │ │  Research │    migration guides from the web
└─────────┘ └──────────┘
```

1. **Scan** — regex pattern matching + `package.json` dependency analysis
2. **Research** — Mino fetches official migration guides and extracts structured advice
3. **Correlate** — scan findings are matched with research insights by keyword
4. **Plan** — profile-driven phased plan with preparation, upgrades, code changes, and cleanup

## Development

```bash
git clone <repo-url>
cd tinyfish-migrator
npm install
npm test          # run tests
npm run build     # compile TypeScript
npm run dev       # run server in dev mode
```
