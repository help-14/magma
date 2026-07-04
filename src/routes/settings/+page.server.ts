import { store } from '$lib/server/config.js'

export async function load({ parent }) {
	const { config, systemConfig } = await parent()
	const [systemYaml, yaml, customCss] = await Promise.all([
		store.readSystemYaml(),
		store.readDashboardYaml(),
		store.readOverrideCss()
	])
	return {
		config,
		customCss,
		systemConfig,
		systemYaml,
		yaml,
		language: systemConfig.language || 'en'
	}
}
