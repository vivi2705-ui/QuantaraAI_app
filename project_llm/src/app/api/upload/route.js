import { saveReport } from '../../../../lib/db'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file')
    if (!file) return Response.json({ error: 'Aucun fichier fourni' }, { status: 400 })

    // Forward to Express backend
    const backendForm = new FormData()
    backendForm.append('file', file)

    const res  = await fetch(`${BACKEND}/api/upload`, { method: 'POST', body: backendForm })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error ?? 'Erreur backend' }, { status: res.status })

    // Save minimal record to DB immediately; results enriched later
    saveReport({
      id:           data.id,
      company_name: file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
      fiscal_year:  null,
      verdict:      null,
      alignment_score: null,
      credit_score:    null,
      created_at:   new Date().toISOString(),
      status:       'processing',
    })

    return Response.json({ success: true, id: data.id })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
