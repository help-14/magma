// @ts-nocheck
import { json } from '@sveltejs/kit'
import { consumeChallenge } from '$lib/server/challenge-store.js'
import { verifyAuthentication } from '$lib/server/passkey.js'
import { createSession } from '$lib/server/auth.js'

export async function POST({ request, cookies }) {
  const body = await request.json()
  const { challengeId, credential, origin, rpID } = body

  if (!challengeId || !credential || !origin || !rpID) {
    return json({ error: 'Missing required fields' }, { status: 400 })
  }

  const challenge = consumeChallenge(challengeId)
  if (!challenge) {
    return json({ error: 'Challenge expired or invalid' }, { status: 400 })
  }

  try {
    const { label } = await verifyAuthentication(
      challenge,
      credential,
      origin,
      rpID
    )
    createSession(cookies)
    return json({ success: true, label })
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Authentication failed' },
      { status: 401 }
    )
  }
}
