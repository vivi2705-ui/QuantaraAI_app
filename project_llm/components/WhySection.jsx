'use client'

const reasons = [
  { emoji: '⚡', bg: 'bg-emerald-500/10', title: '30 secondes',    desc: "Au lieu de plusieurs jours de lecture manuelle d'un rapport annuel" },
  { emoji: '🎯', bg: 'bg-yellow-500/10',  title: '100% objectif',  desc: 'Score reproductible, sans biais humain ni fatigue cognitive' },
  { emoji: '🚩', bg: 'bg-red-500/10',     title: 'Alertes claires', desc: 'Danger identifiés, rapport clair et intuitif' },
]

export default function WhySection() {
  return (
    <section className="px-6 pb-28">
      <h2 className="mb-14 text-center text-4xl font-black md:text-5xl">Pourquoi Quantara</h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {reasons.map((item, i) => (
          <div key={i} className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40">
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${item.bg}`}>{item.emoji}</div>
            <h3 className="mb-3 text-2xl font-black">{item.title}</h3>
            <p className="leading-relaxed text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
