---
name: cloudflare-docs
description: Search Cloudflare Workers, R2, D1, Hyperdrive, KV, AI, AI Gateway, Stream, and Images documentation. Use when working with Cloudflare platform products, bindings, or wrangler configuration.
---

When the user asks about Cloudflare products, use current documentation instead of training data.

## MCP tools (preferred)

### Official `cloudflare-docs` server

- `search_cloudflare_documentation` — semantic search across all Cloudflare docs

### Local `cloudflare` server (fallback)

1. `search_cloudflare_docs` — search with optional `product` filter
2. `fetch_cloudflare_doc` — fetch Markdown by URL
3. `list_cloudflare_topics` — browse topics for a product
4. `list_cloudflare_products` — list supported products

Always search before fetching. Fetch the top 1–2 most relevant pages.

## Context7 fallback

| Product | Context7 library ID |
| --- | --- |
| Workers | `/websites/developers_cloudflare_workers` |
| R2 | `/websites/developers_cloudflare_r2` |
| D1 | `/llmstxt/developers_cloudflare_d1_llms-full_txt` |
| Hyperdrive | `/websites/developers_cloudflare_hyperdrive` |
| KV | `/llmstxt/developers_cloudflare_kv_llms_txt` |
| AI / Workers AI | `/llmstxt/developers_cloudflare_workers-ai_llms-full_txt` |
| AI Gateway | `/llmstxt/developers_cloudflare_ai-gateway_llms-full_txt` |
| Stream | `/llmstxt/developers_cloudflare_stream_llms-full_txt` |
| Images | `/websites/developers_cloudflare_images` |

Call `resolve-library-id` first if unsure, then `query-docs`.

## Direct fallback

```bash
curl -s https://developers.cloudflare.com/<product>/llms.txt
curl -sH "Accept: text/markdown" https://developers.cloudflare.com/<product>/
```

## Product filters

`workers`, `r2`, `d1`, `hyperdrive`, `kv`, `ai`, `ai-gateway`, `stream`, `images`

Use the product filter when the user mentions a specific Cloudflare service.
