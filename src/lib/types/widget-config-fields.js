/** @type {Record<string, import('$lib/types/config.js').ConfigFieldDescriptor[]>} */
export const widgetConfigFields = {
	button: [
		{ key: 'url', label: 'URL', type: 'text', default: '' },
		{ key: 'icon', label: 'Icon', type: 'icon-picker', default: '' },
		{ key: 'iconColor', label: 'Icon color', type: 'color', default: '#fabd2f' }
	],
	search: [
		{ key: 'placeholder', label: 'Placeholder', type: 'text', default: '' },
		{
			key: 'provider',
			label: 'Provider',
			type: 'select',
			default: 'google',
			options: [
				{ label: 'Google', value: 'google' },
				{ label: 'DuckDuckGo', value: 'duckduckgo' },
				{ label: 'Bing', value: 'bing' },
				{ label: 'YouTube', value: 'youtube' },
				{ label: 'Wikipedia', value: 'wikipedia' }
			]
		}
	],
	weather: [
		{ key: 'locationRef', label: 'Location ref', type: 'text', default: 'default' }
	],
	'docker-status': [
		{
			key: 'dockerHost',
			label: 'Docker Host URL',
			type: 'text',
			default: '',
			placeholder: 'http://10.0.0.1:2375'
		},
		{ key: 'hideOffline', label: 'Hide offline containers', type: 'checkbox', default: false },
		{ key: 'columns', label: 'Columns', type: 'number', default: 2 }
	],
	'service-status': [
		{
			key: 'dockerHost',
			label: 'Docker Host URL',
			type: 'text',
			default: '',
			placeholder: 'http://10.0.0.1:2375'
		},
		{ key: 'hideOffline', label: 'Hide offline containers', type: 'checkbox', default: false }
	],
	'stack-horizontal': [
		{ key: 'gap', label: 'Gap', type: 'number', default: 12 }
	],
	'stack-vertical': [
		{ key: 'gap', label: 'Gap', type: 'number', default: 12 }
	]
}
