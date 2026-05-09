import { NextResponse } from 'next/server'

type RefreshedGoogleToken = {
  accessToken: string
  expiresAt: number
}

type GoogleTokenResult = {
  accessToken: string
  refreshedToken?: RefreshedGoogleToken
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

const clientCookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

function parseCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const [name, ...valueParts] = part.split('=')
      if (!name) return cookies
      cookies[name] = decodeURIComponent(valueParts.join('=') || '')
      return cookies
    }, {})
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<RefreshedGoogleToken | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!tokenRes.ok) return null

  const tokens = await tokenRes.json()
  if (!tokens.access_token) return null

  return {
    accessToken: tokens.access_token,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
  }
}

export async function getGoogleAccessToken(req: Request, fallbackToken = ''): Promise<GoogleTokenResult> {
  const cookies = parseCookieHeader(req.headers.get('cookie') || '')
  const cookieToken = cookies.g_access_token || ''
  const refreshToken = cookies.g_refresh_token || ''
  const expiresAt = Number(cookies.g_token_exp || 0)
  const authHeader = req.headers.get('authorization') || ''
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''

  if (refreshToken && (!cookieToken || !expiresAt || Date.now() > expiresAt - 60_000)) {
    const refreshedToken = await refreshGoogleAccessToken(refreshToken)
    if (refreshedToken) {
      return {
        accessToken: refreshedToken.accessToken,
        refreshedToken,
      }
    }
  }

  return {
    accessToken: cookieToken || headerToken || fallbackToken,
  }
}

export function applyGoogleTokenCookies(response: NextResponse, tokenResult: GoogleTokenResult) {
  if (!tokenResult.refreshedToken) return response

  response.cookies.set('g_access_token', tokenResult.refreshedToken.accessToken, cookieOptions)
  response.cookies.set('g_access_token_client', tokenResult.refreshedToken.accessToken, clientCookieOptions)
  response.cookies.set('g_token_exp', String(tokenResult.refreshedToken.expiresAt), cookieOptions)
  return response
}

export const googleAuthCookieOptions = cookieOptions
export const googleAuthClientCookieOptions = clientCookieOptions
