import { readDashboardConfig } from '$lib/server/config.js';

export async function load() {
	return {
		theme: (await readDashboardConfig()).theme || {},
		customCssVersion: Date.now()
	};
}
