// @ts-nocheck
import { json } from '@sveltejs/kit';
import {
	mergeDashboardWithSystem,
	parseDashboardYaml,
	parseSystemYaml,
	readDashboardConfig,
	readDashboardYaml,
	readOverrideCss,
	readSystemConfig,
	readSystemYaml,
	stringifyDashboardConfig,
	stringifySystemConfig,
	writeDashboardConfig,
	writeOverrideCss,
	writeSystemConfig
} from '$lib/server/config.js';

export async function GET() {
	const [config, yaml, systemConfig, systemYaml, customCss] = await Promise.all([
		readDashboardConfig(),
		readDashboardYaml(),
		readSystemConfig(),
		readSystemYaml(),
		readOverrideCss()
	]);
	return json({ config, yaml, systemConfig, systemYaml, customCss });
}

export async function PUT({ request }) {
	try {
		const body = await request.json();

		if (typeof body.systemYaml === 'string') {
			const systemConfig = parseSystemYaml(body.systemYaml);
			await writeSystemConfig(systemConfig);
			return json({
				systemConfig,
				systemYaml: stringifySystemConfig(systemConfig)
			});
		}

		if (typeof body.yaml === 'string' || body.config) {
			const systemConfig = await readSystemConfig();
			const config =
				typeof body.yaml === 'string'
					? mergeDashboardWithSystem(parseDashboardYaml(body.yaml), systemConfig)
					: mergeDashboardWithSystem(body.config, systemConfig);
			await writeDashboardConfig(config);
			return json({
				config,
				yaml: stringifyDashboardConfig(config),
				customCss: await readOverrideCss()
			});
		}

		if (typeof body.customCss === 'string') {
			await writeOverrideCss(body.customCss);
			return json({
				customCss: body.customCss
			});
		}

		return json({ message: 'No settings payload provided.' }, { status: 400 });
	} catch (error) {
		return json({ message: error.message || 'Invalid settings.' }, { status: 400 });
	}
}
