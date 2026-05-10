import { listReports } from '../../../../../lib/db'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const limit  = parseInt(searchParams.get('limit') ?? '20')
  const search = searchParams.get('search') ?? ''

  const reports = listReports({ limit, search })
  return Response.json({ reports })
}
