export interface ButtonConfig {
	urls?: string
	openIn?: '_self' | '_blank' | '_window'
	icon?: string
	iconColor?: string
}

export interface SearchConfig {
	placeholder?: string
	provider?: string
}

export interface WeatherConfig {
	provider?: 'open-meteo' | 'weatherapi' | 'openweathermap'
	apiKey?: string
	cityName?: string
	latitude?: number
	longitude?: number
	cacheTtl?: number
}

export interface DockerStatusConfig {
	dockerHost?: string
	hideOffline?: boolean
	columns?: number
	refreshInterval?: number
}

export interface StackConfig {
	flow?: string
	cols?: number
	rows?: number
	gap?: number
}

export interface FetchConfig {
	url?: string
	method?: string
	headers?: string
	body?: string
	formatScript?: string
	refreshInterval?: number
}

export interface WebsiteConfig {
	url?: string
}

export interface DeepSeekConfig {
	authToken?: string
	refreshInterval?: number
}

export interface YoutubeConfig {
	mode?: string
	channels?: string
	flow?: string
	cols?: number
	rows?: number
	limit?: number
	refreshInterval?: number
}

export interface StockConfig {
	stocks?: string
	sortBy?: string
	refreshInterval?: number
	cacheTime?: number
}

export interface RssWidgetConfig {
	feeds?: string
	style?: string
	limit?: number
	collapseAfter?: number
	singleLineTitles?: boolean
	preserveOrder?: boolean
	refreshInterval?: number
}

export interface GithubRepoConfig {
	repo: string
	showStars?: boolean
	showForks?: boolean
	showPrs?: boolean
	showIssues?: boolean
	refreshInterval?: number
}

export interface ClockConfig {
	showSeconds?: boolean
	showDate?: boolean
	showGreeting?: boolean
	hour12?: boolean
	timezone?: string
}

export type WidgetConfig = Record<string, any>

export type ConfigFieldType =
	| 'text'
	| 'number'
	| 'color'
	| 'icon-picker'
	| 'checkbox'
	| 'select'
	| 'textarea'
	| 'password'

export interface ConfigFieldDescriptor {
	key: string
	label: string
	type: ConfigFieldType
	default: string | number | boolean
	placeholder?: string
	options?: { label: string; value: string }[]
	rows?: number
}
