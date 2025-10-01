import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('g_access_token')?.value
  if (!accessToken) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const qs = new URLSearchParams({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id,name)',
    pageSize: '100',
    orderBy: 'name',
  })
  const res = await fetch('https://www.googleapis.com/drive/v3/files?' + qs.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store' as any,
  })
  if (!res.ok) return NextResponse.json({ error: 'Falha ao listar pastas' }, { status: 400 })
  const data = await res.json()
  return NextResponse.json({ files: data.files || [] })
}


