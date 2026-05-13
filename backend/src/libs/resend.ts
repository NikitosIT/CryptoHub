import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is required");
}

if (!resendFrom) {
  throw new Error("RESEND_FROM is required");
}

export const resend = new Resend(resendApiKey);
export const resendEmailFrom = resendFrom;
