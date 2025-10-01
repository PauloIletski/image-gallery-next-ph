import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const savedState = req.cookies.get('g_oauth_state')?.value
  const verifier = req.cookies.get('g_oauth_verifier')?.value

  if (!code || !state || !savedState || !verifier || state !== savedState) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Variáveis do Google não configuradas' }, { status: 500 })
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!tokenRes.ok) {
    const t = await tokenRes.text()
    return NextResponse.json({ error: 'Falha ao trocar o código', details: t }, { status: 400 })
  }
  const tokens = await tokenRes.json()

  const res = NextResponse.redirect(process.env.GOOGLE_POST_LOGIN_REDIRECT || '/')
  res.cookies.set('g_access_token', tokens.access_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  if (tokens.refresh_token) {
    res.cookies.set('g_refresh_token', tokens.refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  }
  res.cookies.set('g_token_exp', String(Date.now() + (tokens.expires_in || 3600) * 1000), { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  // limpar cookies de estado/verifier
  res.cookies.set('g_oauth_state', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  res.cookies.set('g_oauth_verifier', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}


