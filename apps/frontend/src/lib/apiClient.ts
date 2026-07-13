import { publicEnv } from "#/utils/env.ts";
import { createApiClient } from "@costly/api-client";

// HTTP API Client - use ONLY when we really need to fetch from the client side. Use server functions otherwise.
export const apiClient = createApiClient(publicEnv.VITE_API_URL);
