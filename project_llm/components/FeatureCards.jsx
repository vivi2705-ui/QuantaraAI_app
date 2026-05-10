'use client'

import { FileText, BrainCircuit, ShieldAlert } from 'lucide-react'

const features = [
  { icon: FileText,    step: 'Étape 1', title: 'Upload du rapport',  desc: 'Un ou plusieurs rapports annuels au format PDF' },
  { icon: BrainCircuit,step: 'Étape 2', title: 'Analyse par IA',    desc: "Quantara compare le discours aux KPIs financiers réels" },
  { icon: ShieldAlert, step: 'Étape 3', title: "Rapport d'alerte",  desc: 'Recevez les incohérences et red flag détectés' },
]

export default function FeatureCards() {
  return (
    <section className="px-6 pb-28">
      <h2 className="mb-14 text-center text-4xl font-black md:text-5xl">Comment ça marche</h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="group rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-black/40">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500/20">
                <Icon size={32} />
              </div>
              <span className="mb-3 inline-block rounded-full border border-yellow-500/40 px-3 py-1 text-xs font-bold text-yellow-400">{item.step}</span>
              <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
              <p className="leading-relaxed text-gray-400">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
