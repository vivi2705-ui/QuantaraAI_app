
import { saveReport } from '../../../../../lib/db'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000'

// IMPORTANT
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_req, { params }) {
  try {

    const res = await fetch(
      `${BACKEND}/api/results/${params.id}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return Response.json(
        { error: data.error ?? 'Introuvable' },
        { status: res.status }
      )
    }

    // Save only once completed
    if (data.status === 'completed' && data.report) {
      const r = data.report

      saveReport({
        id: params.id,
        company_name: r.company_name ?? params.id,
        fiscal_year: r.fiscal_year ?? null,
        verdict: r.verdict ?? null,
        alignment_score: r.alignment_score ?? null,
        credit_score: r.credit_score ?? null,
        explication: r.explication ?? null,
        created_at: new Date().toISOString(),
        status: 'completed',
      })
    }

    return Response.json(data)

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}