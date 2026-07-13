import { exec } from "node:child_process";
import { promisify } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const execAsync = promisify(exec);

async function runCliJson(args) {
  const { stdout, stderr } = await execAsync(`npx -y @tanstack/cli ${args} --json`, {
    timeout: 60_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(stdout || stderr);
}

const server = new McpServer({
  name: "tanstack",
  version: "1.0.0",
});

server.registerTool(
  "search_tanstack_docs",
  {
    title: "Search TanStack Docs",
    description:
      "Search official TanStack documentation (Start, Router, Query, Form, DevTools, CLI). Returns titles, URLs, and breadcrumbs.",
    inputSchema: {
      query: z.string().describe("Search query, e.g. 'server functions' or 'useQuery'"),
      library: z
        .enum(["start", "router", "query", "form", "devtools", "cli"])
        .optional()
        .describe("Filter to a library: start, router, query, form, devtools, cli"),
      framework: z
        .string()
        .optional()
        .describe("Filter to a framework, e.g. 'react', 'vue', 'solid'"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe("Max results (default 10, max 50)"),
    },
  },
  async ({ query, library, framework, limit }) => {
    try {
      const parts = [`search-docs "${query.replace(/"/g, '\\"')}"`];
      if (library) parts.push(`--library ${library}`);
      if (framework) parts.push(`--framework ${framework}`);
      parts.push(`--limit ${limit}`);

      const data = await runCliJson(parts.join(" "));
      const text = data.results
        .map((r, i) => {
          const context = r.snippet || r.breadcrumb.join(" > ");
          return `${i + 1}. [${r.library}] ${r.title}\n   URL: ${r.url}\n   ${context}`;
        })
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${data.totalHits} total hits (showing ${data.results.length}):\n\n${text}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Search error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "fetch_tanstack_doc",
  {
    title: "Fetch TanStack Doc",
    description:
      "Fetch full Markdown content of a TanStack documentation page. Use search_tanstack_docs first to find the path.",
    inputSchema: {
      library: z
        .enum(["start", "router", "query", "form", "devtools", "cli"])
        .describe("Library ID: start, router, query, form, devtools, cli"),
      path: z
        .string()
        .describe(
          "Doc path relative to docs root, e.g. 'framework/react/overview' or 'guide/server-functions'",
        ),
      version: z
        .string()
        .default("latest")
        .describe("Docs version (default: latest)"),
    },
  },
  async ({ library, path, version }) => {
    try {
      const data = await runCliJson(
        `doc ${library} "${path.replace(/"/g, '\\"')}" --docs-version ${version}`,
      );

      return {
        content: [
          {
            type: "text",
            text: `# ${data.title}\nLibrary: ${data.library} (${data.version})\nURL: ${data.url}\n\n---\n\n${data.content}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fetch error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "list_tanstack_libraries",
  {
    title: "List TanStack Libraries",
    description:
      "List all official TanStack libraries with version info, supported frameworks, and docs URLs.",
    inputSchema: {
      group: z
        .enum(["state", "headlessUI", "performance", "tooling"])
        .optional()
        .describe("Optional filter: state, headlessUI, performance, tooling"),
    },
  },
  async ({ group }) => {
    try {
      const args = group ? `libraries --group ${group}` : "libraries";
      const data = await runCliJson(args);

      const text = data.libraries
        .map((lib) => {
          return `• ${lib.id} (${lib.latestVersion}) — ${lib.tagline}\n  Frameworks: ${lib.frameworks.join(", ") || "n/a"}\n  Docs: ${lib.docsUrl || `https://tanstack.com/${lib.id}/latest`}`;
        })
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `${data.group} — ${data.count} libraries:\n\n${text}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
