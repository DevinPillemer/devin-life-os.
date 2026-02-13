export default async function handler(req, res) {
  const sheetId = process.env.VITE_GOOGLE_SHEETS_HEALTH_ID

  if (!sheetId) {
    return res.status(500).json({ message: 'Missing VITE_GOOGLE_SHEETS_HEALTH_ID environment variable.' })
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
    const response = await fetch(url)
    const text = await response.text()
    const json = JSON.parse(text.substring(47).slice(0, -2))
    return res.status(200).json(json)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch Google Sheets data.' })
  }
}
