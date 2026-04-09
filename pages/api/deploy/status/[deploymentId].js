export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { deploymentId } = req.query;
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

  if (!VERCEL_TOKEN) {
    return res.status(500).json({ error: 'VERCEL_TOKEN not configured' });
  }

  try {
    const r = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data.error?.message || 'Failed to fetch deployment' });
    }
    return res.status(200).json({
      id: data.id,
      status: data.readyState,   // QUEUED | BUILDING | READY | ERROR | CANCELED
      url: data.url ? `https://${data.url}` : null,
      createdAt: data.createdAt,
      buildingAt: data.buildingAt,
      ready: data.ready,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
