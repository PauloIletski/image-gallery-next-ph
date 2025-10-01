import { NextResponse } from 'next/server'
import crypto from 'crypto'

function base64url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID/GOOGLE_REDIRECT_URI não configurados' }, { status: 500 })
  }

  const verifier = base64url(crypto.randomBytes(32))
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest())
  const state = base64url(crypto.randomBytes(16))

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly openid email profile',
    access_type: 'offline',
    include_granted_scopes: 'true',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'consent',
  })

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
  res.cookies.set('g_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  res.cookies.set('g_oauth_verifier', verifier, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  return res
}


