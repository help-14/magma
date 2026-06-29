// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

export const resolveUrl = query(
	v.object({ urls: v.array(v.string()) }),
	async ({ urls }) => {
		if (urls.length === 0) return null;
		if (urls.length === 1) return urls[0];

		return new Promise(resolve => {
			let settled = false;
			let remaining = urls.length;

			for (const url of urls) {
				fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(1000) })
					.then(() => {
						if (!settled) { settled = true; resolve(url); }
					})
					.catch(() => {
						remaining -= 1;
						if (remaining === 0 && !settled) {
							settled = true;
							resolve(urls[0]);
						}
					});
			}
		});
	}
);
