import { paraglideMiddleware } from '$lib/paraglide/server'
import { cookieName } from '$lib/paraglide/runtime.js'
import { verifySession } from '$lib/server/auth.js'
import { store } from '$lib/server/config.js'
import type { Handle } from '@sveltejs/kit'

function withSystemLocale(request: Request, locale: string) {
  const headers = new Headers(request.headers)
  const cookies = (headers.get('cookie') || '')
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie && !cookie.startsWith(`${cookieName}=`))

  cookies.push(`${cookieName}=${locale}`)
  headers.set('cookie', cookies.join('; '))
  return new Request(request, { headers })
}

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.isAuthenticated = verifySession(event.cookies)
  const systemConfig = await store.readSystemConfig()
  const locale = systemConfig.language || 'en'
  const request = withSystemLocale(event.request, locale)

  return paraglideMiddleware(
    request,
    ({ request: localizedRequest, locale }) => {
      event.request = localizedRequest
      return resolve(event, {
        transformPageChunk: ({ html }) => {
          return html.replace('%lang%', locale).replace('%dir%', 'ltr')
        }
      })
    }
  )
}
