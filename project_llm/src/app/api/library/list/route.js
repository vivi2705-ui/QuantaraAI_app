import { listUploads } from '../../../../../lib/db'

export async function GET() {
  const uploads = listUploads({ limit: 100 })
  return Response.json({ uploads })
}
