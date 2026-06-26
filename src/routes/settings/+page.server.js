import {
	readDashboardConfig,
	readDashboardYaml,
	readOverrideCss,
	readSystemConfig,
	readSystemYaml
} from '$lib/server/config.js';

export async function load() {
	const [dashboardConfig, systemConfig, systemYaml, yaml, customCss] = await Promise.all([
		readDashboardConfig(),
		readSystemConfig(),
		readSystemYaml(),
		readDashboardYaml(),
		readOverrideCss()
	]);
	return {
		config: dashboardConfig,
		customCss,
		systemConfig,
		systemYaml,
		yaml,
		language: systemConfig.language || 'en'
	};
}
