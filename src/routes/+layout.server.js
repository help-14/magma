import { readDashboardConfig, readSystemConfig } from '$lib/server/config.js';
import { setLocale } from '$lib/paraglide/runtime.js';

export async function load({ cookies }) {
	const [dashboardConfig, systemConfig] = await Promise.all([
		readDashboardConfig(),
		readSystemConfig()
	]);
	const locale = systemConfig.language || 'en';
	cookies.set('PARAGLIDE_LOCALE', locale, { path: '/', maxAge: 34560000 });
	setLocale(locale, { reload: false });
	return {
		theme: dashboardConfig.theme || {},
		customCssVersion: Date.now(),
		locale
	};
}
