import type { Request, Response } from 'express';
import app, { handleParseDocument } from '../server';

export default async function handler(req: Request, res: Response) {
  // If Vercel already parsed the JSON request into req.body:
  if (req.body && (req.body.fileData || req.body.fileName)) {
    return handleParseDocument(req, res);
  }
  // Otherwise run through Express body-parser and routing
  return app(req, res);
}
