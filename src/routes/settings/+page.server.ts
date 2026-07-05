import { store } from '$lib/server/config.js'

export async function load({ parent, locals }) {
	const { config, systemConfig } = await parent()
	const [systemYaml, yaml, customCss, passkeys] = await Promise.all([
		store.readSystemYaml(),
		store.readDashboardYaml(),
		store.readOverrideCss(),
		store.readPasskeys(),
	])
	return {
		config,
		customCss,
		systemConfig,
		systemYaml,
		yaml,
		language: systemConfig.language || 'en',
		isAuthenticated: locals.isAuthenticated,
		passkeyCount: passkeys.length,
	}
}
