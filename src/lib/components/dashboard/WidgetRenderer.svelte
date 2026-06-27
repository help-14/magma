<script>
  // @ts-nocheck
  import WidgetTimer from './widgets/WidgetTimer.svelte';
  import WidgetWeather from './widgets/WidgetWeather.svelte';
  import WidgetSearch from './widgets/WidgetSearch.svelte';
  import WidgetButton from './widgets/WidgetButton.svelte';
  import WidgetCalendar from './widgets/WidgetCalendar.svelte';
  import WidgetDockerStatus from './widgets/WidgetDockerStatus.svelte';
  import WidgetFetch from './widgets/WidgetFetch.svelte';
  import WidgetWebsite from './widgets/WidgetWebsite.svelte';
  import WidgetDeepSeek from './widgets/WidgetDeepSeek.svelte';
  import WidgetYoutube from './widgets/WidgetYoutube.svelte';
  import WidgetStack from './widgets/WidgetStack.svelte';
  import WidgetRss from './widgets/WidgetRss.svelte';
  import WidgetStock from './widgets/WidgetStock.svelte';
  import WidgetFallback from './widgets/WidgetFallback.svelte';

  /** @type {import('$lib/types/widget.js').WidgetRendererProps} */
  let { widget, ...rest } = $props();

  const map = {
    timer: WidgetTimer,
    weather: WidgetWeather,
    search: WidgetSearch,
    button: WidgetButton,
    calendar: WidgetCalendar,
    'docker-status': WidgetDockerStatus,
    'service-status': WidgetDockerStatus,
    'fetch': WidgetFetch,
    'website': WidgetWebsite,
    'deepseek': WidgetDeepSeek,
    'youtube-live': WidgetYoutube,
    'stack': WidgetStack,
    'stack-horizontal': WidgetStack,
    'stack-vertical': WidgetStack,
    'rss': WidgetRss,
    'stock': WidgetStock,
  };

  let Cmp = $derived(map[widget.type] ?? WidgetFallback);
</script>

<Cmp {widget} {...rest} />
