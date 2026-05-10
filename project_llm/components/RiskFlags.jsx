'use client'

const DEFAULT_FLAGS = [
  { text: 'Discours très optimiste malgré baisse du cashflow', severity: 'high' },
  { text: 'Hausse de la dette supérieure à la croissance',     severity: 'high' },
  { text: 'Marge nette en diminution sur 2 exercices',         severity: 'medium' },
]

export default function RiskFlags({ flags }) {
  const items = flags?.length ? flags : DEFAULT_FLAGS
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
      <h2 className="mb-6 text-2xl font-bold">🚩 Red Flags</h2>
      <div className="flex flex-col gap-3">
        {items.map((flag, i) => {
          const high = flag.severity === 'high'
          return (
            <div key={i} className={`flex items-start gap-3 rounded-2xl border p-4 ${high ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'}`}>
              <span className="mt-0.5 shrink-0">{high ? '⚠' : '◉'}</span>
              <span className="text-sm leading-relaxed">{flag.description || flag.text}</span>
            </div>
          )
        })}
        {items.length === 0 && <p className="text-sm text-emerald-400">✓ Aucun drapeau rouge identifié.</p>}
      </div>
    </div>
  )
}
