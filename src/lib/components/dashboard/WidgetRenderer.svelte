<script>
  // @ts-nocheck
  import WidgetTimer from './widgets/WidgetTimer.svelte';
  import WidgetWeather from './widgets/WidgetWeather.svelte';
  import WidgetSearch from './widgets/WidgetSearch.svelte';
  import WidgetButton from './widgets/WidgetButton.svelte';
  import WidgetCalendar from './widgets/WidgetCalendar.svelte';
  import WidgetDockerStatus from './widgets/WidgetDockerStatus.svelte';
  import WidgetFetch from './widgets/WidgetFetch.svelte';
  import WidgetDeepSeek from './widgets/WidgetDeepSeek.svelte';
  import WidgetStack from './widgets/WidgetStack.svelte';
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
    'deepseek': WidgetDeepSeek,
    'stack-horizontal': WidgetStack,
    'stack-vertical': WidgetStack,
  };

  let Cmp = $derived(map[widget.type] ?? WidgetFallback);
</script>

<Cmp {widget} {...rest} />
