'use client'

export default function Hero() {
  return (
    <section className="flex min-h-[65vh] items-center justify-center px-6 text-center">
      <div className="max-w-4xl">

        <p className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Analyse IA de rapports financiers
        </p>

        <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
          Les mot…{' '}
          <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
            vs les chiffres
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400">
          Détectez automatiquement les incohérences entre discours financier
          et réalité économique grâce à l'IA Quantara.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl bg-emerald-400 px-10 py-4 text-lg font-bold text-black shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-300 active:scale-100"
          >
            Analyser un rapport
          </button>
          <a
            href="/browse"
            className="rounded-2xl border border-white/15 px-10 py-4 text-lg font-semibold text-gray-300 transition hover:border-white/30 hover:text-white"
          >
            Explorer la librairie →
          </a>
        </div>

      </div>
    </section>
  )
}
