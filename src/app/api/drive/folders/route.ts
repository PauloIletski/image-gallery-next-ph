import { NextRequest, NextResponse } from 'next/server'
import { applyGoogleTokenCookies, getGoogleAccessToken } from '@/utils/googleAuth'

export async function GET(req: NextRequest) {
  const tokenResult = await getGoogleAccessToken(req)
  const accessToken = tokenResult.accessToken
  if (!accessToken) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  if (process.env.GDRIVE_ROOT_FOLDER) {
    return applyGoogleTokenCookies(NextResponse.json({
      files: [],
      hasConfiguredRoot: true,
    }), tokenResult)
  }

  const qs = new URLSearchParams({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id,name)',
    pageSize: '100',
    orderBy: 'name',
  })
  const res = await fetch('https://www.googleapis.com/drive/v3/files?' + qs.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ error: 'Falha ao listar pastas' }, { status: 400 })
  const data = await res.json()
  return applyGoogleTokenCookies(NextResponse.json({
    files: data.files || [],
    hasConfiguredRoot: Boolean(process.env.GDRIVE_ROOT_FOLDER),
  }), tokenResult)
}
