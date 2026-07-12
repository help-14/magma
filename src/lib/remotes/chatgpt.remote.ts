import { query } from '$app/server'
import * as v from 'valibot'

export const chatgptUsage = query(
  v.object({ authToken: v.string() }),
  async ({ authToken }) => {
    try {
      const response = await fetch(
        'https://chatgpt.com/backend-api/wham/usage',
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      const responseText = await response.text()
      if (!response.ok) {
        return { ok: false, error: `${response.status} ${response.statusText}` }
      }
      let json
      try {
        json = JSON.parse(responseText)
      } catch {
        return { ok: false, error: 'Invalid JSON response' }
      }
      return { ok: true, data: json }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
)
