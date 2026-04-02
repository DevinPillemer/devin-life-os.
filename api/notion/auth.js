module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const redirectUri = process.env.NOTION_REDIRECT_URI || `${req.headers.origin || 'http://localhost:3000'}/api/notion/callback`

  if (!clientId) {
    return res.status(500).json({
      error: 'NOTION_CLIENT_ID not configured',
      setup: 'Create a Notion integration at https://www.notion.so/my-integrations and set NOTION_CLIENT_ID in your environment variables.',
    })
  }

  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`

  return res.status(200).json({
    authUrl,
    redirectUri,
  })
}
