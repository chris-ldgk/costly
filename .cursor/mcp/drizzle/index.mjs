import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const LLMS_URL = "https://orm.drizzle.team/llms.txt";
const DOCS_BASE = "https://orm.drizzle.team/docs";
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/drizzle-team/drizzle-orm-docs/main/src/content/docs";

let topicsCache = null;

function parseLlmsTxt(text) {
  const topics = [];
  let section = "";

  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }

    const match = line.match(/^- \[(.+?)\]\((https:\/\/orm\.drizzle\.team\/docs\/(.+?))\)/);
    if (!match) continue;

    const [, title, url, slug] = match;
    topics.push({ title, url, slug, section });
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
  const section = topic.section.toLowerCase();

  let score = 0;
  if (title.includes(q)) score += 10;
  if (slug.includes(q)) score += 8;
  if (section.includes(q)) score += 3;

  for (const word of q.split(/\s+/).filter(Boolean)) {
    if (title.includes(word)) score += 4;
    if (slug.includes(word)) score += 3;
    if (section.includes(word)) score += 1;
  }

  return score;
}

async function fetchDocContent(slug) {
  const mdxUrl = `${GITHUB_RAW_BASE}/${slug}.mdx`;
  const response = await fetch(mdxUrl);

  if (response.ok) {
    return { source: "github", content: await response.text() };
  }

  const pageUrl = `${DOCS_BASE}/${slug}`;
  const pageResponse = await fetch(pageUrl);
  if (!pageResponse.ok) {
    throw new Error(`Doc not found for slug "${slug}" (tried MDX and HTML)`);
  }

  const html = await pageResponse.text();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? slug;

  return {
    source: "html",
    content: `# ${title}\n\nURL: ${pageUrl}\n\nFetched HTML page (MDX source unavailable). Use Context7 or the hosted drizzle-docs MCP for richer content.`,
  };
}

const server = new McpServer({
  name: "drizzle",
  version: "1.0.0",
});

server.registerTool(
  "search_drizzle_docs",
  {
    title: "Search Drizzle ORM Docs",
    description:
      "Search official Drizzle ORM documentation (ORM, Kit, migrations, relations, validations). Returns titles, URLs, and sections.",
    inputSchema: {
      query: z.string().describe("Search query, e.g. 'postgres schema' or 'drizzle kit migrate'"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe("Max results (default 10, max 50)"),
    },
  },
  async ({ query, limit }) => {
    try {
      const topics = await loadTopics();
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
              text: `No matches for "${query}". Try broader terms like "migrations", "relations", "postgres", or "drizzle kit".`,
            },
          ],
        };
      }

      const text = results
        .map(({ topic }, i) => {
          return `${i + 1}. ${topic.title}\n   Slug: ${topic.slug}\n   Section: ${topic.section || "general"}\n   URL: ${topic.url}`;
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
  "fetch_drizzle_doc",
  {
    title: "Fetch Drizzle ORM Doc",
    description:
      "Fetch documentation content for a Drizzle ORM page. Use search_drizzle_docs first to find the slug.",
    inputSchema: {
      slug: z
        .string()
        .describe(
          "Doc slug from search results, e.g. 'overview', 'drizzle-config-file', 'pg/kit-overview'",
        ),
    },
  },
  async ({ slug }) => {
    try {
      const { source, content } = await fetchDocContent(slug);
      const url = `${DOCS_BASE}/${slug}`;

      return {
        content: [
          {
            type: "text",
            text: `URL: ${url}\nSource: ${source}\n\n---\n\n${content}`,
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
  "list_drizzle_topics",
  {
    title: "List Drizzle ORM Topics",
    description:
      "List all indexed Drizzle ORM documentation topics from orm.drizzle.team/llms.txt.",
    inputSchema: {
      section: z
        .string()
        .optional()
        .describe("Optional section filter, e.g. 'Migrations', 'pg/Fundamentals'"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .default(50)
        .describe("Max topics to return (default 50, max 200)"),
    },
  },
  async ({ section, limit }) => {
    try {
      let topics = await loadTopics();
      if (section) {
        const filter = section.toLowerCase();
        topics = topics.filter((t) => t.section.toLowerCase().includes(filter));
      }

      const slice = topics.slice(0, limit);
      const text = slice
        .map((t) => `• ${t.title} (${t.slug}) — ${t.section || "general"}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `${topics.length} topics${section ? ` in section matching "${section}"` : ""} (showing ${slice.length}):\n\n${text}`,
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
