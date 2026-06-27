// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

const fetchCache = new Map();
const FETCH_CACHE_TTL = 60_000;

function getCached(key) {
	const entry = fetchCache.get(key);
	if (entry && Date.now() - entry.ts < FETCH_CACHE_TTL) return entry.data;
	return null;
}

function setCache(key, data) {
	fetchCache.set(key, { data, ts: Date.now() });
}

export const fetchUrl = query(
	v.object({
		url: v.string(),
		method: v.optional(v.picklist(['GET', 'POST', 'PUT', 'DELETE']), 'GET'),
		headers: v.optional(v.string(), '[]'),
		body: v.optional(v.string(), '')
	}),
	async ({ url, method, headers, body }) => {
		try {
			if (method === 'GET') {
				const cached = getCached(url);
				if (cached) return cached;
			}

			const parsedHeaders = JSON.parse(headers);
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
			if (method === 'GET') setCache(url, result);
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
