import { writeFile } from "node:fs/promises";
import path from "node:path";

import { generateOpenApiDocument } from "./document.js";

async function writeOpenApiDocument() {
  const outputPath = path.resolve(process.cwd(), "openapi.json");
  const document = generateOpenApiDocument();

  await writeFile(outputPath, JSON.stringify(document, null, 2));
}

void writeOpenApiDocument();
