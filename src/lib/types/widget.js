/**
 * @typedef {'button'|'search'|'timer'|'weather'|'calendar'|'stack-horizontal'|'stack-vertical'|'docker-status'|'service-status'|'fetch'|'deepseek'|'website'|'youtube-live'|'stack'|'rss'|'stock'|'server-status'|'github-repo'|'honeygain'} WidgetType
 */

/**
 * @typedef {Object} Widget
 * @property {string} id
 * @property {WidgetType} type
 * @property {string} title
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [w]
 * @property {number} [h]
 * @property {import('./config.js').WidgetConfig} [config]
 * @property {Widget[]} [children]
 */

/**
 * @typedef {import('./config.js').ButtonConfig} ButtonConfig
 */

/**
 * @typedef {import('./config.js').SearchConfig} SearchConfig
 */

/**
 * @typedef {import('./config.js').WeatherConfig} WeatherConfig
 */

/**
 * @typedef {import('./config.js').DockerStatusConfig} DockerStatusConfig
 */

/**
 * @typedef {import('./config.js').StackConfig} StackConfig
 */

/**
 * @typedef {Object} BaseWidgetProps
 * @property {Widget} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} ButtonWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: ButtonConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} SearchWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: SearchConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} WeatherWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: WeatherConfig }} widget
 * @property {boolean} [compact]
 * @property {Record<string, { latitude: number, longitude: number }>} [locations]
 */

/**
 * @typedef {Object} StackWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: StackConfig }} widget
 * @property {boolean} [compact]
 * @property {Record<string, { latitude: number, longitude: number }>} [locations]
 * @property {boolean} [editMode]
 * @property {string|null} [selectedChildId]
 * @property {(event: Event, child: Widget) => void} [onSelectChild]
 * @property {(event: Event, child: Widget) => void} [onDeleteChild]
 * @property {(event: DragEvent) => void} [onDropChild]
 * @property {(event: DragEvent) => void} [onDragOverChild]
 */

/**
 * @typedef {Object} DockerStatusWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: DockerStatusConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {BaseWidgetProps} TimerWidgetProps
 */

/**
 * @typedef {BaseWidgetProps} CalendarWidgetProps
 */

/**
 * @typedef {Object} DeepSeekWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: import('./config.js').DeepSeekConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} YoutubeWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: import('./config.js').YoutubeConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} StockWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: import('./config.js').StockConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} RssWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: import('./config.js').RssWidgetConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} ServerStatusWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: import('./config.js').ServerStatusConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {Object} GithubRepoWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: import('./config.js').GithubRepoConfig }} widget
 * @property {boolean} [compact]
 */

/**
 * @typedef {BaseWidgetProps} FallbackWidgetProps
 */

/**
 * @typedef {Object} WidgetRendererProps
 * @property {Widget} widget
 * @property {boolean} [compact]
 * @property {boolean} [editMode]
 * @property {Record<string, { latitude: number, longitude: number }>} [locations]
 */

/**
 * @typedef {Object} WidgetPaletteProps
 * @property {{ title: string, w: number, h: number, type: string }[]} [templates]
 * @property {() => void} [onClose]
 * @property {(event: DragEvent, template: { title: string, w: number, h: number, type: string }) => void} [onDragStart]
 * @property {(event: DragEvent) => void} [onDragEnd]
 */

/**
 * @typedef {Object} IconPickerProps
 * @property {string} [value]
 * @property {(icon: string) => void} [onSelect]
 */

/**
 * @typedef {Object} DashboardIconProps
 * @property {string} [name]
 * @property {number} [size]
 * @property {string} [title]
 * @property {string} [color]
 */

/**
 * @typedef {Object} PropertyPanelProps
 * @property {import('./grid.js').Grid} grid
 * @property {number} gridRows
 * @property {import('./grid.js').Selection|null} selected
 * @property {Widget} widget
 * @property {() => void} [onClose]
 * @property {(patch: Partial<Widget>) => void} [onUpdate]
 * @property {(key: string, value: string|boolean|number) => void} [onUpdateConfig]
 * @property {(key: string, value: string) => void} [onUpdateNumber]
 */

export {}
