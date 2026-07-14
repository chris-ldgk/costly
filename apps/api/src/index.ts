import { WorkerEntrypoint } from "cloudflare:workers";
import { appRouter } from "./routers";
import { getLib } from "./utils/lib";
import type { ApiBindings } from "./utils/bindings";
import { createAuth } from "./auth";
import {
  createPurchase,
  deletePurchase,
  getBalance,
  getPurchase,
  getPurchases,
  settleAllPurchases,
  updatePurchase,
} from "./handlers/purchases";
import { seedUsers } from "./handlers/seed-users";
import type { CreatePurchaseInput, PurchaseListQuery, UpdatePurchaseInput } from "./schema";

export default {
  fetch: appRouter.fetch,
  scheduled(_controller, env, ctx) {
    const lib = getLib(env as unknown as ApiBindings);
    ctx.waitUntil(
      seedUsers(lib).catch((err: unknown) => {
        console.error("[seed] Failed to seed users", err);
      }),
    );
  },
} satisfies ExportedHandler<CloudflareBindings>;

export class FrontendEntrypoint extends WorkerEntrypoint {
  private createLib() {
    // RPC runs on the API worker; the frontend worker's env type is unrelated.
    return getLib(this.env as unknown as ApiBindings);
  }

  async getSession(cookieHeader: string | null) {
    const lib = this.createLib();
    const auth = createAuth(lib);
    const headers = new Headers();
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }
    const session = await auth.api.getSession({ headers });
    return session;
  }

  async createPurchase(userId: string, input: CreatePurchaseInput) {
    const lib = this.createLib();
    return createPurchase(lib, userId, input);
  }

  async getPurchases(query: PurchaseListQuery) {
    const lib = this.createLib();
    return getPurchases(lib, query);
  }

  async getPurchase(purchaseId: string) {
    const lib = this.createLib();
    return getPurchase(lib, purchaseId);
  }

  async updatePurchase(purchaseId: string, input: UpdatePurchaseInput) {
    const lib = this.createLib();
    return updatePurchase(lib, purchaseId, input);
  }

  async deletePurchase(purchaseId: string) {
    const lib = this.createLib();
    return deletePurchase(lib, purchaseId);
  }

  async getBalance() {
    const lib = this.createLib();
    return getBalance(lib);
  }

  async settleAllPurchases(userId: string) {
    const lib = this.createLib();
    return settleAllPurchases(lib, userId);
  }
}
