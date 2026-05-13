import { openApiRegistry } from "../../openapi/registry.js";

import { healthResponseSchema } from "./health.schema.js";

const healthSchema = openApiRegistry.register(
  "HealthResponse",
  healthResponseSchema,
);

openApiRegistry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Health check",
  description: "Returns the health status of the service and its dependencies.",
  responses: {
    200: {
      description: "All dependencies are healthy.",
      content: {
        "application/json": {
          schema: healthSchema,
        },
      },
    },
    503: {
      description: "One or more dependencies are unhealthy.",
      content: {
        "application/json": {
          schema: healthSchema,
        },
      },
    },
  },
});
