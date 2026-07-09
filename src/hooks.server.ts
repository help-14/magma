import { paraglideMiddleware } from '$lib/paraglide/server'
import { verifySession } from '$lib/server/auth.js'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = ({ event, resolve }) => {
  event.locals.isAuthenticated = verifySession(event.cookies)
  return paraglideMiddleware(
    event.request,
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
