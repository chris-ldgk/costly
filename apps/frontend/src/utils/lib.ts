import { publicEnv, secretEnvSchema } from "./env";

export function getLib(cfEnv: CloudflareBindings) {
  const secretEnv = secretEnvSchema.parse(cfEnv);
  const api = cfEnv.API;

  return {
    api,
    secretEnv,
    publicEnv,
  };
}

export type Lib = ReturnType<typeof getLib>;
