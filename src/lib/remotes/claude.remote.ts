import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ErrorCode } from '$lib/errors.js'
import { query } from '$app/server'
import * as v from 'valibot'

const execFileAsync = promisify(execFile)

const CLAUDE_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0'

const IMPERSONATE_BINARIES = [
  '/opt/homebrew/bin/curl_chrome131',
  '/opt/homebrew/bin/curl_chrome124',
  '/opt/homebrew/bin/curl_chrome123',
  '/opt/homebrew/bin/curl_chrome120',
  '/opt/homebrew/bin/curl_chrome116',
  '/usr/local/bin/curl_chrome131',
  '/usr/local/bin/curl_chrome124',
  '/usr/local/bin/curl_chrome120',
  '/usr/local/bin/curl_chrome116',
  '/usr/bin/curl_chrome131',
  '/usr/bin/curl_chrome124',
  '/usr/bin/curl_chrome120',
  '/usr/bin/curl_chrome116',
]

function cookieValue(cookie: string): string {
  return cookie.includes('=') ? cookie : `sessionKey=${cookie}`
}

function claudeHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    Accept: '*/*',
    Referer: 'https://claude.ai/new',
    'User-Agent': CLAUDE_UA,
    'content-type': 'application/json',
    'anthropic-client-platform': 'web_claude_ai',
    'anthropic-client-version': '1.0.0',
    'anthropic-client-build': '1786761898',
    'anthropic-client-sha': '3b5cb299b2bef6964a3a3b2e278b7b6e386e5e38',
    'anthropic-anonymous-id': 'claudeai.v1.dbb3dc81-25cc-4901-8e42-9f59fd9d7ce5',
    'anthropic-device-id': 'eb959a09-2c16-4358-8502-3a22b1cf2987',
  }
}

function findImpersonateBinary(): string | null {
  return IMPERSONATE_BINARIES.find((path) => existsSync(path)) ?? null
}

async function fetchWithImpersonation(
  url: string,
  headers: Record<string, string>,
): Promise<{ status: number; body: string }> {
  try {
    const res = await fetch(url, { headers })
    if (res.status !== 403) {
      return { status: res.status, body: await res.text() }
    }
  } catch {
    // blocked or unreachable: fall through to impersonation below
  }

  const binary = findImpersonateBinary()
  if (!binary) {
    throw new Error(
      'claude.ai returned 403 (Cloudflare blocks non-browser clients). Install curl-impersonate via `brew install curl-impersonate` and retry.',
    )
  }

  const args: string[] = []
  for (const [key, value] of Object.entries(headers)) {
    args.push('-H', `${key}: ${value}`)
  }
  args.push('-sS', '-L', '--compressed', '--max-time', '20', '-w', '\n%{http_code}', url)

  const { stdout } = await execFileAsync(binary, args, {
    maxBuffer: 4 * 1024 * 1024,
  })
  const lines = stdout.trimEnd().split('\n')
  const status = parseInt(lines.pop() || '0', 10)
  return { status, body: lines.join('\n') }
}

function orgFromCookie(cookie: string): string | null {
  const match = cookie.match(/lastActiveOrg=([0-9a-fA-F-]+)/)
  return match ? match[1] : null
}

export const claudeAiUsage = query(
  v.object({
    cookie: v.string(),
    organizationId: v.optional(v.string()),
  }),
  async ({ cookie, organizationId }) => {
    try {
      const cookieHeader = cookieValue(cookie)

      let orgUuid = organizationId?.trim() || orgFromCookie(cookieHeader)
      if (!orgUuid) {
        const orgRes = await fetchWithImpersonation(
          'https://claude.ai/api/organizations',
          claudeHeaders(cookieHeader),
        )
        if (orgRes.status < 200 || orgRes.status >= 300) {
          return {
            ok: false,
            error: `${orgRes.status} ${orgRes.body.slice(0, 200)}`,
          }
        }
        const orgs = JSON.parse(orgRes.body)
        if (!Array.isArray(orgs) || orgs.length === 0) {
          return { ok: false, error: ErrorCode.NO_ORGANIZATIONS }
        }
        orgUuid = orgs[0].uuid
      }

      const usageRes = await fetchWithImpersonation(
        `https://claude.ai/api/organizations/${orgUuid}/usage`,
        claudeHeaders(cookieHeader),
      )
      if (usageRes.status < 200 || usageRes.status >= 300) {
        return {
          ok: false,
          error: `${usageRes.status} ${usageRes.body.slice(0, 200)}`,
        }
      }
      const usageData = JSON.parse(usageRes.body)

      const accountRes = await fetchWithImpersonation(
        'https://claude.ai/api/account',
        claudeHeaders(cookieHeader),
      )
      let email = ''
      if (accountRes.status >= 200 && accountRes.status < 300) {
        const accountData = JSON.parse(accountRes.body)
        email = accountData.email || ''
      }

      return {
        ok: true,
        data: {
          fiveHour: usageData.five_hour || null,
          sevenDay: usageData.seven_day || null,
          email,
        },
      }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  },
)