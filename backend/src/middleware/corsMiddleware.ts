import cors from "cors";

import { env } from "@/config/env.js";

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];

export const getConfiguredOrigins = () => {
  const raw = env.ALLOWED_ORIGINS;

  if (!raw) {
    return defaultOrigins;
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  ];
};

const allowedOrigins = new Set(getConfiguredOrigins());

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["authorization", "x-client-info", "apikey", "content-type"],
});
