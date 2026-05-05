import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { generateOpenApiDocument } from "./document.js";

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.get("/openapi.json", (_req, res) => {
  return res.json(openApiDocument);
});

router.use(
  "/",
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
