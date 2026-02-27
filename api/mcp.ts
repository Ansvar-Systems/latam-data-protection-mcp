import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel serverless endpoint — Streamable HTTP MCP transport.
 *
 * This is a deployment stub. The full implementation follows the standard
 * Vercel MCP pattern: receive JSON-RPC requests, route to the MCP server,
 * and stream responses back.
 *
 * Deployment:
 *   1. Set LATAM_DATA_PROTECTION_DB_PATH env var in Vercel
 *   2. Deploy: vercel --prod
 *   3. Endpoint: https://<project>.vercel.app/api/mcp
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      name: 'latam-data-protection-mcp',
      version: '0.1.0',
      transport: 'streamable-http',
      status: 'stub — full implementation pending deployment',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // TODO: Wire up createServer() and handle JSON-RPC MCP requests
  res.status(501).json({ error: 'Not yet implemented — deploy with full MCP handler' });
}
