'use client'

export default function ScoreCard({ title = 'Score', score = 0 }) {
  const color    = score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const barColor = score >= 70 ? 'bg-emerald-400'   : score >= 50 ? 'bg-yellow-400'   : 'bg-red-400'
  const label    = score >= 70 ? 'Bon alignement'   : score >= 50 ? 'Optimisme modéré' : 'Alerte élevée'

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-sm">
      <p className="mb-4 text-sm text-gray-400">{title}</p>
      <p className={`mb-4 text-7xl font-black leading-none ${color}`}>{score}</p>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-sm font-semibold text-yellow-400">{label}</p>
    </div>
  )
}
