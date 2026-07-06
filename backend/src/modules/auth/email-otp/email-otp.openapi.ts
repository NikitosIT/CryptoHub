import { API_ROUTE_SEGMENTS } from "@/constants/routes.js";

import { openApiRegistry } from "../../../openapi/registry.js";
import {
  sendEmailOtpBodySchema,
  sendEmailOtpResponseSchema,
  signInWithEmailOtpBodySchema,
  signInWithEmailOtpResponseSchema,
} from "./email-otp.schema.js";

const sendEmailOtpRequestSchema = openApiRegistry.register(
  "SendEmailOtpRequest",
  sendEmailOtpBodySchema,
);

const sendEmailOtpResultSchema = openApiRegistry.register(
  "SendEmailOtpResponse",
  sendEmailOtpResponseSchema,
);

const signInWithEmailOtpRequestSchema = openApiRegistry.register(
  "SignInWithEmailOtpRequest",
  signInWithEmailOtpBodySchema,
);

const signInWithEmailOtpResultSchema = openApiRegistry.register(
  "SignInWithEmailOtpResponse",
  signInWithEmailOtpResponseSchema,
);

openApiRegistry.registerPath({
  method: "post",
  path: `${API_ROUTE_SEGMENTS.auth}/email-otp/send-verification-otp`,
  tags: ["Auth"],
  summary: "Send sign-in OTP to email",
  description:
    "Generates a one-time password for the sign-in flow and sends it to the user's email address.",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: sendEmailOtpRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OTP email was accepted for delivery.",
      content: {
        "application/json": {
          schema: sendEmailOtpResultSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: `${API_ROUTE_SEGMENTS.auth}/sign-in/email-otp`,
  tags: ["Auth"],
  summary: "Confirm OTP and sign in",
  description:
    "Validates the email OTP, creates the user automatically if needed, and creates an authenticated session.",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: signInWithEmailOtpRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OTP was valid and the user has been signed in.",
      content: {
        "application/json": {
          schema: signInWithEmailOtpResultSchema,
        },
      },
    },
  },
});
