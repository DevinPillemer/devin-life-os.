import React from 'react'

export const Table = ({ headers = [], rows = [] }) => (
  <table className="w-full text-left text-sm">
    <thead><tr>{headers.map((h) => <th key={h} className="border-b border-gray-800 p-2">{h}</th>)}</tr></thead>
    <tbody>
      {rows.map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j} className="border-b border-gray-900 p-2">{c}</td>)}</tr>)}
    </tbody>
  </table>
)
