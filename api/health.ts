import type { Request, Response } from 'express';
import { handleHealth } from '../server';

export default function handler(req: Request, res: Response) {
  return handleHealth(req, res);
}
