import type { Request, Response } from 'express';
import app, { handleHealth } from '../server';

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET' && (!req.url || req.url === '/' || req.url === '/api')) {
    return handleHealth(req, res);
  }
  return app(req, res);
}
