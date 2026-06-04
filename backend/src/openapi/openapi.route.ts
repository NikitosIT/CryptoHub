import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { ROUTE_SEGMENTS } from "@/constants/routes.js";
import { generateOpenApiDocument } from "./document.js";

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.get(ROUTE_SEGMENTS.openApiJson, (_req, res) => {
  return res.json(openApiDocument);
});

router.use(
  ROUTE_SEGMENTS.root,
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "CryptoHub API Docs",
    swaggerOptions: {
      docExpansion: "list",
      persistAuthorization: true,
      filter: true,
    },
  }),
);

export default router;
