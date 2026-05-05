import cors from "cors";

export const getAllowedOrigin = () => {
  const envRaw = process.env.ALLOWED_ORIGINS;

  if (!envRaw || envRaw === "*") return "*";
  const env = envRaw.split(",").map((o) => o.trim());

  return env;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowed = getAllowedOrigin();

    if (!origin) return callback(null, true);

    if (allowed === "*") return callback(null, true);

    if (Array.isArray(allowed) && allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["authorization", "x-client-info", "apikey", "content-type"],
});
