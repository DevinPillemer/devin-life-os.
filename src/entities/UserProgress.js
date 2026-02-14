// UserProgress entity stub for Base44-style data layer
const STORAGE_KEY = 'floopify_user_progress'

function getAll() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function save(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export const UserProgress = {
  list: async () => getAll(),
  filter: async (query) => {
    const all = getAll()
    return all.filter(item =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    )
  },
  create: async (data) => {
    const all = getAll()
    const record = { id: Date.now().toString(), ...data, created_date: new Date().toISOString() }
    all.push(record)
    save(all)
    return record
  },
  update: async (id, data) => {
    const all = getAll()
    const idx = all.findIndex(r => r.id === id)
    if (idx >= 0) { all[idx] = { ...all[idx], ...data }; save(all) }
    return all[idx] || null
  },
  delete: async (id) => {
    const all = getAll().filter(r => r.id !== id)
    save(all)
  }
}
