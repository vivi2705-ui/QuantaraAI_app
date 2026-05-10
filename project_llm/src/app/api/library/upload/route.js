import { writeFile, mkdir } from 'fs/promises'
import { join }             from 'path'
import { existsSync }       from 'fs'
import { randomUUID }       from 'crypto'
import { saveUpload }       from '../../../../../lib/db'

const LIBRARY_DIR = join(process.cwd(), '.quantara-data', 'library')

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file')

    if (!file) return Response.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    if (file.type !== 'application/pdf') return Response.json({ error: 'PDF uniquement' }, { status: 415 })

    if (!existsSync(LIBRARY_DIR)) await mkdir(LIBRARY_DIR, { recursive: true })

    const id = randomUUID()
    const filename = file.name
    const dest     = join(LIBRARY_DIR, `${id}.pdf`)
    const buffer   = Buffer.from(await file.arrayBuffer())

    await writeFile(dest, buffer)

    const doc = saveUpload({
      id,
      filename,
      company_name: filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
      size_mb:      (buffer.length / 1024 / 1024).toFixed(2),
      uploaded_at:  new Date().toISOString(),
      path:         dest,
    })

    return Response.json({ success: true, id: doc.id })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
