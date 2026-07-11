import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import type { Router } from "express";

import { APP_ROUTES } from "@/constants/routes.js";
import { snapshotsQueue } from "@/modules/cryptotokens/cryptotokens.queue.js";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath(APP_ROUTES.adminQueues);

createBullBoard({
  queues: [new BullMQAdapter(snapshotsQueue)],
  serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter() as Router;
