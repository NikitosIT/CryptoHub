import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, twoFactor } from "better-auth/plugins";

import { env } from "@/config/env.js";
import { authEmailService } from "@/modules/auth/email-otp/email-otp.service.js";

import { getConfiguredOrigins } from "../middleware/corsMiddleware.js";
import { prisma } from "./db.js";

const origins = getConfiguredOrigins();
const APP_NAME = "CryptoHub";

export const auth = betterAuth({
  appName: APP_NAME,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: origins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      rateLimit: {
        window: 60,
        max: 3,
      },
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            await authEmailService.sendOtp({ email, otp });
            break;

          default:
            throw new Error(`Unsupported email OTP type: ${type}`);
        }
      },
    }),
    twoFactor({ allowPasswordless: true }),
  ],
});
