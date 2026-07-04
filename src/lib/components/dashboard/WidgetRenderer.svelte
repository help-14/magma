<script lang="ts">
  import WidgetTimer from './widgets/WidgetTimer.svelte'
  import WidgetWeather from './widgets/WidgetWeather.svelte'
  import WidgetSearch from './widgets/WidgetSearch.svelte'
  import WidgetButton from './widgets/WidgetButton.svelte'
  import WidgetCalendar from './widgets/WidgetCalendar.svelte'
  import WidgetDockerStatus from './widgets/WidgetDockerStatus.svelte'
  import WidgetFetch from './widgets/WidgetFetch.svelte'
  import WidgetWebsite from './widgets/WidgetWebsite.svelte'
  import WidgetDeepSeek from './widgets/WidgetDeepSeek.svelte'
  import WidgetYoutube from './widgets/WidgetYoutube.svelte'
  import WidgetStack from './widgets/WidgetStack.svelte'
  import WidgetRss from './widgets/WidgetRss.svelte'
  import WidgetStock from './widgets/WidgetStock.svelte'
  import WidgetGithubRepo from './widgets/WidgetGithubRepo.svelte'
  import WidgetFallback from './widgets/WidgetFallback.svelte'
  import type { Component } from 'svelte'
  import type { WidgetRendererProps } from '$lib/types/widget.js'

  let { widget, ...rest }: WidgetRendererProps = $props()

  const map: Record<string, Component<any>> = {
    timer: WidgetTimer,
    weather: WidgetWeather,
    search: WidgetSearch,
    button: WidgetButton,
    calendar: WidgetCalendar,
    'docker-status': WidgetDockerStatus,
    'service-status': WidgetDockerStatus,
    fetch: WidgetFetch,
    website: WidgetWebsite,
    deepseek: WidgetDeepSeek,
    'youtube-live': WidgetYoutube,
    stack: WidgetStack,
    'stack-horizontal': WidgetStack,
    'stack-vertical': WidgetStack,
    rss: WidgetRss,
    stock: WidgetStock,
    'github-repo': WidgetGithubRepo
  }

  let Cmp = $derived(map[widget.type] ?? WidgetFallback)
</script>

<Cmp {widget} {...rest} />
