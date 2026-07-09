import { dev } from '$app/environment'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Cookies } from '@sveltejs/kit'

export const COOKIE_NAME = 'magma_session'
const SESSION_DAYS = 30
const SECRET = process.env.SESSION_SECRET || 'magma-dev-secret'

function sign(value: string): string {
  const mac = createHmac('sha256', SECRET).update(value).digest('base64url')
  return `${value}.${mac}`
}

function unsign(signed: string): string | null {
  const dot = signed.lastIndexOf('.')
  if (dot === -1) return null
  const value = signed.slice(0, dot)
  const mac = signed.slice(dot + 1)
  const expected = createHmac('sha256', SECRET)
    .update(value)
    .digest('base64url')
  if (mac.length !== expected.length) return null
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
      ? value
      : null
  } catch {
    return null
  }
}

export function createSession(cookies: Cookies) {
  const now = Date.now()
  const payload = JSON.stringify({
    a: true,
    i: now,
    e: now + SESSION_DAYS * 24 * 60 * 60 * 1000
  })
  cookies.set(COOKIE_NAME, sign(payload), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !dev,
    maxAge: SESSION_DAYS * 24 * 60 * 60
  })
}

export function verifySession(cookies: Cookies): boolean {
  const raw = cookies.get(COOKIE_NAME)
  if (!raw) return false
  const unsigned = unsign(raw)
  if (!unsigned) return false
  try {
    const payload = JSON.parse(unsigned)
    if (payload.a !== true) return false
    if (Date.now() > payload.e) return false
    return true
  } catch {
    return false
  }
}
