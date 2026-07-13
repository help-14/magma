<script lang="ts">
  import { browser } from '$app/environment'
  import {
    Star,
    GitFork,
    GitPullRequest,
    CircleAlert,
    ExternalLink,
    ChevronRight
  } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { ErrorCode, toErrorMessage } from '$lib/errors.js'
  import { fetchGithubRepo } from '$lib/remotes/github.remote.js'
  import { getWidgetRefreshContext } from '$lib/components/dashboard/widget-refresh-context.js'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'
  import type { GithubRepoWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: GithubRepoWidgetProps = $props()
  const refreshContext = getWidgetRefreshContext()

  let widgetState: 'idle' | 'loading' | 'error' | 'content' = $state('idle')
  let errorMsg = $state('')
  let data: any = $state(null)

  let repo = $derived((widget.config?.repo || '').trim())
  let hasConfig = $derived(repo.length > 0)
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 3600)

  let showStars = $derived(widget.config?.showStars !== false)
  let showForks = $derived(widget.config?.showForks !== false)
  let showPrs = $derived(widget.config?.showPrs !== false)
  let showIssues = $derived(widget.config?.showIssues !== false)

  async function doFetch() {
    if (!hasConfig) return
    widgetState = 'loading'
    errorMsg = ''
    try {
      data = await fetchGithubRepo({ repo })
      widgetState = 'content'
    } catch (err) {
      widgetState = 'error'
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === ErrorCode.REPO_NOT_FOUND) {
        errorMsg = m.error_repo_not_found({ repo })
      } else {
        errorMsg = toErrorMessage(msg)
      }
    }
  }

  $effect(() => {
    if (!browser || !hasConfig) {
      widgetState = 'idle'
      data = null
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })

  $effect(() => {
    refreshContext?.registerRefresh(widget.id, doFetch)
    return () => refreshContext?.registerRefresh(widget.id, null)
  })
</script>

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full overflow-hidden"
>
  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage={m.widget_state_configure()}
  >
    {#snippet children()}
      {#if data}
        {#if data.description}
          <div class="flex items-center gap-2 px-3 pb-1 text-xs text-muted-foreground">
            <span class="truncate">{data.description}</span>
            {#if data.htmlUrl}
              <a
                href={data.htmlUrl}
                target="_blank"
                rel="noreferrer"
                class="text-muted-foreground hover:text-accent shrink-0"
              >
                <ExternalLink class="size-3" />
              </a>
            {/if}
          </div>
        {/if}
        {#if data.language}
          <div class="px-3 pb-2">
            <span
              class="inline-block px-2 py-0.5 text-xs rounded-full bg-secondary text-foreground"
            >
              {data.language}
            </span>
          </div>
        {/if}
        <div class="flex items-center gap-2 px-2 pb-2 shrink-0">
          {#if showStars}
            <div
              class="flex items-center gap-1 bg-secondary rounded-lg px-2.5 py-1.5"
            >
              <Star class="size-3.5 text-yellow-500" />
              <span class="text-xs font-bold text-foreground">{data.stars}</span
              >
            </div>
          {/if}
          {#if showForks}
            <div
              class="flex items-center gap-1 bg-secondary rounded-lg px-2.5 py-1.5"
            >
              <GitFork class="size-3.5 text-accent" />
              <span class="text-xs font-bold text-foreground">{data.forks}</span
              >
            </div>
          {/if}
        </div>
        <div class="flex-1 overflow-y-auto min-h-0 px-2 pb-2 space-y-1.5">
          {#if showPrs && data.pulls?.length > 0}
            <div
              class="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1"
            >
              <GitPullRequest class="size-3.5 text-green-400" />
              <span>{m.github_pull_requests()}</span>
              <span class="text-muted-foreground font-normal"
                >({data.openPrs})</span
              >
            </div>
            {#each data.pulls.slice(0, 5) as pr (pr.htmlUrl)}
              <a
                href={pr.htmlUrl}
                target="_blank"
                rel="noreferrer"
                class="flex items-start gap-1.5 px-2 py-1 rounded hover:bg-secondary text-xs text-foreground no-underline"
              >
                <ChevronRight
                  class="size-3 text-muted-foreground mt-0.5 shrink-0"
                />
                <span class="line-clamp-1">{pr.title}</span>
              </a>
            {/each}
          {/if}
          {#if showIssues && data.issues?.length > 0}
            <div
              class="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1 mt-2"
            >
              <CircleAlert class="size-3.5 text-orange-400" />
              <span>{m.github_issues()}</span>
              <span class="text-muted-foreground font-normal"
                >({data.openIssues})</span
              >
            </div>
            {#each data.issues.slice(0, 5) as issue (issue.htmlUrl)}
              <a
                href={issue.htmlUrl}
                target="_blank"
                rel="noreferrer"
                class="flex items-start gap-1.5 px-2 py-1 rounded hover:bg-secondary text-xs text-foreground no-underline"
              >
                <ChevronRight
                  class="size-3 text-muted-foreground mt-0.5 shrink-0"
                />
                <span class="line-clamp-1">{issue.title}</span>
              </a>
            {/each}
          {/if}
          {#if showPrs && data.pulls?.length === 0 && showIssues && data.issues?.length === 0}
            <div
              class="flex items-center justify-center h-full text-muted-foreground text-xs"
            >
              {m.github_no_open()}
            </div>
          {/if}
        </div>
      {/if}
    {/snippet}
  </WidgetStateWrapper>

</div>
