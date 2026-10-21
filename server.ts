import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseDocument, DocumentParseError } from './api/lib/documentParser';
import { standardizeProcurement, fallbackHeuristicExtraction } from './api/lib/standardizer';
import { getHealthStatus } from './api/lib/health';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check handler
const handleHealth = (req: Request, res: Response) => {
  res.json(getHealthStatus());
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);
app.get('/api', handleHealth);

// Document parsing handler
const handleParseDocument = async (req: Request, res: Response) => {
  try {
    const { fileName, fileData } = req.body;
    const result = await parseDocument(fileName, fileData);
    return res.json(result);
  } catch (error: any) {
    const statusCode = error instanceof DocumentParseError ? error.statusCode : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Unknown error during document analysis',
    });
  }
};

app.post('/api/parse-document', handleParseDocument);
app.post('/parse-document', handleParseDocument);

// AI Standardization handler
const handleStandardize = async (req: Request, res: Response) => {
  try {
    const { rawText, contextInfo } = req.body;
    const result = await standardizeProcurement(rawText, contextInfo);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/standardize:', error);
    try {
      const fallback = fallbackHeuristicExtraction(req.body.rawText || '');
      return res.json({
        ...fallback,
        overallSummary: `AI standardizer encountered an error (${error.message || 'API error'}); used intelligent heuristic parser. Please review line items.`,
      });
    } catch (fallbackError: any) {
      return res.status(500).json({
        success: false,
        error: `Standardization failed: ${error.message || 'Unknown processing error'}`,
      });
    }
  }
};

app.post('/api/standardize', handleStandardize);
app.post('/standardize', handleStandardize);

// Start Express server and connect Vite in development (Local Windows environment)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Global Vantage Sourcing Assistant server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
