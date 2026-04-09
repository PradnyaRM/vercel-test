// In-memory history store — resets on server cold-start.
// Replace global._deployHistory with a real database (e.g. Vercel Postgres) for production.
if (!global._deployHistory) global._deployHistory = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ deployments: global._deployHistory });
  }
  if (req.method === 'DELETE') {
    global._deployHistory.length = 0;
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
