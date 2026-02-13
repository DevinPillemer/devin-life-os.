const SIXTY_DAYS_SECONDS = 60 * 24 * 60 * 60

function getAfterTimestamp(rawAfter) {
  if (!rawAfter) {
    return Math.floor(Date.now() / 1000) - SIXTY_DAYS_SECONDS
  }

  const parsed = Number(rawAfter)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return Math.floor(parsed)
}

export default async function handler(req, res) {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({
      message: 'Missing STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, or STRAVA_REFRESH_TOKEN environment variable.'
    })
  }

  const after = getAfterTimestamp(req.query?.after)
  if (after === null) {
    return res.status(400).json({ message: 'Invalid "after" query param. Expected a unix timestamp in seconds.' })
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    const tokenPayload = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenPayload?.access_token) {
      return res.status(502).json({
        message: tokenPayload?.message || `Failed to refresh Strava token (${tokenResponse.status}).`
      })
    }

    const activitiesUrl = new URL('https://www.strava.com/api/v3/athlete/activities')
    activitiesUrl.searchParams.set('per_page', '200')
    activitiesUrl.searchParams.set('after', String(after))

    const activitiesResponse = await fetch(activitiesUrl, {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`
      }
    })

    const activitiesPayload = await activitiesResponse.json()

    if (!activitiesResponse.ok || !Array.isArray(activitiesPayload)) {
      return res.status(502).json({
        message: activitiesPayload?.message || `Failed to fetch Strava activities (${activitiesResponse.status}).`
      })
    }

    return res.status(200).json(activitiesPayload)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch Strava activities.' })
  }
}
