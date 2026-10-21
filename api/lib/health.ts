export function getHealthStatus() {
  return {
    status: 'ok',
    appName: 'Global Vantage Sourcing Assistant',
    version: '1.0.0',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
  };
}
