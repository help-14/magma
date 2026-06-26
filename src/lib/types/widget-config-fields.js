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
  'deepseek': [
    { key: 'authToken', label: 'Auth Token', type: 'password', default: '' },
    { key: 'refreshInterval', label: 'Refresh (s)', type: 'number', default: 600 }
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
  ],
  fetch: [
    { key: 'url', label: 'URL', type: 'text', default: '' },
    {
      key: 'method',
      label: 'Method',
      type: 'select',
      default: 'GET',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    },
    { key: 'headers', label: 'Headers (JSON array)', type: 'textarea', default: '[]', rows: 3 },
    { key: 'body', label: 'Body', type: 'textarea', default: '', rows: 4 },
    { key: 'formatScript', label: 'Format script', type: 'textarea', default: 'return responseText', rows: 6 },
    { key: 'refreshInterval', label: 'Refresh (s)', type: 'number', default: 600 }
  ]
}
