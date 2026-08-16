import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.EMAIL_FROM || "TradeConnect AI <onboarding@resend.dev>",
  },
};
