import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function sanitizeFilename(filename: string) {
  return filename.replace(/[\r\n"\\]/g, '_') || 'image.jpg'
}

function encodePublicId(publicId: string) {
  return publicId
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publicId = searchParams.get('publicId')
  const format = searchParams.get('format')
  const filename = sanitizeFilename(searchParams.get('filename') || 'image.jpg')
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName || !publicId || !format) {
    return NextResponse.json({ error: 'Parâmetros de download inválidos' }, { status: 400 })
  }

  const normalizedFormat = format.replace(/[^a-zA-Z0-9]/g, '')
  const sourceUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${encodePublicId(publicId)}.${normalizedFormat}`
  const upstream = await fetch(sourceUrl, { cache: 'no-store' })

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Não foi possível baixar a imagem' }, { status: 502 })
  }

  const headers = new Headers()
  headers.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream')
  headers.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`)
  headers.set('Cache-Control', 'private, no-store')

  const contentLength = upstream.headers.get('content-length')
  if (contentLength) {
    headers.set('Content-Length', contentLength)
  }

  return new NextResponse(upstream.body, { headers })
}
