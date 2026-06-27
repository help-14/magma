/**
 * @typedef {Object} ButtonConfig
 * @property {string} [url]
 * @property {string} [icon]
 * @property {string} [iconColor]
 */

/**
 * @typedef {Object} SearchConfig
 * @property {string} [placeholder]
 * @property {string} [provider]
 */

/**
 * @typedef {Object} WeatherConfig
 * @property {string} [locationRef]
 */

/**
 * @typedef {Object} DockerStatusConfig
 * @property {string} [dockerHost]
 * @property {boolean} [hideOffline]
 * @property {number} [columns]
 */

/**
 * @typedef {Object} StackConfig
 * @property {string} [flow]
 * @property {number} [cols]
 * @property {number} [rows]
 * @property {number} [gap]
 */

/**
 * @typedef {Object} FetchConfig
 * @property {string} [url]
 * @property {string} [method]
 * @property {string} [headers]
 * @property {string} [body]
 * @property {string} [formatScript]
 * @property {number} [refreshInterval]
 */

/**
 * @typedef {Object} WebsiteConfig
 * @property {string} [url]
 */

/**
 * @typedef {Object} DeepSeekConfig
 * @property {string} [authToken]
 * @property {number} [refreshInterval]
 */

/**
 * @typedef {Object} YoutubeConfig
 * @property {string} [mode]
 * @property {string} [channels]
 * @property {string} [flow]
 * @property {number} [cols]
 * @property {number} [rows]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} StockConfig
 * @property {string} [stocks]
 * @property {string} [sortBy]
 * @property {number} [refreshInterval]
 */

/**
 * @typedef {Object} RssWidgetConfig
 * @property {string} [feeds]
 * @property {string} [style]
 * @property {number} [limit]
 * @property {number} [collapseAfter]
 * @property {boolean} [singleLineTitles]
 * @property {boolean} [preserveOrder]
 * @property {number} [refreshInterval]
 */

/**
 * @typedef {Object} ServerStatusConfig
 * @property {string} sshCmd
 * @property {boolean} [showHostname]
 * @property {boolean} [showUptime]
 * @property {boolean} [showCpu]
 * @property {boolean} [showRam]
 * @property {boolean} [showDisk]
 */

/**
 * @typedef {Object} GithubRepoConfig
 * @property {string} repo
 * @property {boolean} [showStars]
 * @property {boolean} [showForks]
 * @property {boolean} [showPrs]
 * @property {boolean} [showIssues]
 * @property {number} [refreshInterval]
 */

/**
 * @typedef {Record<string, any>} WidgetConfig
 */

/**
 * @typedef {'text'|'number'|'color'|'icon-picker'|'checkbox'|'select'|'textarea'|'password'} ConfigFieldType
 */

/**
 * @typedef {Object} ConfigFieldDescriptor
 * @property {string} key
 * @property {string} label
 * @property {ConfigFieldType} type
 * @property {string|number|boolean} default
 * @property {string} [placeholder]
 * @property {{ label: string, value: string }[]} [options]
 * @property {number} [rows]
 */

export { }
