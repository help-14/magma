import { readOverrideCss } from '$lib/server/config.js';

export async function GET() {
	return new Response(await readOverrideCss(), {
		headers: {
			'content-type': 'text/css; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
}
