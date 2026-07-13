import { eq } from "drizzle-orm";
import { parseAllowedUsers } from "../auth/allowed-users";
import type { Lib } from "../utils/lib";

export async function seedUsers(lib: Lib) {
  const allowedUsers = parseAllowedUsers(lib.env.ALLOWED_USERS);

  for (const allowedUser of allowedUsers) {
    const [existing] = await lib.db
      .select()
      .from(lib.schema.user)
      .where(eq(lib.schema.user.email, allowedUser.email))
      .limit(1);

    if (!existing) {
      await lib.db.insert(lib.schema.user).values({
        id: crypto.randomUUID(),
        name: allowedUser.name,
        email: allowedUser.email,
        emailVerified: true,
      });
      console.log(`[seed] Created user: ${allowedUser.email}`);
    }
  }
}
