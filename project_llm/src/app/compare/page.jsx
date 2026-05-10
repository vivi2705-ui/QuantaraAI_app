'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter }     from 'next/navigation'
import Link from 'next/link'
import Navbar  from '../../../components/Navbar'
import Footer  from '../../../components/Footer'
import ScoreCard from '../../../components/ScoreCard'
import VerdictBanner from '../../../components/VerdictBanner'

const STATUS_MESSAGES = {
  uploaded:            'Document reçu…',
  extracting:          'Extraction du texte…',
  calculating:         'Calcul des KPIs…',
  analyzing_sentiment: 'Analyse du discours…',
  comparing:           'Comparaison discours/réalité…',
  generating_report:   'Génération du rapport…',
  generating_pdf:      'Génération du PDF…',
}

function ReportCard({ id }) {
  const [data,   setData]   = useState(null)
  const [status, setStatus] = useState('loading')
  const [error,  setError]  = useState(null)

  useEffect(() => {
    let cancelled = false
    let timer = null

    const poll = async () => {
      try {
        const res  = await fetch(`/api/results/${id}`)
        const json = await res.json()
        if (cancelled) return

        if (res.status === 422 || json.status === 'error') {
          setError(json.error || 'Analyse échouée')
          setStatus('error')
          return
        }

        if (json.status && json.status !== 'completed') {
          setStatus(json.status)
          timer = setTimeout(poll, 3000)
          return
        }

        setData(json.report ?? {})
        setStatus('completed')
      } catch (err) {
        if (!cancelled) { setError(err.message); setStatus('error') }
      }
    }

    poll()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [id])

  if (status === 'error') {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">Erreur</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    )
  }

  if (status !== 'completed') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
        <p className="text-sm text-gray-400">{STATUS_MESSAGES[status] || 'Traitement…'}</p>
        <p className="text-xs text-gray-600 font-mono">{id.slice(-8)}</p>
      </div>
    )
  }

  const r = data ?? {}
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500 font-mono">{id.slice(-8)}</p>
          <p className="font-bold">{r.company_name || 'Rapport sans titre'}</p>
          {r.fiscal_year && <p className="text-xs text-gray-400">{r.fiscal_year}</p>}
        </div>
        <Link
          href={`/results?id=${id}`}
          className="shrink-0 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
        >
          Voir détail →
        </Link>
      </div>

      <VerdictBanner verdict={r.verdict} explication={r.explication} />

      <div className="grid grid-cols-2 gap-3">
        <ScoreCard title="Alignement" score={r.alignment_score ?? 0} />
        <ScoreCard title="Crédit"     score={r.credit_score    ?? 0} />
      </div>

      {r.kpis?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {r.kpis.slice(0, 4).map((k, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{k.name}</p>
              <p className="text-lg font-black text-white">{k.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const idsParam     = searchParams.get('ids') ?? ''
  const ids          = idsParam.split(',').filter(Boolean)

  if (ids.length === 0) {
    router.push('/')
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950/10 to-[#020817]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Analyse groupée · Quantara
          </p>
          <h1 className="mb-1 text-3xl font-black">
            Comparaison de {ids.length} rapports
          </h1>
          <p className="text-sm text-gray-400">
            Chaque rapport est analysé indépendamment et présenté côte à côte
          </p>
        </div>

        <div className={`grid gap-6 ${ids.length === 2 ? 'md:grid-cols-2' : ids.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-2'}`}>
          {ids.map(id => <ReportCard key={id} id={id} />)}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => router.push('/')} className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-400 transition hover:border-white/20 hover:text-white">
            ↩ Nouvelle analyse
          </button>
        </div>

      </div>
      <Footer />
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#020817]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
      </main>
    }>
      <CompareContent />
    </Suspense>
  )
}
