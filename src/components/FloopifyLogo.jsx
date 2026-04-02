export default function FloopifyLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#00d4aa" fillOpacity="0.15" />
      <path
        d="M12 10h12a2 2 0 012 2v2H14v5h8v2h-8v9h-4V10z"
        fill="#00d4aa"
      />
      <path
        d="M22 22c2-2 4-3 6-2s3 4 1 7-6 4-8 2"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M8 30 Q14 26 20 30 Q26 34 32 30"
        stroke="#00d4aa"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}
