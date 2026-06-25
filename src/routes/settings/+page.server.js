import {
	readDashboardConfig,
	readDashboardYaml,
	readOverrideCss,
	readSystemConfig,
	readSystemYaml
} from '$lib/server/config.js';

export async function load() {
	return {
		config: await readDashboardConfig(),
		customCss: await readOverrideCss(),
		systemConfig: await readSystemConfig(),
		systemYaml: await readSystemYaml(),
		yaml: await readDashboardYaml()
	};
}
