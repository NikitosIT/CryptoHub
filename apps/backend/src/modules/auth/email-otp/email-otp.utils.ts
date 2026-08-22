import { OTP_TTL_MINUTES } from "./email-otp.constants.js";

export const buildOtpEmailHtml = (otp: string) => `
  <h1>Your sign-in code</h1>
  <p>Use this one-time code to sign in to your CryptoHub account.</p>
  <h2 style="letter-spacing: 8px;">${otp}</h2>
  <p>The code expires in ${OTP_TTL_MINUTES} minutes.</p>
`;
// для 1 письма тянуть зависимость npm install react-email @react-email/components не уверен что надо
