import { ErrorCode } from '$lib/errors.js'
import { query } from '$app/server'
import * as v from 'valibot'

export const claudeAiUsage = query(
  v.object({ authToken: v.string() }),
  async ({ authToken }) => {
    try {
      const orgRes = await fetch('https://claude.ai/api/organizations', {
        headers: {
          Cookie: `sessionKey=${authToken}`,
          Referer: 'https://claude.ai/settings/usage',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'anthropic-client-platform': 'web_claude_ai',
        }
      })
      if (!orgRes.ok) {
        const text = await orgRes.text()
        return { ok: false, error: `${orgRes.status} ${text.slice(0, 200)}` }
      }
      const orgs = await orgRes.json()
      if (!Array.isArray(orgs) || orgs.length === 0) {
        return { ok: false, error: ErrorCode.NO_ORGANIZATIONS }
      }
      const orgUuid = orgs[0].uuid

      const usageRes = await fetch(`https://claude.ai/api/organizations/${orgUuid}/usage`, {
        headers: {
          Cookie: `sessionKey=${authToken}`,
          Referer: 'https://claude.ai/settings/usage',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'anthropic-client-platform': 'web_claude_ai',
        }
      })
      if (!usageRes.ok) {
        return { ok: false, error: `${usageRes.status} ${usageRes.statusText}` }
      }
      const usageData = await usageRes.json()

      const accountRes = await fetch('https://claude.ai/api/account', {
        headers: {
          Cookie: `sessionKey=${authToken}`,
          Referer: 'https://claude.ai/settings/usage',
        }
      })
      let email = ''
      if (accountRes.ok) {
        const accountData = await accountRes.json()
        email = accountData.email || ''
      }

      return {
        ok: true,
        data: {
          fiveHour: usageData.five_hour || null,
          sevenDay: usageData.seven_day || null,
          email,
        }
      }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
)

export const claudeApiUsage = query(
  v.object({ authToken: v.string() }),
  async ({ authToken }) => {
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': authToken,
          'anthropic-version': '2023-06-01',
        }
      })
      if (!res.ok) {
        const text = await res.text()
        return { ok: false, error: `${res.status} ${text.slice(0, 200)}` }
      }

      const requestsLimit = parseInt(res.headers.get('anthropic-ratelimit-requests-limit') || '0', 10)
      const requestsRemaining = parseInt(res.headers.get('anthropic-ratelimit-requests-remaining') || '0', 10)
      const tokensLimit = parseInt(res.headers.get('anthropic-ratelimit-tokens-limit') || '0', 10)
      const tokensRemaining = parseInt(res.headers.get('anthropic-ratelimit-tokens-remaining') || '0', 10)
      const requestsReset = res.headers.get('anthropic-ratelimit-requests-reset') || ''
      const tokensReset = res.headers.get('anthropic-ratelimit-tokens-reset') || ''

      return {
        ok: true,
        data: {
          requestsLimit,
          requestsRemaining,
          tokensLimit,
          tokensRemaining,
          requestsReset,
          tokensReset,
        }
      }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
)
