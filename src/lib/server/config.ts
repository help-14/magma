import YAML from 'yaml'
import { createHash } from 'node:crypto'
import * as db from './db.js'
import {
  defaultDashboardGrid,
  mergeDashboardGrid,
  validateDashboardGrid
} from './config-grid.js'

export { setConfigStore } from './db.js'

type ConfigObject = Record<string, any>
type WidgetLike = {
  id: string
  type: string
  title: string
  x: number
  y: number
  w: number
  h: number
  children?: WidgetLike[]
  [key: string]: any
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

// ── In-memory cache ──────────────────────────────────────────────────

const configCache = new Map<string, any>()

function getCached<T = any>(key: string): T | null {
  return configCache.get(key) ?? null
}

function setCached(key: string, data: any) {
  configCache.set(key, data)
}

export function invalidateConfigCache() {
  configCache.clear()
}

// ── Known widget types ───────────────────────────────────────────────

export const knownWidgetTypes = new Set([
  'button',
  'calendar',
  'honeygain',
  'search',
  'stack',
  'stack-horizontal',
  'stack-vertical',
  'timer',
  'weather',
  'youtube-live',
  'service-status',
  'docker-status',
  'fetch',
  'website',
  'deepseek',
  'chatgpt',
  'claude',
  'rss',
  'stock',
  'github-repo'
])

export const store = {
  async readDashboardYaml() {
    const cached = getCached('dashboard:yaml')
    if (cached !== null) return cached
    const data = await db.store.read('dashboard.yaml')
    setCached('dashboard:yaml', data)
    return data
  },

  async readSystemYaml() {
    const cached = getCached('system:yaml')
    if (cached !== null) return cached
    try {
      const data = await db.store.read('system.yaml')
      setCached('system:yaml', data)
      return data
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT')
        return stringifySystemConfig(defaultSystemConfig())
      throw error
    }
  },

  async readDashboardConfig() {
    const cached = getCached('dashboard:config')
    if (cached !== null) return cached
    const [dashboardYaml, systemConfig] = await Promise.all([
      this.readDashboardYaml(),
      this.readSystemConfig()
    ])
    const config = mergeDashboardWithSystem(
      YAML.parse(dashboardYaml),
      systemConfig
    )
    validateDashboardConfig(config)
    setCached('dashboard:config', config)
    return config
  },

  async readSystemConfig() {
    const cached = getCached('system:config')
    if (cached !== null) return cached
    const yaml = await this.readSystemYaml()
    const config = YAML.parse(yaml) || defaultSystemConfig()
    validateSystemConfig(config)
    setCached('system:config', config)
    return config
  },

  async readOverrideCss() {
    const cached = getCached('override:css')
    if (cached !== null) return cached
    try {
      const data = await db.store.read('override.css')
      setCached('override:css', data)
      return data
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') return ''
      throw error
    }
  },

  async readPasskeys() {
    const cached = getCached('passkeys')
    if (cached !== null) return cached
    try {
      const data = await db.store.read('passkey.yaml')
      const parsed = YAML.parse(data)
      const list = Array.isArray(parsed?.passkeys) ? parsed.passkeys : []
      setCached('passkeys', list)
      return list
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') return []
      throw error
    }
  },

  async writePasskeys(passkeys: any[]) {
    const yaml = YAML.stringify({ passkeys }, { lineWidth: 100 })
    await db.store.write('passkey.yaml', yaml)
    invalidateConfigCache()
    return passkeys
  },

  async getOverrideCssEtag() {
    const css = await this.readOverrideCss()
    return createHash('md5').update(css).digest('hex')
  },

  async writeOverrideCss(css: string) {
    await db.store.write('override.css', css || '')
    invalidateConfigCache()
    return css || ''
  },

  async writeDashboardConfig(config: ConfigObject) {
    validateDashboardConfig(config)
    const yaml = stringifyDashboardConfig(config)
    await db.store.write('dashboard.yaml', yaml)
    invalidateConfigCache()
    return config
  },

  async writeSystemConfig(config: ConfigObject) {
    validateSystemConfig(config)
    const yaml = stringifySystemConfig(config)
    await db.store.write('system.yaml', yaml)
    invalidateConfigCache()
    return config
  },

  parseDashboardYaml(yaml: string) {
    return YAML.parse(yaml)
  },

  parseSystemYaml(yaml: string) {
    const config = YAML.parse(yaml)
    validateSystemConfig(config)
    return config
  },

  stringifyDashboardConfig(config: ConfigObject) {
    return stringifyDashboardConfig(config)
  },

  stringifySystemConfig(config: ConfigObject) {
    return stringifySystemConfig(config)
  },

  mergeDashboardWithSystem(config: ConfigObject, systemConfig: ConfigObject) {
    return mergeDashboardWithSystem(config, systemConfig)
  },

  defaultSystemConfig() {
    return defaultSystemConfig()
  }
}

// ── Module-level utility functions ───────────────────────────────────

export function parseDashboardYaml(yaml: string) {
  return YAML.parse(yaml)
}

export function parseSystemYaml(yaml: string) {
  const config = YAML.parse(yaml)
  validateSystemConfig(config)
  return config
}

export function stringifyDashboardConfig(config: ConfigObject) {
  validateDashboardConfig(config)
  const cloned = structuredClone(config)
  if (cloned.dashboard) {
    delete cloned.dashboard.grid
  }
  if (cloned.theme) {
    delete cloned.theme.backgroundImage
    if (Object.keys(cloned.theme).length === 0) {
      delete cloned.theme
    }
  }
  return YAML.stringify(cloned, { lineWidth: 100 })
}

export function stringifySystemConfig(config: ConfigObject) {
  validateSystemConfig(config)
  return YAML.stringify(config, { lineWidth: 100 })
}

export function defaultSystemConfig(): ConfigObject {
  return {
    title: 'Magma',
    version: 1,
    language: 'en',
    system: {
      dashboardGrid: defaultDashboardGrid()
    },
    theme: {
      backgroundImage: '/bg.jpg'
    }
  }
}

export function mergeDashboardWithSystem(
  config: ConfigObject,
  systemConfig: ConfigObject
): ConfigObject {
  const systemGrid = systemConfig.system?.dashboardGrid || {}
  return {
    ...config,
    dashboard: {
      ...config?.dashboard,
      grid: mergeDashboardGrid(systemGrid)
    },
    theme: {
      ...config?.theme,
      backgroundImage:
        systemConfig.theme?.backgroundImage ||
        config?.theme?.backgroundImage ||
        '/bg.jpg'
    }
  }
}

// ── Validation ───────────────────────────────────────────────────────

export function validateSystemConfig(config: any) {
  if (!config || typeof config !== 'object') {
    throw new Error('System config must be an object.')
  }
  const grid = config.system?.dashboardGrid
  if (grid && typeof grid === 'object') {
    validateDashboardGrid(grid, 'system.dashboardGrid')
  }
  const backgroundImage = config.theme?.backgroundImage
  if (backgroundImage !== undefined && typeof backgroundImage !== 'string') {
    throw new Error('theme.backgroundImage must be a string.')
  }
  if (config.language !== undefined && typeof config.language !== 'string') {
    throw new Error('language must be a string.')
  }
  if (config.title !== undefined && typeof config.title !== 'string') {
    throw new Error('title must be a string.')
  }
}

export function validateDashboardConfig(config: any) {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object.')
  }

  const grid = config.dashboard?.grid
  const widgets = config.dashboard?.widgets
  if (!grid || typeof grid !== 'object') {
    throw new Error('dashboard.grid is required.')
  }
  if (!Number.isInteger(grid.columns) || grid.columns < 1) {
    throw new Error('dashboard.grid.columns must be a positive integer.')
  }
  if (!Number.isInteger(grid.rows) || grid.rows < 1) {
    throw new Error('dashboard.grid.rows must be a positive integer.')
  }
  if (!Array.isArray(widgets)) {
    throw new Error('dashboard.widgets must be an array.')
  }

  const seen = new Set<string>()
  for (const widget of widgets) {
    validateWidget(widget, true, seen)
  }
  validateTopLevelOverlaps(widgets)
}

function validateWidget(
  widget: WidgetLike,
  topLevel: boolean,
  seen: Set<string>
) {
  if (!widget || typeof widget !== 'object') {
    throw new Error('Each widget must be an object.')
  }
  if (!widget.id || typeof widget.id !== 'string') {
    throw new Error('Each widget needs a string id.')
  }
  if (seen.has(widget.id)) {
    throw new Error(`Duplicate widget id: ${widget.id}`)
  }
  seen.add(widget.id)
  if (!knownWidgetTypes.has(widget.type)) {
    throw new Error(`Unknown widget type: ${widget.type}`)
  }
  if (!widget.title || typeof widget.title !== 'string') {
    throw new Error(`Widget ${widget.id} needs a title.`)
  }

  if (topLevel) {
    for (const key of ['x', 'y', 'w', 'h']) {
      if (!Number.isInteger(widget[key])) {
        throw new Error(`Widget ${widget.id} needs integer ${key}.`)
      }
    }
    if (widget.y < 1 || widget.w < 1 || widget.h < 1) {
      throw new Error(`Widget ${widget.id} has invalid position or size.`)
    }
  }

  if (widget.children !== undefined) {
    if (
      !['stack', 'stack-horizontal', 'stack-vertical'].includes(widget.type)
    ) {
      throw new Error(`Only stack widgets can contain children: ${widget.id}`)
    }
    if (!Array.isArray(widget.children)) {
      throw new Error(`Widget ${widget.id} children must be an array.`)
    }
    for (const child of widget.children) {
      validateWidget(child, false, seen)
    }
  }
}

function validateTopLevelOverlaps(widgets: WidgetLike[]) {
  for (let index = 0; index < widgets.length; index += 1) {
    for (
      let nextIndex = index + 1;
      nextIndex < widgets.length;
      nextIndex += 1
    ) {
      if (overlaps(widgets[index], widgets[nextIndex])) {
        throw new Error(
          `Widgets overlap: ${widgets[index].id} and ${widgets[nextIndex].id}`
        )
      }
    }
  }
}

function overlaps(a: WidgetLike, b: WidgetLike) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  )
}
