import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as emailService from '../services/email.service';

export const handleEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, subject, html } = z.object({
      to: z.string().email(),
      subject: z.string(),
      html: z.string(),
    }).parse(req.body);

    const result = await emailService.sendEmail(to, subject, html);
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};
