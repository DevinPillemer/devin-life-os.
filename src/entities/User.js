// User entity stub for Base44-style data layer
const STORAGE_KEY = 'floopify_user'

function getStoredUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const User = {
  me: async () => {
    const stored = getStoredUser()
    if (stored) return stored
    const defaultUser = {
      id: '1',
      full_name: 'Devin',
      email: 'devin@example.com',
      credits: 0,
      created_date: new Date().toISOString()
    }
    saveUser(defaultUser)
    return defaultUser
  },
  update: async (id, data) => {
    const user = getStoredUser() || {}
    const updated = { ...user, ...data }
    saveUser(updated)
    return updated
  }
}
