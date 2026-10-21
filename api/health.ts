export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      appName: 'Global Vantage Sourcing Assistant',
      version: '1.0.0',
      geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    })
  );
}
