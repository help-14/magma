import { store } from '$lib/server/config.js'

export async function load({ parent, locals }) {
  const { config } = await parent()
  const passkeys = await store.readPasskeys()
  return {
    config,
    isAuthenticated: locals.isAuthenticated,
    passkeyCount: passkeys.length
  }
}
