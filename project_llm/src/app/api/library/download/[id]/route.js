import { readFile } from 'fs/promises'
import { getUpload } from '../../../../../../lib/db'

export async function GET(_req, { params }) {
  try {
    const doc = getUpload(params.id)
    if (!doc) return Response.json({ error: 'Document introuvable' }, { status: 404 })

    const buffer = await readFile(doc.path)
    return new Response(buffer, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${doc.filename}"`,
      },
    })
  } catch {
    return Response.json({ error: 'Fichier indisponible' }, { status: 404 })
  }
}
