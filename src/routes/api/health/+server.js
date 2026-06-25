import { json } from '@sveltejs/kit';
import { readDashboardConfig } from '$lib/server/config.js';

export async function GET() {
	await readDashboardConfig();
	return json({ ok: true, service: 'magma' });
}
