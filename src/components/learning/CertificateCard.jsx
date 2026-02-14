import { Award } from 'lucide-react'

export default function CertificateCard({ certificate }) {
  if (!certificate) return null

  return (
    <div id="certificate-card" className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-8 text-center shadow-2xl">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(251,191,36,0.6), transparent 55%)' }} />
      <Award className="mx-auto mb-3 h-10 w-10 text-amber-300" />
      <p className="text-sm uppercase tracking-[0.2em] text-amber-200">Floopify Certificate of Completion</p>
      <h3 className="mt-3 text-3xl font-extrabold text-white">{certificate.userName}</h3>
      <p className="mt-2 text-slate-300">has successfully completed</p>
      <p className="mt-1 text-xl font-semibold text-emerald-300">{certificate.courseTitle}</p>
      <p className="mt-3 text-slate-300">Score: <span className="font-semibold text-white">{certificate.quizScore}%</span> • Date: {certificate.date}</p>
      <p className="mt-4 text-xs text-slate-400">{certificate.text}</p>
    </div>
  )
}
