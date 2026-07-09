const store = new Map<string, { challenge: string; expiresAt: number }>()

export function saveChallenge(challenge: string): string {
  const id = crypto.randomUUID()
  store.set(id, { challenge, expiresAt: Date.now() + 60_000 })
  return id
}

export function consumeChallenge(id: string): string | null {
  const entry = store.get(id)
  if (!entry) return null
  store.delete(id)
  if (Date.now() > entry.expiresAt) return null
  return entry.challenge
}
