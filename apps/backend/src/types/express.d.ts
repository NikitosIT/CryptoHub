import type { Logger } from "pino";

import type { auth } from "@/libs/auth.js";

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

declare global {
  namespace Express {
    interface Request {
      log: Logger;
      requestId: string;
      session?: AuthSession["session"];
      user?: AuthSession["user"];
    }
  }
}

export {};
