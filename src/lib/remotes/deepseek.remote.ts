import { ErrorCode } from '$lib/errors.js'
import { query } from '$app/server'
import * as v from 'valibot'

export const deepseekSummary = query(
  v.object({ authToken: v.string() }),
  async ({ authToken }) => {
    try {
      const response = await fetch(
        'https://platform.deepseek.com/api/v0/users/get_user_summary',
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
        return { ok: false, error: ErrorCode.INVALID_JSON }
      }
      if (json.code !== 0) {
        return { ok: false, error: json.msg || ErrorCode.API_ERROR }
      }
      return { ok: true, data: json.data.biz_data }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
)
