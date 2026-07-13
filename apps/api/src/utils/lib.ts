import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { envSchema } from "./env";
import { relations, schema } from "../schema";
import type { ApiBindings } from "./bindings";

export function getLib(cfEnv: ApiBindings) {
  const env = envSchema.parse(cfEnv);
  const kv = cfEnv.KV;
  const bucket = cfEnv.BUCKET;

  const sql = new Pool({
    connectionString: cfEnv.DB.connectionString,
  });
  const db = drizzle({ client: sql, relations });

  return {
    env,
    sql,
    db,
    schema,
    kv,
    bucket,
  };
}

export type Lib = ReturnType<typeof getLib>;
