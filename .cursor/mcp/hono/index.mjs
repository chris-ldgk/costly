import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const LLMS_URL = "https://hono.dev/llms.txt";
const DOCS_BASE = "https://hono.dev/docs";

const categoryEnum = z.enum([
  "getting-started",
  "middleware",
  "helpers",
  "guides",
  "concepts",
  "api",
]);

let topicsCache = null;

function slugFromUrl(url) {
  const match = url.match(/https:\/\/hono\.dev\/docs\/(.+)$/);
  return match?.[1] ?? url;
}

function categoryFromSlug(slug) {
  const top = slug.split("/")[0];
  if (categoryEnum.options.includes(top)) return top;
  if (slug.startsWith("middleware/")) return "middleware";
  return "other";
}

function parseLlmsTxt(text) {
  const topics = [];
  let section = "";

  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }

    const match = line.match(/^- \[(.+?)\]\((https:\/\/hono\.dev\/docs\/.+?)\)(?::\s*(.*))?$/);
    if (!match) continue;

    const [, title, url, description = ""] = match;
    const slug = slugFromUrl(url);
    topics.push({
      title,
      url,
      slug,
      description,
      section,
      category: categoryFromSlug(slug),
    });
  }

  return topics;
}

async function loadTopics() {
  if (topicsCache) return topicsCache;

  const response = await fetch(LLMS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch llms.txt: ${response.status}`);
  }

  topicsCache = parseLlmsTxt(await response.text());
  return topicsCache;
}

function scoreTopic(topic, query) {
  const q = query.toLowerCase();
  const title = topic.title.toLowerCase();
  const slug = topic.slug.toLowerCase();
  const description = (topic.description || "").toLowerCase();
  const category = topic.category.toLowerCase();

  let score = 0;
  if (title.includes(q)) score += 10;
  if (slug.includes(q.replace(/\s+/g, "-"))) score += 8;
  if (description.includes(q)) score += 6;
  if (category.includes(q)) score += 3;

  for (const word of q.split(/\s+/).filter(Boolean)) {
    if (title.includes(word)) score += 4;
    if (slug.includes(word)) score += 3;
    if (description.includes(word)) score += 2;
    if (category.includes(word)) score += 1;
  }

  return score;
}

async function fetchDocContent(url) {
  const response = await fetch(url, {
    headers: { Accept: "text/markdown" },
  });

  if (!response.ok) {
    throw new Error(`Doc not found at ${url} (${response.status})`);
  }

  return await response.text();
}

const server = new McpServer({
  name: "hono",
  version: "1.0.0",
});

server.registerTool(
  "search_hono_docs",
  {
    title: "Search Hono Docs",
    description:
      "Search official Hono framework documentation. Returns titles, URLs, and categories.",
    inputSchema: {
      query: z.string().describe("Search query, e.g. 'JWT middleware' or 'Cloudflare Workers'"),
      category: categoryEnum
        .optional()
        .describe(
          "Filter by category: getting-started, middleware, helpers, guides, concepts, api",
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe("Max results (default 10, max 50)"),
    },
  },
  async ({ query, category, limit }) => {
    try {
      let topics = await loadTopics();
      if (category) {
        topics = topics.filter((t) => t.category === category);
      }

      const results = topics
        .map((topic) => ({ topic, score: scoreTopic(topic, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No matches for "${query}"${category ? ` in ${category}` : ""}. Try broader terms or a different category.`,
            },
          ],
        };
      }

      const text = results
        .map(({ topic }, i) => {
          const desc = topic.description ? `\n   ${topic.description}` : "";
          return `${i + 1}. [${topic.category}] ${topic.title}\n   Slug: ${topic.slug}${desc}\n   URL: ${topic.url}`;
        })
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} matches for "${query}":\n\n${text}`,
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
  "fetch_hono_doc",
  {
    title: "Fetch Hono Doc",
    description:
      "Fetch Markdown content for a Hono documentation page. Use search_hono_docs first to find the URL or slug.",
    inputSchema: {
      url: z
        .string()
        .optional()
        .describe("Full doc URL from search results"),
      slug: z
        .string()
        .optional()
        .describe("Doc slug, e.g. 'getting-started/cloudflare-workers' or 'middleware/builtin/jwt'"),
    },
  },
  async ({ url, slug }) => {
    try {
      const docUrl = url ?? `${DOCS_BASE}/${slug}`;
      const content = await fetchDocContent(docUrl);

      return {
        content: [
          {
            type: "text",
            text: `URL: ${docUrl}\n\n---\n\n${content}`,
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
  "list_hono_topics",
  {
    title: "List Hono Doc Topics",
    description: "List indexed Hono documentation topics, optionally filtered by category.",
    inputSchema: {
      category: categoryEnum
        .optional()
        .describe("Filter by category: getting-started, middleware, helpers, guides, concepts, api"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .default(50)
        .describe("Max topics to return (default 50, max 200)"),
    },
  },
  async ({ category, limit }) => {
    try {
      let topics = await loadTopics();
      if (category) {
        topics = topics.filter((t) => t.category === category);
      }

      const slice = topics.slice(0, limit);
      const text = slice
        .map((t) => `• [${t.category}] ${t.title} (${t.slug})`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `${topics.length} topics${category ? ` in ${category}` : ""} (showing ${slice.length}):\n\n${text}`,
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
