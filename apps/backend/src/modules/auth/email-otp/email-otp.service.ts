import { logger } from "../../../libs/logger.js";
import { resend, resendEmailFrom } from "../../../libs/resend.js";
import { SIGN_IN_EMAIL_SUBJECT } from "./email-otp.constants.js";
import { buildOtpEmailHtml } from "./email-otp.utils.js";

type SendAuthOtpEmailParams = {
  email: string;
  otp: string;
};

export async function sendOtp({
  email,
  otp,
}: SendAuthOtpEmailParams): Promise<void> {
  const { data, error } = await resend.emails.send({
    from: resendEmailFrom,
    to: email,
    subject: SIGN_IN_EMAIL_SUBJECT,
    text: `Your CryptoHub sign-in code is ${otp}.`,
    html: buildOtpEmailHtml(otp),
  });

  if (error) {
    logger.error(
      {
        email,
        provider: "resend",
        error,
      },
      "Failed to send OTP email",
    );

    throw new Error("Failed to send OTP email");
  }

  logger.info(
    {
      email,
      provider: "resend",
      emailId: data?.id ?? null,
    },
    "OTP email sent successfully",
  );
}
export const authEmailService = {
  sendOtp,
};
