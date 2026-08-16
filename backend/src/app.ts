import express from 'express';
import cors from 'cors';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Service status check
import { config } from './config/index';
console.log('--- Service Status ---');
console.log(`Twilio: ${config.twilio.accountSid ? '✅ Configured' : '❌ Missing'}`);
console.log(`Resend: ${config.resend.apiKey ? '✅ Configured' : '❌ Missing'}`);
console.log('----------------------');

// Error Handler
app.use(errorHandler);

export default app;
