'use client'

import { Download } from 'lucide-react'

const DEFAULT = `Le management adopte un ton fortement optimiste malgré plusieurs indicateurs financiers en dégradation notable sur l'exercice 2024.

L'analyse détecte une augmentation importante du niveau d'endettement tandis que les flux de trésorerie montrent une tendance négative sur les deux derniers exercices consécutifs.

Bien que le discours mette l'accent sur la croissance stratégique et les opportunités futures, les données chiffrées suggèrent un risque modéré de sur-optimisme de la part de la direction.`

export default function ReportPreview({ narrative, reportId }) {
  const text = narrative || DEFAULT

  const handleDownload = async () => {
    if (!reportId) return
    try {
      const res = await fetch(`/api/download/${reportId}`)
      if (!res.ok) throw new Error('PDF non disponible')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `quantara-rapport-${reportId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-black">Rapport Narratif IA</h2>
        <button
          onClick={handleDownload}
          disabled={!reportId}
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={16} />
          Télécharger PDF
        </button>
      </div>

      <div className="space-y-4 leading-relaxed text-gray-300">
        {text.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </div>
  )
}
