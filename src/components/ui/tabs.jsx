import React from 'react'

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="flex gap-2">
    {tabs.map((tab) => (
      <button key={tab.value} onClick={() => onChange(tab.value)} className={`rounded-lg px-3 py-1 text-sm ${value === tab.value ? 'bg-teal-500 text-gray-950' : 'bg-gray-800'}`}>
        {tab.label}
      </button>
    ))}
  </div>
)
