<script>
  // @ts-nocheck
  import { browser } from '$app/environment'
  import {
    Star,
    GitFork,
    GitPullRequest,
    CircleAlert,
    ExternalLink,
    ChevronRight
  } from '@lucide/svelte'
  import { fetchGithubRepo } from '$lib/remotes/github.remote.js'
  import WidgetTitleBar from './WidgetTitleBar.svelte'
  import WidgetRefreshButton from './WidgetRefreshButton.svelte'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'

  /** @type {import('$lib/types/widget.js').GithubRepoWidgetProps} */
  let { widget, compact = false } = $props()

  let state = $state('idle')
  let errorMsg = $state('')
  let data = $state(null)

  let repo = $derived((widget.config?.repo || '').trim())
  let hasConfig = $derived(repo.length > 0)
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 3600)

  let showStars = $derived(widget.config?.showStars !== false)
  let showForks = $derived(widget.config?.showForks !== false)
  let showPrs = $derived(widget.config?.showPrs !== false)
  let showIssues = $derived(widget.config?.showIssues !== false)

  async function doFetch() {
    if (!hasConfig) return
    state = 'loading'
    errorMsg = ''
    try {
      data = await fetchGithubRepo({ repo })
      state = 'content'
    } catch (err) {
      state = 'error'
      errorMsg = err.message || String(err)
    }
  }

  $effect(() => {
    if (!browser || !hasConfig) {
      state = 'idle'
      data = null
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })
</script>

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full overflow-hidden"
>
  <WidgetTitleBar title={widget.title}>
    {#snippet trailing()}
      {#if data?.htmlUrl}
        <a
          href={data.htmlUrl}
          target="_blank"
          rel="noreferrer"
          class="text-magma-muted hover:text-magma-accent"
        >
          <ExternalLink class="size-3" />
        </a>
      {/if}
    {/snippet}
  </WidgetTitleBar>

  <WidgetStateWrapper
    {state}
    {errorMsg}
    idleMessage="Configure repo in properties"
  >
    {#snippet children()}
      {#if data}
        {#if data.description}
          <div class="px-3 pb-1 text-xs text-magma-muted truncate">
            {data.description}
          </div>
        {/if}
        {#if data.language}
          <div class="px-3 pb-2">
            <span
              class="inline-block px-2 py-0.5 text-xs rounded-full bg-magma-surface text-magma-foreground"
            >
              {data.language}
            </span>
          </div>
        {/if}
        <div class="flex items-center gap-2 px-2 pb-2 shrink-0">
          {#if showStars}
            <div
              class="flex items-center gap-1 bg-magma-surface rounded-lg px-2.5 py-1.5"
            >
              <Star class="size-3.5 text-yellow-500" />
              <span class="text-xs font-bold text-magma-foreground"
                >{data.stars}</span
              >
            </div>
          {/if}
          {#if showForks}
            <div
              class="flex items-center gap-1 bg-magma-surface rounded-lg px-2.5 py-1.5"
            >
              <GitFork class="size-3.5 text-magma-accent" />
              <span class="text-xs font-bold text-magma-foreground"
                >{data.forks}</span
              >
            </div>
          {/if}
        </div>
        <div class="flex-1 overflow-y-auto min-h-0 px-2 pb-2 space-y-1.5">
          {#if showPrs && data.pulls?.length > 0}
            <div
              class="flex items-center gap-1.5 text-xs font-bold text-magma-foreground mb-1"
            >
              <GitPullRequest class="size-3.5 text-green-400" />
              <span>Pull Requests</span>
              <span class="text-magma-muted font-normal">({data.openPrs})</span>
            </div>
            {#each data.pulls.slice(0, 5) as pr}
              <a
                href={pr.htmlUrl}
                target="_blank"
                rel="noreferrer"
                class="flex items-start gap-1.5 px-2 py-1 rounded hover:bg-magma-surface text-xs text-magma-foreground no-underline"
              >
                <ChevronRight class="size-3 text-magma-muted mt-0.5 shrink-0" />
                <span class="line-clamp-1">{pr.title}</span>
              </a>
            {/each}
          {/if}
          {#if showIssues && data.issues?.length > 0}
            <div
              class="flex items-center gap-1.5 text-xs font-bold text-magma-foreground mb-1 mt-2"
            >
              <CircleAlert class="size-3.5 text-orange-400" />
              <span>Issues</span>
              <span class="text-magma-muted font-normal"
                >({data.openIssues})</span
              >
            </div>
            {#each data.issues.slice(0, 5) as issue}
              <a
                href={issue.htmlUrl}
                target="_blank"
                rel="noreferrer"
                class="flex items-start gap-1.5 px-2 py-1 rounded hover:bg-magma-surface text-xs text-magma-foreground no-underline"
              >
                <ChevronRight class="size-3 text-magma-muted mt-0.5 shrink-0" />
                <span class="line-clamp-1">{issue.title}</span>
              </a>
            {/each}
          {/if}
          {#if showPrs && data.pulls?.length === 0 && showIssues && data.issues?.length === 0}
            <div
              class="flex items-center justify-center h-full text-magma-muted text-xs"
            >
              No open PRs or issues
            </div>
          {/if}
        </div>
      {/if}
    {/snippet}
  </WidgetStateWrapper>

  <WidgetRefreshButton onclick={doFetch} />
</div>
