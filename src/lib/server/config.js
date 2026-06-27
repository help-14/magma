// @ts-nocheck
import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'

const configDir = process.env.CONFIG_DIR || 'config'
const dashboardConfigPath = path.resolve(configDir, 'dashboard.yaml')
const systemConfigPath = path.resolve(configDir, 'system.yaml')
const overrideCssPath = path.resolve(configDir, 'override.css')
const knownWidgetTypes = new Set([
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
  'rss',
  'stock'
])

export async function readDashboardYaml() {
	return readFile(dashboardConfigPath, 'utf8')
}

export async function readSystemYaml() {
	try {
		return await readFile(systemConfigPath, 'utf8')
	} catch (error) {
		if (error.code === 'ENOENT') return stringifySystemConfig(defaultSystemConfig())
		throw error
	}
}

export async function readDashboardConfig() {
	const [dashboardYaml, systemConfig] = await Promise.all([readDashboardYaml(), readSystemConfig()])
	const config = mergeDashboardWithSystem(YAML.parse(dashboardYaml), systemConfig)
	validateDashboardConfig(config)
	return config
}

export async function readSystemConfig() {
	const yaml = await readSystemYaml()
	const config = YAML.parse(yaml) || defaultSystemConfig()
	validateSystemConfig(config)
	return config
}

export async function readOverrideCss() {
	try {
		return await readFile(overrideCssPath, 'utf8')
	} catch (error) {
		if (error.code === 'ENOENT') return ''
		throw error
	}
}

export async function writeOverrideCss(css) {
	const tempPath = `${overrideCssPath}.tmp`
	await writeFile(tempPath, css || '', 'utf8')
	await rename(tempPath, overrideCssPath)
	return css || ''
}

export async function writeDashboardConfig(config) {
	validateDashboardConfig(config)
	const yaml = stringifyDashboardConfig(config)
	const tempPath = `${dashboardConfigPath}.tmp`
	await writeFile(tempPath, yaml, 'utf8')
	await rename(tempPath, dashboardConfigPath)
	return config
}

export function parseDashboardYaml(yaml) {
	return YAML.parse(yaml)
}

export function stringifyDashboardConfig(config) {
	validateDashboardConfig(config)
	const dashboardConfig = structuredClone(config)
	if (dashboardConfig.dashboard) {
		delete dashboardConfig.dashboard.grid
	}
	if (dashboardConfig.theme) {
		delete dashboardConfig.theme.backgroundImage
		if (Object.keys(dashboardConfig.theme).length === 0) {
			delete dashboardConfig.theme
		}
	}
	return YAML.stringify(dashboardConfig, { lineWidth: 100 })
}

export async function writeSystemConfig(config) {
	validateSystemConfig(config)
	const yaml = stringifySystemConfig(config)
	const tempPath = `${systemConfigPath}.tmp`
	await writeFile(tempPath, yaml, 'utf8')
	await rename(tempPath, systemConfigPath)
	return config
}

export function parseSystemYaml(yaml) {
	const config = YAML.parse(yaml)
	validateSystemConfig(config)
	return config
}

export function stringifySystemConfig(config) {
	validateSystemConfig(config)
	return YAML.stringify(config, { lineWidth: 100 })
}

export function defaultSystemConfig() {
	return {
		version: 1,
		language: 'en',
		system: {
			dashboardGrid: {
				columns: 12,
				rows: 6,
				cellWidth: 20,
				cellHeight: 20
			}
		},
		theme: {
			backgroundImage: '/bg.jpg'
		}
	}
}

export function mergeDashboardWithSystem(config, systemConfig) {
	const systemGrid = systemConfig.system?.dashboardGrid || {}
	return {
		...config,
		dashboard: {
			...config?.dashboard,
			grid: {
				columns: systemGrid.columns ?? 12,
				rows: systemGrid.rows ?? 8,
				cellWidth: systemGrid.cellWidth,
				cellHeight: systemGrid.cellHeight
			}
		},
		theme: {
			...config?.theme,
			backgroundImage: systemConfig.theme?.backgroundImage || config?.theme?.backgroundImage || '/bg.jpg'
		}
	}
}

export function validateSystemConfig(config) {
	if (!config || typeof config !== 'object') {
		throw new Error('System config must be an object.')
	}
	const grid = config.system?.dashboardGrid
	if (grid && typeof grid === 'object') {
		if (grid.columns !== undefined && (!Number.isInteger(grid.columns) || grid.columns < 1)) {
			throw new Error('system.dashboardGrid.columns must be a positive integer.')
		}
		if (grid.rows !== undefined && (!Number.isInteger(grid.rows) || grid.rows < 1)) {
			throw new Error('system.dashboardGrid.rows must be a positive integer.')
		}
		if (grid.cellWidth !== undefined && (!Number.isInteger(grid.cellWidth) || grid.cellWidth < 1)) {
			throw new Error('system.dashboardGrid.cellWidth must be a positive integer.')
		}
		if (grid.cellHeight !== undefined && (!Number.isInteger(grid.cellHeight) || grid.cellHeight < 1)) {
			throw new Error('system.dashboardGrid.cellHeight must be a positive integer.')
		}
	}
	const backgroundImage = config.theme?.backgroundImage
	if (backgroundImage !== undefined && typeof backgroundImage !== 'string') {
		throw new Error('theme.backgroundImage must be a string.')
	}
	if (config.language !== undefined && typeof config.language !== 'string') {
		throw new Error('language must be a string.')
	}
}

export function validateDashboardConfig(config) {
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

	const seen = new Set()
	for (const widget of widgets) {
		validateWidget(widget, grid, true, seen)
	}
	validateTopLevelOverlaps(widgets)
}

function validateWidget(widget, grid, topLevel, seen) {
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
		const halfCols = Math.floor(grid.columns / 2)
		if (widget.y < 1 || widget.w < 1 || widget.h < 1) {
			throw new Error(`Widget ${widget.id} has invalid position or size.`)
		}
	}

	if (widget.children !== undefined) {
		if (!['stack', 'stack-horizontal', 'stack-vertical'].includes(widget.type)) {
			throw new Error(`Only stack widgets can contain children: ${widget.id}`)
		}
		if (!Array.isArray(widget.children)) {
			throw new Error(`Widget ${widget.id} children must be an array.`)
		}
		for (const child of widget.children) {
			validateWidget(child, grid, false, seen)
		}
	}
}

function validateTopLevelOverlaps(widgets) {
	for (let index = 0; index < widgets.length; index += 1) {
		for (let nextIndex = index + 1; nextIndex < widgets.length; nextIndex += 1) {
			if (overlaps(widgets[index], widgets[nextIndex])) {
				throw new Error(`Widgets overlap: ${widgets[index].id} and ${widgets[nextIndex].id}`)
			}
		}
	}
}

function overlaps(a, b) {
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
