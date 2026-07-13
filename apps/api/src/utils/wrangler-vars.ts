import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

type WranglerVars = Record<string, string>;

/** Read public vars from wrangler.jsonc for local scripts (auth CLI). */
export function getWranglerVars(): WranglerVars {
  const configPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "../../wrangler.jsonc",
  );
  const raw = readFileSync(configPath, "utf8");
  const json = raw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1");
  const config = JSON.parse(json) as { vars?: WranglerVars };
  return config.vars ?? {};
}

/** Merge .env secrets with wrangler.jsonc public vars for local scripts. */
export function getScriptEnv(): Record<string, string | undefined> {
  return {
    ...getWranglerVars(),
    ...process.env,
  };
}
