const { Client } = require('@notionhq/client')

// Database schema definitions for each Floopify module
const SCHEMAS = {
  habits: {
    Name: { title: {} },
    Completed: { checkbox: {} },
    Date: { date: {} },
    Streak: { number: {} },
  },
  goals: {
    Title: { title: {} },
    Status: { select: { options: [{ name: 'To Do', color: 'default' }, { name: 'In Progress', color: 'blue' }, { name: 'Done', color: 'green' }] } },
    Progress: { number: {} },
    Category: { select: {} },
  },
  health: {
    Date: { date: {} },
    'Sleep Score': { number: {} },
    Exercise: { number: {} },
    Nutrition: { number: {} },
    Hydration: { number: {} },
  },
  transactions: {
    Description: { title: {} },
    Date: { date: {} },
    Category: { select: { options: [{ name: 'Income', color: 'green' }, { name: 'Investment', color: 'blue' }, { name: 'Crypto', color: 'purple' }, { name: 'Expense', color: 'red' }] } },
    Amount: { number: { format: 'dollar' } },
  },
  learning: {
    Course: { title: {} },
    Progress: { number: {} },
    XP: { number: {} },
    Category: { select: { options: [{ name: 'Development', color: 'blue' }, { name: 'Design', color: 'pink' }, { name: 'Business', color: 'green' }, { name: 'AI', color: 'purple' }] } },
  },
}

function getNotionClient(token) {
  return new Client({ auth: token })
}

// Read data from a Notion database
async function readDatabase(notion, databaseId) {
  const pages = []
  let cursor = undefined

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    })
    pages.push(...response.results)
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  return pages
}

// Transform Notion pages to Floopify format
function notionToFloopify(pages, module) {
  return pages.map(page => {
    const props = page.properties
    switch (module) {
      case 'habits':
        return {
          name: props.Name?.title?.[0]?.plain_text || '',
          completedToday: props.Completed?.checkbox || false,
          date: props.Date?.date?.start || null,
          streak: props.Streak?.number || 0,
          notionId: page.id,
        }
      case 'goals':
        return {
          title: props.Title?.title?.[0]?.plain_text || '',
          column: (props.Status?.select?.name || 'To Do').toLowerCase().replace(' ', '-').replace('to-do', 'todo'),
          progress: props.Progress?.number || 0,
          category: props.Category?.select?.name || '',
          notionId: page.id,
        }
      case 'health':
        return {
          date: props.Date?.date?.start || null,
          sleep: props['Sleep Score']?.number || 0,
          exercise: props.Exercise?.number || 0,
          nutrition: props.Nutrition?.number || 0,
          hydration: props.Hydration?.number || 0,
          notionId: page.id,
        }
      case 'transactions':
        return {
          description: props.Description?.title?.[0]?.plain_text || '',
          date: props.Date?.date?.start || null,
          category: props.Category?.select?.name || '',
          amount: props.Amount?.number || 0,
          notionId: page.id,
        }
      case 'learning':
        return {
          title: props.Course?.title?.[0]?.plain_text || '',
          progress: props.Progress?.number || 0,
          xp: props.XP?.number || 0,
          category: props.Category?.select?.name || '',
          notionId: page.id,
        }
      default:
        return {}
    }
  })
}

// Write Floopify data to Notion database
async function writeToNotion(notion, databaseId, module, items) {
  const results = []

  for (const item of items) {
    let properties = {}

    switch (module) {
      case 'habits':
        properties = {
          Name: { title: [{ text: { content: item.name || '' } }] },
          Completed: { checkbox: item.completedToday || false },
          Date: { date: { start: item.date || new Date().toISOString().split('T')[0] } },
          Streak: { number: item.streak || 0 },
        }
        break
      case 'goals':
        properties = {
          Title: { title: [{ text: { content: item.title || '' } }] },
          Status: { select: { name: item.column === 'todo' ? 'To Do' : item.column === 'in-progress' ? 'In Progress' : 'Done' } },
          Progress: { number: item.progress || 0 },
          Category: { select: { name: item.category || 'General' } },
        }
        break
      case 'health':
        properties = {
          Date: { date: { start: item.date || new Date().toISOString().split('T')[0] } },
          'Sleep Score': { number: item.sleep || 0 },
          Exercise: { number: item.exercise || 0 },
          Nutrition: { number: item.nutrition || 0 },
          Hydration: { number: item.hydration || 0 },
        }
        break
      case 'transactions':
        properties = {
          Description: { title: [{ text: { content: item.description || '' } }] },
          Date: { date: { start: item.date || new Date().toISOString().split('T')[0] } },
          Category: { select: { name: item.category || 'Expense' } },
          Amount: { number: item.amount || 0 },
        }
        break
      case 'learning':
        properties = {
          Course: { title: [{ text: { content: item.title || '' } }] },
          Progress: { number: item.progress || 0 },
          XP: { number: item.xp || 0 },
          Category: { select: { name: item.category || 'Development' } },
        }
        break
    }

    try {
      if (item.notionId) {
        // Update existing page
        const result = await notion.pages.update({
          page_id: item.notionId,
          properties,
        })
        results.push({ action: 'updated', id: result.id })
      } else {
        // Create new page
        const result = await notion.pages.create({
          parent: { database_id: databaseId },
          properties,
        })
        results.push({ action: 'created', id: result.id })
      }
    } catch (err) {
      results.push({ action: 'error', error: err.message })
    }
  }

  return results
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const token = req.headers.authorization?.replace('Bearer ', '') || process.env.NOTION_API_KEY

  if (!token) {
    return res.status(401).json({ error: 'No Notion token provided. Set NOTION_API_KEY or pass Authorization header.' })
  }

  const notion = getNotionClient(token)

  try {
    if (req.method === 'GET') {
      // Read from a Notion database
      const { databaseId, module } = req.query

      if (!databaseId || !module) {
        return res.status(400).json({ error: 'Missing databaseId or module parameter' })
      }

      const pages = await readDatabase(notion, databaseId)
      const data = notionToFloopify(pages, module)

      return res.status(200).json({
        success: true,
        module,
        count: data.length,
        data,
        syncedAt: new Date().toISOString(),
      })
    }

    if (req.method === 'POST') {
      // Write to a Notion database
      const { databaseId, module, items, direction } = req.body

      if (!databaseId || !module) {
        return res.status(400).json({ error: 'Missing databaseId or module in request body' })
      }

      if (direction === 'from-notion' || direction === 'pull') {
        // Pull data from Notion
        const pages = await readDatabase(notion, databaseId)
        const data = notionToFloopify(pages, module)
        return res.status(200).json({
          success: true,
          direction: 'pull',
          module,
          count: data.length,
          data,
          syncedAt: new Date().toISOString(),
        })
      }

      // Push data to Notion (default)
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Missing items array in request body' })
      }

      const results = await writeToNotion(notion, databaseId, module, items)
      const created = results.filter(r => r.action === 'created').length
      const updated = results.filter(r => r.action === 'updated').length
      const errors = results.filter(r => r.action === 'error').length

      return res.status(200).json({
        success: true,
        direction: 'push',
        module,
        summary: { created, updated, errors },
        results,
        syncedAt: new Date().toISOString(),
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Notion sync error:', err)
    return res.status(500).json({ error: err.message })
  }
}
