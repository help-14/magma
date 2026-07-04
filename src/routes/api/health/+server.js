import { json } from '@sveltejs/kit';
import { store } from '$lib/server/config.js';

export async function GET() {
	await store.readDashboardConfig();
	return json({ ok: true, service: 'magma' }, {
		headers: {
			'cache-control': 'no-cache'
		}
	});
}
