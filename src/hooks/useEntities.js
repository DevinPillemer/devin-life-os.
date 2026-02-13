import { useEffect, useState } from 'react'
import { api } from '@/api'

export function useEntities(entityName) {
  const [items, setItems] = useState([])
  useEffect(() => setItems(api[entityName].list()), [entityName])

  const create = (data) => {
    const next = api[entityName].create(data)
    setItems(api[entityName].list())
    return next
  }
  const update = (id, data) => {
    api[entityName].update(id, data)
    setItems(api[entityName].list())
  }
  const remove = (id) => {
    api[entityName].delete(id)
    setItems(api[entityName].list())
  }

  return { items, create, update, remove }
}
