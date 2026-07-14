import { createApiClientWithCredentials } from "@costly/api-client";
import { publicEnv } from "#/utils/env.ts";

export const apiClient = createApiClientWithCredentials(publicEnv.VITE_API_URL);
