import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, twoFactor } from "better-auth/plugins";

import { getConfiguredOrigins } from "../middleware/corsMiddleware.js";
import { sendAuthOtpEmail } from "../modules/auth/email-otp/email-otp.service.js";
import { prisma } from "./db.js";

const origins = getConfiguredOrigins();

export const auth = betterAuth({
  appName: "CryptoHub",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: origins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            await sendAuthOtpEmail({ email, otp });
            break;

          default:
            throw new Error(`Unsupported email OTP type: ${type}`);
        }
      },
    }),
    twoFactor({ allowPasswordless: true }),
  ],
});
