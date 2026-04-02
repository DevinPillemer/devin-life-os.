module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { code } = req.query

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' })
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET
  const redirectUri = process.env.NOTION_REDIRECT_URI || `${req.headers.origin || 'http://localhost:3000'}/api/notion/callback`

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'NOTION_CLIENT_ID and NOTION_CLIENT_SECRET must be configured' })
  }

  try {
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to exchange code for token',
        details: data,
      })
    }

    // In production, store token securely (database, encrypted cookie, etc.)
    // For now, return it to the frontend to store in-memory
    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      workspace_id: data.workspace_id,
      workspace_name: data.workspace_name,
      workspace_icon: data.workspace_icon,
      bot_id: data.bot_id,
      owner: data.owner,
    })
  } catch (err) {
    console.error('Notion OAuth callback error:', err)
    return res.status(500).json({ error: err.message })
  }
}
