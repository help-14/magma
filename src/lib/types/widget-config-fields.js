/** @type {Record<string, import('./config.js').ConfigFieldDescriptor[]>} */
export const widgetConfigFields = {
	button: [
		{ key: 'urls', label: 'URLs (one per line)', type: 'textarea', default: '', rows: 4 },
		{
			key: 'openIn',
			label: 'Open in',
			type: 'select',
			default: '_self',
			options: [
				{ label: 'Current tab', value: '_self' },
				{ label: 'New tab', value: '_blank' },
				{ label: 'New window', value: '_window' }
			]
		},
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
  'stack': [
    {
      key: 'flow',
      label: 'Flow direction',
      type: 'select',
      default: 'vertical',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' }
      ]
    },
    { key: 'cols', label: 'Columns', type: 'number', default: 2 },
    { key: 'rows', label: 'Rows', type: 'number', default: 0 },
    { key: 'gap', label: 'Gap', type: 'number', default: 12 }
  ],
  website: [
    { key: 'url', label: 'URL', type: 'text', default: '', placeholder: 'https://example.com' }
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
  ],
  stock: [
    { key: 'stocks', label: 'Stocks (one per line)', type: 'textarea', default: 'SPY\nAAPL\nNVDA', rows: 6 },
    {
      key: 'sortBy',
      label: 'Sort by',
      type: 'select',
      default: 'default',
      options: [
        { label: 'Default (input order)', value: 'default' },
        { label: 'Change %', value: 'change' },
        { label: 'Absolute change %', value: 'absolute-change' }
      ]
    },
    { key: 'cacheTime', label: 'Cache time (s)', type: 'number', default: 300 },
    { key: 'refreshInterval', label: 'Refresh (s)', type: 'number', default: 300 }
  ],
  rss: [
    { key: 'feeds', label: 'Feeds (JSON)', type: 'textarea', default: '[]', rows: 6 },
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      default: 'vertical-list',
      options: [
        { label: 'Vertical list', value: 'vertical-list' },
        { label: 'Detailed list', value: 'detailed-list' },
        { label: 'Horizontal cards', value: 'horizontal-cards' }
      ]
    },
    { key: 'limit', label: 'Max articles', type: 'number', default: 25 },
    { key: 'collapseAfter', label: 'Collapse after', type: 'number', default: 5 },
    { key: 'singleLineTitles', label: 'Single-line titles', type: 'checkbox', default: false },
    { key: 'preserveOrder', label: 'Preserve feed order', type: 'checkbox', default: false },
    { key: 'refreshInterval', label: 'Refresh (s)', type: 'number', default: 600 }
  ],
  'server-status': [
    { key: 'sshCmd', label: 'SSH Command', type: 'text', default: '', placeholder: 'ssh user@host' },
    { key: 'showHostname', label: 'Show Hostname', type: 'checkbox', default: true },
    { key: 'showUptime', label: 'Show Uptime', type: 'checkbox', default: true },
    { key: 'showCpu', label: 'Show CPU', type: 'checkbox', default: true },
    { key: 'showRam', label: 'Show RAM', type: 'checkbox', default: true },
    { key: 'showDisk', label: 'Show Disk', type: 'checkbox', default: true },
  ],
  'github-repo': [
    { key: 'repo', label: 'Repository (owner/repo)', type: 'text', default: '' },
    { key: 'showStars', label: 'Show Stars', type: 'checkbox', default: true },
    { key: 'showForks', label: 'Show Forks', type: 'checkbox', default: true },
    { key: 'showPrs', label: 'Show Open PRs', type: 'checkbox', default: true },
    { key: 'showIssues', label: 'Show Open Issues', type: 'checkbox', default: true },
    { key: 'refreshInterval', label: 'Refresh (s)', type: 'number', default: 3600 },
  ],
  'youtube-live': [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'uploads',
      options: [
        { label: 'Newest uploads', value: 'uploads' },
        { label: 'Livestream', value: 'livestream' }
      ]
    },
    { key: 'channels', label: 'Channel IDs (one per line)', type: 'textarea', default: '', rows: 4, placeholder: 'UCXuqSBlHAE6Xw...' },
    {
      key: 'flow',
      label: 'Flow direction',
      type: 'select',
      default: 'vertical',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' }
      ]
    },
    { key: 'cols', label: 'Columns', type: 'number', default: 2 },
    { key: 'rows', label: 'Rows', type: 'number', default: 0 },
    { key: 'limit', label: 'Max videos', type: 'number', default: 10 }
  ],
  timer: [
    { key: 'showSeconds', label: 'Show seconds', type: 'checkbox', default: false },
    { key: 'showDate', label: 'Show date', type: 'checkbox', default: true },
    { key: 'showGreeting', label: 'Show greeting', type: 'checkbox', default: true },
    { key: 'hour12', label: '12-hour format', type: 'checkbox', default: false },
    { key: 'timezone', label: 'Timezone', type: 'text', default: '', placeholder: 'e.g. America/New_York' }
  ]
}
