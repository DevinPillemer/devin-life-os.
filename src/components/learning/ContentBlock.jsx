export default function ContentBlock({ block }) {
  if (block.block_type === 'bullet_list') {
    return (
      <ul className="list-disc space-y-2 pl-5 text-slate-200">
        {block.text.map((line) => <li key={line}>{line}</li>)}
      </ul>
    )
  }

  return <p className="leading-relaxed text-slate-300">{block.text}</p>
}
