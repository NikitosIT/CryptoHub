import crypto from "crypto";

export const API_KEY = crypto.randomBytes(32).toString("hex");
