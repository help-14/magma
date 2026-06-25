// @ts-nocheck
import { command, query } from '$app/server';
import * as v from 'valibot';
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

export const getSettings = query(async () => {
	const [config, yaml, systemConfig, systemYaml, customCss] = await Promise.all([
		readDashboardConfig(),
		readDashboardYaml(),
		readSystemConfig(),
		readSystemYaml(),
		readOverrideCss()
	]);

	return { config, yaml, systemConfig, systemYaml, customCss };
});

export const saveSystemSettings = command(v.object({ systemYaml: v.string() }), async ({ systemYaml }) => {
	const systemConfig = parseSystemYaml(systemYaml);
	await writeSystemConfig(systemConfig);
	return {
		systemConfig,
		systemYaml: stringifySystemConfig(systemConfig)
	};
});

export const saveDashboardSettings = command(v.object({ yaml: v.string() }), async ({ yaml }) => {
	const systemConfig = await readSystemConfig();
	const config = mergeDashboardWithSystem(parseDashboardYaml(yaml), systemConfig);
	await writeDashboardConfig(config);
	return {
		config,
		yaml: stringifyDashboardConfig(config),
		customCss: await readOverrideCss()
	};
});

export const saveDashboardConfig = command(v.object({ config: v.any() }), async ({ config }) => {
	const systemConfig = await readSystemConfig();
	const nextConfig = mergeDashboardWithSystem(config, systemConfig);
	await writeDashboardConfig(nextConfig);
	return {
		config: nextConfig,
		yaml: stringifyDashboardConfig(nextConfig),
		customCss: await readOverrideCss()
	};
});

export const saveCssOverride = command(v.object({ customCss: v.string() }), async ({ customCss }) => {
	await writeOverrideCss(customCss);
	return { customCss };
});
