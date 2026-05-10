'use client'

const VERDICTS = {
  ALIGNÉ: {
    icon: '✓',
    label: 'Discours aligné avec la réalité financière',
    sub: 'La communication des dirigeants reflète fidèlement les données.',
    cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    bar: 'bg-emerald-400',
  },
  PRUDENT: {
    icon: '◉',
    label: 'Prudent — légèrement positif',
    sub: 'Ton optimiste mais globalement cohérent avec les chiffres.',
    cls: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    bar: 'bg-yellow-400',
  },
  OPTIMISTE_EXCESSIF: {
    icon: '⚠',
    label: 'Optimisme excessif détecté',
    sub: 'Le discours est significativement plus positif que les indicateurs financiers.',
    cls: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    bar: 'bg-yellow-500',
  },
  ALARMANT: {
    icon: '🔴',
    label: 'Discours alarmant — incohérence majeure',
    sub: 'Écart critique entre communication et réalité financière.',
    cls: 'border-red-500/40 bg-red-500/10 text-red-400',
    bar: 'bg-red-500',
  },
}

export default function VerdictBanner({ verdict, explication }) {
  const v = VERDICTS[verdict] ?? {
    icon: '—', label: verdict ?? 'Verdict indisponible', sub: '', cls: 'border-white/10 bg-white/5 text-gray-300', bar: 'bg-gray-500',
  }

  return (
    <div className={`mb-8 rounded-3xl border p-6 ${v.cls}`}>
      <div className="flex items-start gap-4">
        <span className="mt-0.5 text-3xl">{v.icon}</span>
        <div className="flex-1">
          <p className="mb-0.5 text-xs font-bold uppercase tracking-widest opacity-60">Verdict IA Quantara</p>
          <p className="mb-1 text-xl font-black">{v.label}</p>
          <p className="text-sm opacity-75">{explication || v.sub}</p>
        </div>
      </div>
    </div>
  )
}
