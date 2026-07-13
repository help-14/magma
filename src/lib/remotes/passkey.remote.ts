import { ErrorCode } from '$lib/errors.js'
import { command, query } from '$app/server'
import * as v from 'valibot'
import { saveChallenge, consumeChallenge } from '$lib/server/challenge-store.js'
import {
  beginRegistration,
  verifyAndSaveRegistration,
  beginAuthentication
} from '$lib/server/passkey.js'
import { store } from '$lib/server/config.js'

export const registerBegin = query(
  v.object({ origin: v.string(), rpID: v.string() }),
  async ({ origin, rpID }) => {
    const options = await beginRegistration(origin, rpID)
    const challengeId = saveChallenge(options.challenge)
    return { challengeId, options }
  }
)

export const registerComplete = command(
  v.object({
    challengeId: v.string(),
    credential: v.any(),
    label: v.string(),
    origin: v.string(),
    rpID: v.string()
  }),
  async ({ challengeId, credential, label, origin, rpID }) => {
    const challenge = consumeChallenge(challengeId)
    if (!challenge) throw new Error(ErrorCode.CHALLENGE_EXPIRED)
    await verifyAndSaveRegistration(challenge, credential, label, origin, rpID)
    return { success: true }
  }
)

export const authenticateBegin = query(
  v.object({ origin: v.string(), rpID: v.string() }),
  async ({ origin, rpID }) => {
    const options = await beginAuthentication(origin, rpID)
    const challengeId = saveChallenge(options.challenge)
    return { challengeId, options }
  }
)

export const listPasskeys = query(async () => {
  const passkeys = await store.readPasskeys()
  return {
    passkeys: passkeys.map((pk: any) => ({
      id: pk.id,
      label: pk.label,
      created: pk.created,
      lastUsed: pk.lastUsed
    }))
  }
})

export const deletePasskey = command(
  v.object({ id: v.string() }),
  async ({ id }) => {
    const passkeys = await store.readPasskeys()
    const filtered = passkeys.filter((pk: any) => pk.id !== id)
    if (filtered.length === passkeys.length) {
      throw new Error(ErrorCode.PASSKEY_NOT_FOUND)
    }
    await store.writePasskeys(filtered)
    return { success: true }
  }
)
