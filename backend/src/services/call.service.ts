import { config } from '../config/index';

export const makeCall = async (phone: string, script: string) => {
  if (!config.twilio.accountSid || !config.twilio.authToken) {
    throw new Error('Twilio credentials are missing. Please configure them in the .env file.');
  }

  const auth = Buffer.from(`${config.twilio.accountSid}:${config.twilio.authToken}`).toString('base64');

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.twilio.accountSid}/Calls.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: config.twilio.phoneNumber!,
        Twiml: `<Response><Say voice="alice">${script}</Say></Response>`,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error: ${error}`);
  }

  return response.json();
};