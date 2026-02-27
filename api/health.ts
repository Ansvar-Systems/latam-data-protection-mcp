import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    server: 'latam-data-protection-mcp',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
