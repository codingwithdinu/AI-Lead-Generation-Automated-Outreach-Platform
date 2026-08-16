import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as callService from '../services/call.service';

export const handleCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, script } = z.object({
      phone: z.string(),
      script: z.string(),
    }).parse(req.body);

    const callResult: any = await callService.makeCall(phone, script);
    res.json({ success: true, callSid: callResult.sid });
  } catch (error) {
    next(error);
  }
};
