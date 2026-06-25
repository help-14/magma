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
 * @property {number} [gap]
 */

/**
 * @typedef {Record<string, any>} WidgetConfig
 */

/**
 * @typedef {'text'|'number'|'color'|'icon-picker'|'checkbox'|'select'} ConfigFieldType
 */

/**
 * @typedef {Object} ConfigFieldDescriptor
 * @property {string} key
 * @property {string} label
 * @property {ConfigFieldType} type
 * @property {string|number|boolean} default
 * @property {string} [placeholder]
 * @property {{ label: string, value: string }[]} [options]
 */

export { }
