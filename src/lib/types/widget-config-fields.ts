import { m } from '$lib/paraglide/messages.js'
import type { ConfigFieldDescriptor } from './config.js'

const displaySizes = [
  { label: m.properties_option_small, value: 'small' },
  { label: m.properties_option_medium, value: 'medium' },
  { label: m.properties_option_large, value: 'large' }
]

const refreshInterval = (defaultValue: number): ConfigFieldDescriptor => ({
  key: 'refreshInterval',
  label: m.properties_field_refresh_interval,
  type: 'number',
  default: defaultValue
})

export const widgetConfigFields: Record<string, ConfigFieldDescriptor[]> = {
  button: [
    {
      key: 'urls',
      label: m.properties_field_urls,
      type: 'textarea',
      default: '',
      rows: 4
    },
    {
      key: 'openIn',
      label: m.properties_field_open_in,
      type: 'select',
      default: '_self',
      options: [
        { label: m.properties_option_current_tab, value: '_self' },
        { label: m.properties_option_new_tab, value: '_blank' },
        { label: m.properties_option_new_window, value: '_window' }
      ]
    },
    {
      key: 'icon',
      label: m.properties_field_icon,
      type: 'icon-picker',
      default: ''
    },
    {
      key: 'iconColor',
      label: m.properties_field_icon_color,
      type: 'color',
      default: '#fabd2f'
    }
  ],
  search: [
    {
      key: 'placeholder',
      label: m.properties_field_placeholder,
      type: 'text',
      default: ''
    },
    {
      key: 'provider',
      label: m.properties_field_provider,
      type: 'select',
      default: 'google',
      options: [
        { label: m.properties_option_google, value: 'google' },
        { label: m.properties_option_duckduckgo, value: 'duckduckgo' },
        { label: m.properties_option_bing, value: 'bing' },
        { label: m.properties_option_youtube, value: 'youtube' },
        { label: m.properties_option_wikipedia, value: 'wikipedia' }
      ]
    }
  ],
  weather: [
    {
      key: 'interface',
      label: m.properties_field_interface,
      type: 'select',
      default: 'medium',
      options: displaySizes
    },
    {
      key: 'provider',
      label: m.properties_field_provider,
      type: 'select',
      default: 'open-meteo',
      options: [
        { label: m.properties_option_open_meteo, value: 'open-meteo' },
        { label: m.properties_option_weatherapi, value: 'weatherapi' },
        { label: m.properties_option_openweathermap, value: 'openweathermap' }
      ]
    },
    {
      key: 'apiKey',
      label: m.properties_field_api_key,
      type: 'password',
      default: ''
    },
    {
      key: 'cityName',
      label: m.properties_field_city_name,
      type: 'text',
      default: '',
      placeholder: m.properties_placeholder_city
    },
    {
      key: 'latitude',
      label: m.properties_field_latitude,
      type: 'number',
      default: 0
    },
    {
      key: 'longitude',
      label: m.properties_field_longitude,
      type: 'number',
      default: 0
    },
    {
      key: 'cacheTtl',
      label: m.properties_field_cache_ttl,
      type: 'number',
      default: 900
    }
  ],
  'docker-status': [
    {
      key: 'dockerHost',
      label: m.properties_field_docker_host_url,
      type: 'text',
      default: '',
      placeholder: () => 'http://10.0.0.1:2375'
    },
    {
      key: 'hideOffline',
      label: m.properties_field_hide_offline,
      type: 'checkbox',
      default: false
    },
    {
      key: 'columns',
      label: m.properties_field_columns,
      type: 'number',
      default: 2
    }
  ],
  deepseek: [
    {
      key: 'authToken',
      label: m.properties_field_auth_token,
      type: 'password',
      default: ''
    },
    refreshInterval(600)
  ],
  chatgpt: [
    {
      key: 'interface',
      label: m.properties_field_interface,
      type: 'select',
      default: 'medium',
      options: displaySizes
    },
    {
      key: 'authToken',
      label: m.properties_field_auth_token,
      type: 'password',
      default: ''
    },
    refreshInterval(600)
  ],
  claude: [
    {
      key: 'provider',
      label: m.properties_field_provider,
      type: 'select',
      default: 'claude.ai',
      options: [
        { label: m.properties_option_claude_session, value: 'claude.ai' },
        { label: m.properties_option_api_key, value: 'api' }
      ]
    },
    {
      key: 'authToken',
      label: m.properties_field_auth_token,
      type: 'password',
      default: ''
    },
    refreshInterval(600)
  ],
  'service-status': [
    {
      key: 'dockerHost',
      label: m.properties_field_docker_host_url,
      type: 'text',
      default: '',
      placeholder: () => 'http://10.0.0.1:2375'
    },
    {
      key: 'hideOffline',
      label: m.properties_field_hide_offline,
      type: 'checkbox',
      default: false
    }
  ],
  stack: [
    {
      key: 'interface',
      label: m.properties_field_interface,
      type: 'select',
      default: 'medium',
      options: displaySizes
    },
    {
      key: 'flow',
      label: m.properties_field_flow_direction,
      type: 'select',
      default: 'vertical',
      options: [
        { label: m.properties_option_vertical, value: 'vertical' },
        { label: m.properties_option_horizontal, value: 'horizontal' }
      ]
    },
    {
      key: 'cols',
      label: m.properties_field_columns,
      type: 'number',
      default: 2
    },
    { key: 'rows', label: m.properties_field_rows, type: 'number', default: 0 },
    { key: 'gap', label: m.properties_field_gap, type: 'number', default: 12 }
  ],
  website: [
    {
      key: 'url',
      label: m.properties_field_url,
      type: 'text',
      default: '',
      placeholder: () => 'https://example.com'
    }
  ],
  fetch: [
    { key: 'url', label: m.properties_field_url, type: 'text', default: '' },
    {
      key: 'method',
      label: m.properties_field_method,
      type: 'select',
      default: 'GET',
      options: [
        { label: () => 'GET', value: 'GET' },
        { label: () => 'POST', value: 'POST' },
        { label: () => 'PUT', value: 'PUT' },
        { label: () => 'DELETE', value: 'DELETE' }
      ]
    },
    {
      key: 'headers',
      label: m.properties_field_headers,
      type: 'textarea',
      default: '[]',
      rows: 3
    },
    {
      key: 'body',
      label: m.properties_field_body,
      type: 'textarea',
      default: '',
      rows: 4
    },
    {
      key: 'formatScript',
      label: m.properties_field_format_script,
      type: 'textarea',
      default: 'return responseText',
      rows: 6
    },
    refreshInterval(600)
  ],
  stock: [
    {
      key: 'stocks',
      label: m.properties_field_stocks,
      type: 'textarea',
      default: 'SPY\nAAPL\nNVDA',
      rows: 6
    },
    {
      key: 'sortBy',
      label: m.properties_field_sort_by,
      type: 'select',
      default: 'default',
      options: [
        { label: m.properties_option_default_order, value: 'default' },
        { label: m.properties_option_change_percent, value: 'change' },
        {
          label: m.properties_option_absolute_change_percent,
          value: 'absolute-change'
        }
      ]
    },
    {
      key: 'cacheTime',
      label: m.properties_field_cache_time,
      type: 'number',
      default: 300
    },
    refreshInterval(300)
  ],
  rss: [
    {
      key: 'feeds',
      label: m.properties_field_feeds,
      type: 'textarea',
      default: '[]',
      rows: 6
    },
    {
      key: 'style',
      label: m.properties_field_style,
      type: 'select',
      default: 'vertical-list',
      options: [
        { label: m.properties_option_vertical_list, value: 'vertical-list' },
        { label: m.properties_option_detailed_list, value: 'detailed-list' },
        {
          label: m.properties_option_horizontal_cards,
          value: 'horizontal-cards'
        }
      ]
    },
    {
      key: 'limit',
      label: m.properties_field_max_articles,
      type: 'number',
      default: 25
    },
    {
      key: 'collapseAfter',
      label: m.properties_field_collapse_after,
      type: 'number',
      default: 5
    },
    {
      key: 'singleLineTitles',
      label: m.properties_field_single_line_titles,
      type: 'checkbox',
      default: false
    },
    {
      key: 'preserveOrder',
      label: m.properties_field_preserve_order,
      type: 'checkbox',
      default: false
    },
    refreshInterval(600)
  ],
  'github-repo': [
    {
      key: 'repo',
      label: m.properties_field_repository,
      type: 'text',
      default: ''
    },
    {
      key: 'showStars',
      label: m.properties_field_show_stars,
      type: 'checkbox',
      default: true
    },
    {
      key: 'showForks',
      label: m.properties_field_show_forks,
      type: 'checkbox',
      default: true
    },
    {
      key: 'showPrs',
      label: m.properties_field_show_open_prs,
      type: 'checkbox',
      default: true
    },
    {
      key: 'showIssues',
      label: m.properties_field_show_open_issues,
      type: 'checkbox',
      default: true
    },
    refreshInterval(3600)
  ],
  'youtube-live': [
    {
      key: 'mode',
      label: m.properties_field_mode,
      type: 'select',
      default: 'uploads',
      options: [
        { label: m.properties_option_newest_uploads, value: 'uploads' },
        { label: m.properties_option_livestream, value: 'livestream' }
      ]
    },
    {
      key: 'channels',
      label: m.properties_field_channel_ids,
      type: 'textarea',
      default: '',
      rows: 4,
      placeholder: () => 'UCXuqSBlHAE6Xw...'
    },
    {
      key: 'flow',
      label: m.properties_field_flow_direction,
      type: 'select',
      default: 'vertical',
      options: [
        { label: m.properties_option_vertical, value: 'vertical' },
        { label: m.properties_option_horizontal, value: 'horizontal' }
      ]
    },
    {
      key: 'cols',
      label: m.properties_field_columns,
      type: 'number',
      default: 2
    },
    { key: 'rows', label: m.properties_field_rows, type: 'number', default: 0 },
    {
      key: 'limit',
      label: m.properties_field_max_videos,
      type: 'number',
      default: 10
    }
  ],
  timer: [
    {
      key: 'interface',
      label: m.properties_field_interface,
      type: 'select',
      default: 'medium',
      options: displaySizes
    },
    {
      key: 'showSeconds',
      label: m.properties_field_show_seconds,
      type: 'checkbox',
      default: false
    },
    {
      key: 'showDate',
      label: m.properties_field_show_date,
      type: 'checkbox',
      default: true
    },
    {
      key: 'showGreeting',
      label: m.properties_field_show_greeting,
      type: 'checkbox',
      default: true
    },
    {
      key: 'hour12',
      label: m.properties_field_12_hour,
      type: 'checkbox',
      default: false
    },
    {
      key: 'timezone',
      label: m.properties_field_timezone,
      type: 'text',
      default: '',
      placeholder: m.properties_placeholder_timezone
    }
  ]
}
