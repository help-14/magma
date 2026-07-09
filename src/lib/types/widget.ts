import type {
  ButtonConfig,
  ClockConfig,
  DeepSeekConfig,
  DockerStatusConfig,
  GithubRepoConfig,
  RssWidgetConfig,
  SearchConfig,
  StackConfig,
  StockConfig,
  WeatherConfig,
  WidgetConfig,
  YoutubeConfig
} from './config.js'
import type { Grid, Selection } from './grid.js'

export type WidgetType =
  | 'button'
  | 'search'
  | 'timer'
  | 'weather'
  | 'calendar'
  | 'stack-horizontal'
  | 'stack-vertical'
  | 'docker-status'
  | 'service-status'
  | 'fetch'
  | 'deepseek'
  | 'website'
  | 'youtube-live'
  | 'stack'
  | 'rss'
  | 'stock'
  | 'github-repo'
  | 'honeygain'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  x?: number
  y?: number
  w?: number
  h?: number
  config?: WidgetConfig
  children?: Widget[]
}

export type Locations = Record<string, { latitude: number; longitude: number }>
export type TypedWidget<TConfig> = Omit<Widget, 'config'> & { config?: TConfig }

export interface BaseWidgetProps {
  widget: Widget
  compact?: boolean
}

export interface ButtonWidgetProps {
  widget: TypedWidget<ButtonConfig>
  compact?: boolean
}

export interface SearchWidgetProps {
  widget: TypedWidget<SearchConfig>
  compact?: boolean
}

export interface WeatherWidgetProps {
  widget: TypedWidget<WeatherConfig>
  compact?: boolean
  locations?: Locations
}

export interface StackWidgetProps {
  widget: TypedWidget<StackConfig>
  compact?: boolean
  locations?: Locations
  editMode?: boolean
  selectedChildId?: string | null
  onSelectChild?: (event: Event, child: Widget) => void
  onDeleteChild?: (event: Event, child: Widget) => void
  onDropChild?: (event: DragEvent) => void
  onDragOverChild?: (event: DragEvent) => void
  onReorderChild?: (stackId: string, childId: string, targetIndex: number) => void
}

export interface DockerStatusWidgetProps {
  widget: TypedWidget<DockerStatusConfig>
  compact?: boolean
}

export interface TimerWidgetProps {
  widget: TypedWidget<ClockConfig>
  compact?: boolean
}

export type CalendarWidgetProps = BaseWidgetProps

export interface DeepSeekWidgetProps {
  widget: TypedWidget<DeepSeekConfig>
  compact?: boolean
}

export interface YoutubeWidgetProps {
  widget: TypedWidget<YoutubeConfig>
  compact?: boolean
}

export interface StockWidgetProps {
  widget: TypedWidget<StockConfig>
  compact?: boolean
}

export interface RssWidgetProps {
  widget: TypedWidget<RssWidgetConfig>
  compact?: boolean
}

export interface GithubRepoWidgetProps {
  widget: TypedWidget<GithubRepoConfig>
  compact?: boolean
}

export type FallbackWidgetProps = BaseWidgetProps

export interface WidgetRendererProps {
  widget: Widget
  compact?: boolean
  editMode?: boolean
  locations?: Locations
  selectedChildId?: string | null
  onSelectChild?: (event: Event, child: Widget) => void
  onDeleteChild?: (event: Event, child: Widget) => void
  onDropChild?: (event: DragEvent) => void
  onDragOverChild?: (event: DragEvent) => void
  onReorderChild?: (stackId: string, childId: string, targetIndex: number) => void
}

export interface WidgetTemplate {
  title: string
  w: number
  h: number
  type: WidgetType | string
  config?: WidgetConfig
}

export interface WidgetPaletteProps {
  templates?: WidgetTemplate[]
  onClose?: () => void
  onDragStart?: (event: DragEvent, template: WidgetTemplate) => void
  onDragEnd?: (event: DragEvent) => void
}

export interface IconPickerProps {
  value?: string
  onSelect?: (icon: string) => void
}

export interface DashboardIconProps {
  name?: string
  size?: number
  title?: string
  color?: string
}

export interface PropertyPanelProps {
  grid: Grid
  gridRows: number
  selected: Selection | null
  widget: Widget
  onClose?: () => void
  onUpdate?: (patch: Partial<Widget>) => void
  onUpdateConfig?: (key: string, value: string | boolean | number) => void
  onUpdateNumber?: (key: string, value: string) => void
}
