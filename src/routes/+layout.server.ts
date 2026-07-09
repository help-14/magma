import { store } from '$lib/server/config.js'
import { setLocale } from '$lib/paraglide/runtime.js'

export async function load({ cookies }) {
  const [dashboardConfig, systemConfig, customCss] = await Promise.all([
    store.readDashboardConfig(),
    store.readSystemConfig(),
    store.readOverrideCss()
  ])
  const locale = systemConfig.language || 'en'
  cookies.set('PARAGLIDE_LOCALE', locale, { path: '/', maxAge: 34560000 })
  setLocale(locale, { reload: false })
  return {
    config: dashboardConfig,
    systemConfig,
    siteTitle: systemConfig.title || 'Magma',
    theme: dashboardConfig.theme || {},
    customCss,
    customCssVersion: Date.now(),
    locale
  }
}
