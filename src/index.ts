#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./server.js";

const server = new McpServer({
  name: "tinyfish-migrator",
  version: "1.0.0",
});

registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("TinyFish Migrator MCP server running on stdio");
