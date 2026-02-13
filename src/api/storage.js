const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]')
const setStore = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export const entityApi = (entity) => ({
  list() {
    return getStore(entity)
  },
  get(id) {
    return getStore(entity).find((item) => item.id === id)
  },
  create(data) {
    const next = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data }
    const list = getStore(entity)
    setStore(entity, [next, ...list])
    return next
  },
  update(id, data) {
    const list = getStore(entity).map((item) => (item.id === id ? { ...item, ...data } : item))
    setStore(entity, list)
    return list.find((item) => item.id === id)
  },
  delete(id) {
    const list = getStore(entity).filter((item) => item.id !== id)
    setStore(entity, list)
  }
})
