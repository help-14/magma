import { query } from '$app/server'
import * as v from 'valibot'
import { createCache, stableCacheKey } from '$lib/server/cache.js'

type FetchResult = {
  ok: boolean
  status: number
  statusText: string
  responseText: string
}

const cache = createCache<FetchResult>(60_000, 50)

export const fetchUrl = query(
  v.object({
    url: v.string(),
    method: v.optional(v.picklist(['GET', 'POST', 'PUT', 'DELETE']), 'GET'),
    headers: v.optional(v.string(), '[]'),
    body: v.optional(v.string(), '')
  }),
  async ({ url, method, headers, body }) => {
    try {
      const parsedHeaders = JSON.parse(headers)

      const headerMap: Record<string, string> = {}
      if (Array.isArray(parsedHeaders)) {
        for (const h of parsedHeaders as { key?: string; value?: string }[]) {
          if (h.key && h.value) headerMap[h.key] = h.value
        }
      }

      const getCacheKey =
        method === 'GET' ? stableCacheKey({ url, headers: headerMap }) : null
      const opts: RequestInit = { method, headers: headerMap }
      if (body && (method === 'POST' || method === 'PUT')) {
        opts.body = body
      }

      const load = async () => {
        const response = await fetch(url, opts)
        const responseText = await response.text()
        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          responseText
        }
      }

      return getCacheKey ? cache.getOrSet(getCacheKey, load) : load()
    } catch (err) {
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        responseText: err instanceof Error ? err.message : String(err)
      }
    }
  }
)
