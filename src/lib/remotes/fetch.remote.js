// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';
import { createCache } from '$lib/server/cache.js';

const cache = createCache(60_000, 50);

export const fetchUrl = query(
	v.object({
		url: v.string(),
		method: v.optional(v.picklist(['GET', 'POST', 'PUT', 'DELETE']), 'GET'),
		headers: v.optional(v.string(), '[]'),
		body: v.optional(v.string(), '')
	}),
	async ({ url, method, headers, body }) => {
		try {
			const parsedHeaders = JSON.parse(headers);
			const getCacheKey = method === 'GET' ? JSON.stringify({ url, headers: parsedHeaders }) : null;

			if (getCacheKey) {
				const cached = cache.get(getCacheKey);
				if (cached) return cached;
			}

			const headerMap = {};
			if (Array.isArray(parsedHeaders)) {
				for (const h of parsedHeaders) {
					if (h.key && h.value) headerMap[h.key] = h.value;
				}
			}
			const opts = { method, headers: headerMap };
			if (body && (method === 'POST' || method === 'PUT')) {
				opts.body = body;
			}
			const response = await fetch(url, opts);
			const responseText = await response.text();
			const result = {
				ok: response.ok,
				status: response.status,
				statusText: response.statusText,
				responseText
			};
			if (getCacheKey) cache.set(getCacheKey, result);
			return result;
		} catch (err) {
			return {
				ok: false,
				status: 0,
				statusText: 'Network Error',
				responseText: err.message || String(err)
			};
		}
	}
);
