import { getContext, setContext } from 'svelte'

type RefreshHandler = () => void | Promise<void>

type RefreshContext = {
  registerRefresh: (widgetId: string, handler: RefreshHandler | null) => void
}

const key = Symbol('widget-refresh')

export function setWidgetRefreshContext(context: RefreshContext) {
  setContext(key, context)
}

export function getWidgetRefreshContext() {
  return getContext<RefreshContext | undefined>(key)
}
