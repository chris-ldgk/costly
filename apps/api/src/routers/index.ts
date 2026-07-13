import { Hono } from "hono";
import { apiRouter } from "./api";

export const appRouter = new Hono().route("/api", apiRouter);

export type AppRouter = typeof appRouter;
