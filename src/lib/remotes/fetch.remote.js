// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

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
			return {
				ok: response.ok,
				status: response.status,
				statusText: response.statusText,
				responseText
			};
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
