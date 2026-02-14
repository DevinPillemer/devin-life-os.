const allowedEvents = new Set([
  'session_started',
  'question_answered',
  'section_completed',
  'chapter_completed',
  'quiz_started',
  'quiz_completed',
  'exercise_submitted',
  'certificate_issued'
])

export function useLearningEvents() {
  const trackEvent = (eventName, payload = {}) => {
    if (!allowedEvents.has(eventName)) {
      console.warn('[learning-event] Unknown event:', eventName, payload)
      return
    }
    console.log(`[learning-event] ${eventName}`, {
      timestamp: new Date().toISOString(),
      ...payload
    })
  }

  return { trackEvent }
}
