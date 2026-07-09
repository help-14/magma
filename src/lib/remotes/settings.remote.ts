import { command, query } from '$app/server'
import * as v from 'valibot'
import { store } from '$lib/server/config.js'

export const getSettings = query(async () => {
  const [config, yaml, systemConfig, systemYaml, customCss] = await Promise.all(
    [
      store.readDashboardConfig(),
      store.readDashboardYaml(),
      store.readSystemConfig(),
      store.readSystemYaml(),
      store.readOverrideCss()
    ]
  )

  return { config, yaml, systemConfig, systemYaml, customCss }
})

export const saveSystemSettings = command(
  v.object({ systemYaml: v.string() }),
  async ({ systemYaml }) => {
    const systemConfig = store.parseSystemYaml(systemYaml)
    await store.writeSystemConfig(systemConfig)
    return {
      systemConfig,
      systemYaml: store.stringifySystemConfig(systemConfig)
    }
  }
)

export const saveDashboardSettings = command(
  v.object({ yaml: v.string() }),
  async ({ yaml }) => {
    const systemConfig = await store.readSystemConfig()
    const config = store.mergeDashboardWithSystem(
      store.parseDashboardYaml(yaml),
      systemConfig
    )
    await store.writeDashboardConfig(config)
    return {
      config,
      yaml: store.stringifyDashboardConfig(config),
      customCss: await store.readOverrideCss()
    }
  }
)

export const saveDashboardConfig = command(
  v.object({ config: v.any() }),
  async ({ config }) => {
    const systemConfig = await store.readSystemConfig()
    const nextConfig = store.mergeDashboardWithSystem(config, systemConfig)
    await store.writeDashboardConfig(nextConfig)
    return {
      config: nextConfig,
      yaml: store.stringifyDashboardConfig(nextConfig),
      customCss: await store.readOverrideCss()
    }
  }
)

export const saveCssOverride = command(
  v.object({ customCss: v.string() }),
  async ({ customCss }) => {
    await store.writeOverrideCss(customCss)
    return { customCss }
  }
)
