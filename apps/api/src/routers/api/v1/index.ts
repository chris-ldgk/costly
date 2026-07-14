import { Hono } from "hono";
import { purchasesRouter } from "./purchases";

export const v1Router = new Hono().route("/", purchasesRouter);

export type V1Router = typeof v1Router;
