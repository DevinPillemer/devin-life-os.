export default async function handler(req, res) {
  const dbId = process.env.VITE_NOTION_DATABASE_ID
  const token = process.env.VITE_NOTION_API_TOKEN

  if (!dbId || !token) {
    return res.status(500).json({ message: 'Missing Notion environment configuration.' })
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body || {})
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch from Notion API.' })
  }
}
