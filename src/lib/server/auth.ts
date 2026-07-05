import type { Cookies } from '@sveltejs/kit'

const COOKIE_NAME = 'magma_session'
const SESSION_DAYS = 30

export function createSession(cookies: Cookies) {
	const now = Date.now()
	const payload = {
		a: true,
		i: now,
		e: now + SESSION_DAYS * 24 * 60 * 60 * 1000,
	}
	cookies.set(COOKIE_NAME, JSON.stringify(payload), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_DAYS * 24 * 60 * 60,
	})
}

export function verifySession(cookies: Cookies): boolean {
	const raw = cookies.get(COOKIE_NAME)
	if (!raw) return false
	try {
		const payload = JSON.parse(raw)
		if (payload.a !== true) return false
		if (Date.now() > payload.e) return false
		return true
	} catch {
		return false
	}
}
