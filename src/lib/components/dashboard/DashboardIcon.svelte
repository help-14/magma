<script lang="ts">
  import {
    CalendarDays,
    CloudSun,
    Container,
    ExternalLink,
    Film,
    Image,
    Play,
    Search,
    Server,
    Settings,
    Timer,
    Tv
  } from '@lucide/svelte'
  import type { Component } from 'svelte'
  import type { DashboardIconProps } from '$lib/types/widget.js'

  let {
    name = '',
    size = 24,
    title = '',
    color = ''
  }: DashboardIconProps = $props()

  const localIcons: Record<string, Component<any>> = {
    calendar: CalendarDays,
    docker: Container,
    film: Film,
    image: Image,
    play: Play,
    search: Search,
    server: Server,
    settings: Settings,
    storage: Server,
    timer: Timer,
    tv: Tv,
    weather: CloudSun,
    youtube: Play
  }

  let iconName = $derived(String(name || '').trim())
  let isIconify = $derived(/^[a-z0-9-]+:[a-z0-9-]+$/i.test(iconName))
  let Icon = $derived(localIcons[iconName] || ExternalLink)
  let src = $derived(
    isIconify
      ? `https://api.iconify.design/${encodeURIComponent(iconName).replace('%3A', '/')}.svg`
      : ''
  )
  let iconSize = $derived(Number(size) || 24)
  let iconStyle = $derived(color ? `color: ${color};` : '')
  let remoteIconStyle = $derived(
    `${iconStyle} width: ${iconSize}px; height: ${iconSize}px; mask-image: url("${src}"); -webkit-mask-image: url("${src}");`
  )
</script>

{#if isIconify}
  <span
    class="dashboard-icon remote-icon"
    style={remoteIconStyle}
    role={title ? 'img' : undefined}
    aria-label={title || undefined}
    aria-hidden={title ? undefined : 'true'}
  ></span>
{:else}
  <Icon
    class="dashboard-icon"
    style={iconStyle}
    {size}
    aria-hidden={title ? undefined : 'true'}
  />
{/if}
