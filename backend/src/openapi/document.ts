import "./register-modules.js";

import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { openApiRegistry } from "./registry.js";

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "CryptoHub API",
      version: "1.0.0",
      description: "OpenAPI documentation generated from Zod schemas.",
    },
    servers: [
      {
        url: "/api",
        description: "Application API root",
      },
    ],
  });
}
