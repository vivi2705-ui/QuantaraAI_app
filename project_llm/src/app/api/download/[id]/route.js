const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(_req, { params }) {
  try {
    const res = await fetch(`${BACKEND}/api/download/${params.id}`)
    if (!res.ok) return Response.json({ error: 'PDF non disponible' }, { status: 404 })

    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="quantara-${params.id}.pdf"`,
      },
    })
  } catch {
    return Response.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}
