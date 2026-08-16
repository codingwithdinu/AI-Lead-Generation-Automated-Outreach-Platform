import { config } from '../config/index';

const resend = config.resend.apiKey ? {
  apiKey: config.resend.apiKey,
  fromEmail: config.resend.fromEmail,
} : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!resend) {
    throw new Error('Resend API key is missing. Please configure it in the .env file.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resend.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resend.fromEmail,
      to,
      subject,
      html: `<div style="font-family: Arial; line-height:1.6">${html.replace(/\n/g, "<br>")}</div>`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
};