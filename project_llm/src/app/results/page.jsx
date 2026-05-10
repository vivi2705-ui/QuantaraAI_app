
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter }     from 'next/navigation'
import Navbar        from '../../../components/Navbar'
import VerdictBanner from '../../../components/VerdictBanner'
import ScoreCard     from '../../../components/ScoreCard'
import KPIGrid       from '../../../components/KPIGrid'
import RiskFlags     from '../../../components/RiskFlags'
import Charts        from '../../../components/Charts'
import ReportPreview from '../../../components/ReportPreview'
import Footer        from '../../../components/Footer'

const STATUS_MESSAGES = {
  uploaded:            'Document reçu…',
  extracting:          'Extraction du texte…',
  calculating:         'Calcul des KPIs…',
  analyzing_sentiment: 'Analyse du discours dirigeant…',
  comparing:           'Comparaison discours / réalité…',
  generating_report:   'Génération du rapport narratif…',
  generating_pdf:      'Génération du PDF…',
}

function LoadingScreen({ message = 'Analyse en cours…' }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#020817]">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
        <div>
          <p className="mb-1 text-xl font-bold">{message}</p>
          <p className="text-gray-400">Quantara croise le discours et les chiffres financiers</p>
        </div>
      </div>
    </main>
  )
}

function ErrorScreen({ message, onBack }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#020817]">
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <span className="text-4xl">⚠️</span>
        </div>
        <div>
          <p className="mb-3 text-xl font-bold text-red-300">Analyse impossible</p>
          <p className="leading-relaxed text-gray-400">{message}</p>
        </div>
        <button
          onClick={onBack}
          className="rounded-xl bg-emerald-400 px-8 py-3 font-bold text-black transition hover:bg-emerald-300"
        >
          Retour à l'accueil
        </button>
      </div>
    </main>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const id           = searchParams.get('id')

  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [statusMsg, setStatusMsg] = useState('Analyse en cours…')

  useEffect(() => {
  if (!id) return

  let cancelled = false
  let timeoutId

  const poll = async () => {
    try {
      const res = await fetch(`/api/results/${id}`, {
        cache: 'no-store',
      })

      const json = await res.json()

      if (cancelled) return

      if (json.status && json.status !== 'completed') {
        setStatusMsg(STATUS_MESSAGES[json.status] || 'Traitement...')
        timeoutId = setTimeout(poll, 3000)
        return
      }

      setData(json)
      setLoading(false)

    } catch (err) {
      if (!cancelled) {
        setError(err.message)
        setLoading(false)
      }
    }
  }

  poll()

  return () => {
    cancelled = true
    clearTimeout(timeoutId)
  }
}, [id])
 

  if (loading) return <LoadingScreen message={statusMsg} />
  if (error)   return <ErrorScreen message={error} onBack={() => router.push('/')} />

  const r = data?.report ?? {}

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950/10 to-[#020817]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Analyse complète · Quantara
            </p>
            <h1 className="mb-1 text-3xl font-black">
              {r.company_name || 'Rapport Annuel'}
            </h1>
            <p className="text-sm text-gray-400">{r.fiscal_year || 'Exercice analysé'}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-400 transition hover:border-white/20 hover:text-white"
          >
            ↩ Nouvelle analyse
          </button>
        </div>

        {/* ① Verdict */}
        <VerdictBanner verdict={r.verdict} explication={r.explication || r.main_inconsistency} />

        {/* ② Scores */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ScoreCard title="Score Alignement" score={r.alignment_score ?? 0} />
          <ScoreCard title="Score Crédit"     score={r.credit_score    ?? 0} />
          <ScoreCard title="Confiance IA"     score={r.confidence      ?? 88} />
        </div>

        {/* ③ KPIs — hidden when no real data */}
        <KPIGrid kpis={r.kpis} />

        {/* ④ Chart + Flags */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Charts    data={r.chart_data} />
          <RiskFlags flags={r.red_flags} />
        </div>

        {/* ⑤ Narrative + download */}
        <div className="mt-6">
          <ReportPreview narrative={r.narrative} reportId={id} />
        </div>

      </div>
      <Footer />
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultsContent />
    </Suspense>
  )
}