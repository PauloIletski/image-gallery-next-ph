import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('g_access_token', '', { path: '/', maxAge: 0 })
  res.cookies.set('g_refresh_token', '', { path: '/', maxAge: 0 })
  res.cookies.set('g_token_exp', '', { path: '/', maxAge: 0 })
  return res
}


