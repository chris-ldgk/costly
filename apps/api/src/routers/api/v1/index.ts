import { Hono } from "hono";
import type { ApiBindings } from "../../../utils/bindings";
import type { Lib } from "../../../utils/lib";
import {
  requireSession,
  sessionMiddleware,
} from "../../../middlewares/session";
import { purchasesRouter } from "./purchases";
import { balanceRouter } from "./balance";
import { settlementsRouter } from "./settlements";

export const v1Router = new Hono<{
  Bindings: ApiBindings;
  Variables: { lib: Lib };
}>()
  .use(sessionMiddleware)
  .use(requireSession)
  .route("/purchases", purchasesRouter)
  .route("/balance", balanceRouter)
  .route("/settlements", settlementsRouter);
