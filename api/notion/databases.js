const { Client } = require('@notionhq/client')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const token = req.headers.authorization?.replace('Bearer ', '') || process.env.NOTION_API_KEY

  if (!token) {
    return res.status(401).json({ error: 'No Notion token provided' })
  }

  try {
    const notion = new Client({ auth: token })

    const response = await notion.search({
      filter: { property: 'object', value: 'database' },
      page_size: 50,
    })

    const databases = response.results.map(db => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
      icon: db.icon?.emoji || db.icon?.external?.url || null,
      url: db.url,
      properties: Object.keys(db.properties),
      createdTime: db.created_time,
    }))

    return res.status(200).json({
      success: true,
      count: databases.length,
      databases,
    })
  } catch (err) {
    console.error('Notion databases error:', err)
    return res.status(500).json({ error: err.message })
  }
}
