export default function FloopifyLogo({ size = 32 }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-sm"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #4f98a3, #2a7a85)',
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <path d="M3 8C3 5.24 5.24 3 8 3s5 2.24 5 5-2.24 5-5 5S3 10.76 3 8z" fill="rgba(255,255,255,0.9)" />
        <circle cx="8" cy="8" r="2" fill="#0e0d0b" />
      </svg>
    </div>
  )
}
