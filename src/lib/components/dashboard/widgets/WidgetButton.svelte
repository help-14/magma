<script>
  import DashboardIcon from '../DashboardIcon.svelte';
  let { widget, compact = false } = $props();
</script>

<a
  class="button-widget relative flex items-center justify-center gap-2.5 w-full h-full overflow-hidden p-3 rounded-lg text-magma-text text-center no-underline transition-all duration-150 hover:bg-magma-accent/14 hover:text-[#fff7df] hover:shadow-[0_10px_24px_rgb(0_0_0/20%)] active:bg-magma-accent/24 active:shadow-[0_4px_12px_rgb(0_0_0/20%)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-magma-accent focus-visible:outline-offset-2"
  href={widget.config?.url || '#'}
  target="_blank"
  rel="noreferrer"
>
  <DashboardIcon
    name={widget.config?.icon}
    color={widget.config?.iconColor}
    size={compact ? 20 : 26}
    title={widget.title}
  />
  <span class="overflow-hidden text-ellipsis whitespace-nowrap">{widget.title}</span>
</a>
