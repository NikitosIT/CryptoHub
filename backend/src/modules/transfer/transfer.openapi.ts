import { openApiRegistry } from "../../openapi/registry.js";

import {
  transferBodySchema,
  transferSuccessResponseSchema,
} from "./transfer.schema.js";

const transferRequestSchema = openApiRegistry.register(
  "TransferRequest",
  transferBodySchema,
);

const transferResponseSchema = openApiRegistry.register(
  "TransferSuccessResponse",
  transferSuccessResponseSchema,
);

openApiRegistry.registerPath({
  method: "post",
  path: "/transfer/send",
  tags: ["Transfer"],
  summary: "Transfer funds between cards",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: transferRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Transfer was completed successfully.",
      content: {
        "application/json": {
          schema: transferResponseSchema,
        },
      },
    },
  },
});
