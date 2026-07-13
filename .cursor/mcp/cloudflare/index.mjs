import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const PRODUCTS = {
  workers: {
    name: "Cloudflare Workers",
    llmsUrl: "https://developers.cloudflare.com/workers/llms.txt",
    docsBase: "https://developers.cloudflare.com/workers",
  },
  r2: {
    name: "Cloudflare R2",
    llmsUrl: "https://developers.cloudflare.com/r2/llms.txt",
    docsBase: "https://developers.cloudflare.com/r2",
  },
  d1: {
    name: "Cloudflare D1",
    llmsUrl: "https://developers.cloudflare.com/d1/llms.txt",
    docsBase: "https://developers.cloudflare.com/d1",
  },
  hyperdrive: {
    name: "Cloudflare Hyperdrive",
    llmsUrl: "https://developers.cloudflare.com/hyperdrive/llms.txt",
    docsBase: "https://developers.cloudflare.com/hyperdrive",
  },
  kv: {
    name: "Cloudflare KV",
    llmsUrl: "https://developers.cloudflare.com/kv/llms.txt",
    docsBase: "https://developers.cloudflare.com/kv",
  },
  ai: {
    name: "Cloudflare AI / Workers AI",
    llmsUrl: "https://developers.cloudflare.com/ai/llms.txt",
    docsBase: "https://developers.cloudflare.com/ai",
  },
  "ai-gateway": {
    name: "Cloudflare AI Gateway",
    llmsUrl: "https://developers.cloudflare.com/ai-gateway/llms.txt",
    docsBase: "https://developers.cloudflare.com/ai-gateway",
  },
  stream: {
    name: "Cloudflare Stream",
    llmsUrl: "https://developers.cloudflare.com/stream/llms.txt",
    docsBase: "https://developers.cloudflare.com/stream",
  },
  images: {
    name: "Cloudflare Images",
    llmsUrl: "https://developers.cloudflare.com/images/llms.txt",
    docsBase: "https://developers.cloudflare.com/images",
  },
};

const productEnum = z.enum([
  "workers",
  "r2",
  "d1",
  "hyperdrive",
  "kv",
  "ai",
  "ai-gateway",
  "stream",
  "images",
]);

const topicsCache = new Map();

function parseLlmsTxt(text, product) {
  const topics = [];
  let section = "";

  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }

    const match = line.match(
      /^- \[(.+?)\]\((https:\/\/developers\.cloudflare\.com\/.+?\.md)\)(?::\s*(.*))?$/,
    );
    if (!match) continue;

    const [, title, url, description = ""] = match;
    topics.push({ title, url, description, section, product });
  }

  return topics;
}

async function loadProductTopics(product) {
  if (topicsCache.has(product)) return topicsCache.get(product);

  const config = PRODUCTS[product];
  const response = await fetch(config.llmsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${product} llms.txt: ${response.status}`);
  }

  const topics = parseLlmsTxt(await response.text(), product);
  topicsCache.set(product, topics);
  return topics;
}

async function loadAllTopics(products) {
  const selected = products?.length ? products : Object.keys(PRODUCTS);
  const all = [];

  for (const product of selected) {
    all.push(...(await loadProductTopics(product)));
  }

  return all;
}

function scoreTopic(topic, query) {
  const q = query.toLowerCase();
  const title = topic.title.toLowerCase();
  const description = (topic.description || "").toLowerCase();
  const section = topic.section.toLowerCase();
  const url = topic.url.toLowerCase();

  let score = 0;
  if (title.includes(q)) score += 10;
  if (description.includes(q)) score += 6;
  if (section.includes(q)) score += 3;
  if (url.includes(q.replace(/\s+/g, "-"))) score += 4;

  for (const word of q.split(/\s+/).filter(Boolean)) {
    if (title.includes(word)) score += 4;
    if (description.includes(word)) score += 2;
    if (section.includes(word)) score += 1;
    if (url.includes(word)) score += 2;
  }

  return score;
}

async function fetchDocContent(url) {
  const mdResponse = await fetch(url);
  if (mdResponse.ok) {
    return { source: "markdown", content: await mdResponse.text() };
  }

  const pageUrl = url.replace(/\/index\.md$/, "/").replace(/\.md$/, "/");
  const pageResponse = await fetch(pageUrl, {
    headers: { Accept: "text/markdown" },
  });

  if (pageResponse.ok) {
    return { source: "markdown-header", content: await pageResponse.text() };
  }

  throw new Error(`Doc not found at ${url}`);
}

const server = new McpServer({
  name: "cloudflare",
  version: "1.0.0",
});

server.registerTool(
  "search_cloudflare_docs",
  {
    title: "Search Cloudflare Docs",
    description:
      "Search official Cloudflare documentation for Workers, R2, D1, Hyperdrive, KV, AI, AI Gateway, Stream, and Images.",
    inputSchema: {
      query: z.string().describe("Search query, e.g. 'R2 bucket binding' or 'D1 migrations'"),
      product: productEnum
        .optional()
        .describe(
          "Filter to a product: workers, r2, d1, hyperdrive, kv, ai, ai-gateway, stream, images",
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
  async ({ query, product, limit }) => {
    try {
      const topics = await loadAllTopics(product ? [product] : undefined);
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
              text: `No matches for "${query}"${product ? ` in ${product}` : ""}. Try broader terms or a different product filter.`,
            },
          ],
        };
      }

      const text = results
        .map(({ topic }, i) => {
          const desc = topic.description ? `\n   ${topic.description}` : "";
          return `${i + 1}. [${topic.product}] ${topic.title}\n   Section: ${topic.section || "general"}${desc}\n   URL: ${topic.url}`;
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
  "fetch_cloudflare_doc",
  {
    title: "Fetch Cloudflare Doc",
    description:
      "Fetch Markdown content for a Cloudflare documentation page. Use search_cloudflare_docs first to find the URL.",
    inputSchema: {
      url: z
        .string()
        .describe(
          "Doc URL from search results, e.g. 'https://developers.cloudflare.com/workers/index.md'",
        ),
    },
  },
  async ({ url }) => {
    try {
      const { source, content } = await fetchDocContent(url);

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
  "list_cloudflare_products",
  {
    title: "List Cloudflare Products",
    description: "List supported Cloudflare products and their documentation base URLs.",
    inputSchema: {},
  },
  async () => {
    const text = Object.entries(PRODUCTS)
      .map(([id, config]) => `• ${id} — ${config.name}\n  Docs: ${config.docsBase}`)
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Supported products:\n\n${text}`,
        },
      ],
    };
  },
);

server.registerTool(
  "list_cloudflare_topics",
  {
    title: "List Cloudflare Doc Topics",
    description: "List indexed documentation topics for a Cloudflare product.",
    inputSchema: {
      product: productEnum.describe(
        "Product to list: workers, r2, d1, hyperdrive, kv, ai, ai-gateway, stream, images",
      ),
      section: z.string().optional().describe("Optional section filter"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .default(50)
        .describe("Max topics to return (default 50, max 200)"),
    },
  },
  async ({ product, section, limit }) => {
    try {
      let topics = await loadProductTopics(product);
      if (section) {
        const filter = section.toLowerCase();
        topics = topics.filter((t) => t.section.toLowerCase().includes(filter));
      }

      const slice = topics.slice(0, limit);
      const text = slice
        .map((t) => `• ${t.title}\n  ${t.url}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `${topics.length} topics for ${product}${section ? ` matching "${section}"` : ""} (showing ${slice.length}):\n\n${text}`,
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
