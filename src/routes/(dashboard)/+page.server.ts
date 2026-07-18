import { store } from '$lib/server/config.js'

export async function load({ parent, locals }) {
  const { config, systemConfig } = await parent()
  const passkeys = await store.readPasskeys()
  return {
    config,
    systemConfig,
    isAuthenticated: locals.isAuthenticated,
    passkeyCount: passkeys.length
  }
}
