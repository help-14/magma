<script lang="ts">
  import { ArrowLeft, Save, Fingerprint } from '@lucide/svelte'
  import { invalidateAll } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import * as Tabs from '$lib/components/ui/tabs/index.js'
  import CodeEditor from '$lib/components/settings/CodeEditor.svelte'
  import PasskeySetup from '$lib/components/settings/PasskeySetup.svelte'
  import {
    saveCssOverride,
    saveDashboardSettings,
    saveSystemSettings
  } from '$lib/remotes/settings.remote.js'
  import { authenticateBegin } from '$lib/remotes/passkey.remote.js'

  let { data }: { data: any } = $props()

  let activeTab = $state('system')
  let systemYaml = $state(data.systemYaml)
  let cellWidth = $state(
    data.systemConfig.system?.dashboardGrid?.cellWidth || 100
  )
  let cellHeight = $state(
    data.systemConfig.system?.dashboardGrid?.cellHeight || 100
  )
  let dashboardYaml = $state(data.yaml)
  let backgroundImage = $state(data.config.theme?.backgroundImage || '/bg.jpg')
  let customCss = $state(data.customCss || '')
  let saving = $state(false)
  let language = $state(data.systemConfig.language || 'en')
  let title = $state(data.systemConfig.title || 'Magma')
  let isAuthenticated = $derived(data.isAuthenticated)
  let passkeyCount = $derived(data.passkeyCount)
  let authenticating = $state(false)
  let showGate = $derived(passkeyCount > 0 && !isAuthenticated)

  let highlightedSystemYaml = $derived(highlightYaml(systemYaml))
  let highlightedDashboardYaml = $derived(highlightYaml(dashboardYaml))
  let highlightedCss = $derived(highlightCss(customCss))

  let tabs = $derived([
    { id: 'system', label: m.settings_system() },
    { id: 'dashboard', label: m.settings_dashboard() },
    { id: 'css', label: m.settings_css() },
    { id: 'security', label: 'Security' }
  ])

  function inputValue(event: Event) {
    return (event.currentTarget as HTMLInputElement | HTMLSelectElement).value
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
  }

  function base64urlToBufferSource(base64url: string): BufferSource {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(base64 + padding)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes as BufferSource
  }

  function highlightYaml(source: string) {
    return source
      .split('\n')
      .map((line: string) => {
        const escaped = escapeHtml(line)
        const commentIndex = escaped.indexOf('#')
        const content =
          commentIndex >= 0 ? escaped.slice(0, commentIndex) : escaped
        const comment = commentIndex >= 0 ? escaped.slice(commentIndex) : ''
        const highlighted = content
          .replace(
            /^(\s*-?\s*)([A-Za-z0-9_-]+)(:)/,
            '$1<span class="syntax-key">$2</span>$3'
          )
          .replace(
            /(:\s*)(\/?[^#\s][^#]*?)$/g,
            '$1<span class="syntax-value">$2</span>'
          )
          .replace(
            /\b(true|false|null)\b/g,
            '<span class="syntax-literal">$1</span>'
          )
          .replace(
            /\b(-?\d+(?:\.\d+)?)\b/g,
            '<span class="syntax-number">$1</span>'
          )
        return `${highlighted}${comment ? `<span class="syntax-comment">${comment}</span>` : ''}`
      })
      .join('\n')
  }

  function highlightCss(source: string) {
    return escapeHtml(source)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syntax-comment">$1</span>')
      .replace(
        /([.#]?[A-Za-z_-][\w-]*)(\s*\{)/g,
        '<span class="syntax-key">$1</span>$2'
      )
      .replace(/([A-Za-z-]+)(\s*:)/g, '<span class="syntax-value">$1</span>$2')
      .replace(
        /(#[0-9A-Fa-f]{3,8}|\b-?\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)?\b)/g,
        '<span class="syntax-number">$1</span>'
      )
  }

  function updateBackgroundImage(value: string) {
    backgroundImage = value
    updateSystemThemeField('backgroundImage', value || '/bg.jpg')
  }

  function updateSystemTitle(value: string) {
    title = value
    const lines = systemYaml.split('\n')
    const titleIndex = lines.findIndex((line: string) => /^title:/.test(line))
    if (titleIndex === -1) {
      lines.splice(0, 0, `title: ${value || 'Magma'}`)
    } else {
      lines.splice(titleIndex, 1, `title: ${value || 'Magma'}`)
    }
    systemYaml = lines.join('\n')
  }

  function updateSystemLanguage(value: string) {
    const lines = systemYaml.split('\n')
    const langIndex = lines.findIndex((line: string) => /^language:/.test(line))
    if (langIndex === -1) {
      lines.splice(1, 0, `language: ${value}`)
    } else {
      lines.splice(langIndex, 1, `language: ${value}`)
    }
    systemYaml = lines.join('\n')
  }

  function updateSystemGridField(key: 'cellWidth' | 'cellHeight', value: string) {
    const numberValue = Number.parseInt(value || '100', 10)
    if (key === 'cellWidth') cellWidth = numberValue
    if (key === 'cellHeight') cellHeight = numberValue

    const lines = systemYaml.split('\n')
    const fieldIndex = lines.findIndex((line: string) =>
      new RegExp(`^\\s+${key}:`).test(line)
    )
    const nextLine = `    ${key}: ${Number.isFinite(numberValue) ? numberValue : 100}`
    if (fieldIndex === -1) {
      const gridIndex = lines.findIndex((line: string) =>
        /^\s+dashboardGrid:\s*$/.test(line)
      )
      if (gridIndex === -1) {
        const systemIndex = lines.findIndex((line: string) => /^system:\s*$/.test(line))
        if (systemIndex === -1) {
          systemYaml = `version: 1\nsystem:\n  dashboardGrid:\n${nextLine}\n`
        } else {
          lines.splice(systemIndex + 1, 0, '  dashboardGrid:\n' + nextLine)
          systemYaml = lines.join('\n')
        }
      } else {
        lines.splice(gridIndex + 1, 0, nextLine)
        systemYaml = lines.join('\n')
      }
    } else {
      lines.splice(fieldIndex, 1, nextLine)
      systemYaml = lines.join('\n')
    }
  }

  function updateThemeField(key: string, value: string) {
    const lines = dashboardYaml.split('\n')
    const themeIndex = lines.findIndex((line: string) => /^theme:\s*$/.test(line))
    if (themeIndex === -1) {
      dashboardYaml = `${dashboardYaml.trimEnd()}\n\ntheme:\n${formatThemeField(key, value)}\n`
      return
    }

    const nextSectionIndex = lines.findIndex(
      (line: string, index: number) => index > themeIndex && /^\S/.test(line)
    )
    const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex
    const fieldIndex = lines.findIndex(
      (line: string, index: number) =>
        index > themeIndex &&
        index < endIndex &&
        new RegExp(`^\\s+${key}:`).test(line)
    )

    if (fieldIndex === -1) {
      lines.splice(themeIndex + 1, 0, formatThemeField(key, value))
    } else {
      lines.splice(fieldIndex, 1, formatThemeField(key, value))
    }
    dashboardYaml = lines.join('\n')
  }

  function updateSystemThemeField(key: string, value: string) {
    const lines = systemYaml.split('\n')
    const themeIndex = lines.findIndex((line: string) => /^theme:\s*$/.test(line))
    if (themeIndex === -1) {
      systemYaml = `${systemYaml.trimEnd()}\n\ntheme:\n${formatThemeField(key, value)}\n`
      return
    }

    const nextSectionIndex = lines.findIndex(
      (line: string, index: number) => index > themeIndex && /^\S/.test(line)
    )
    const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex
    const fieldIndex = lines.findIndex(
      (line: string, index: number) =>
        index > themeIndex &&
        index < endIndex &&
        new RegExp(`^\\s+${key}:`).test(line)
    )

    if (fieldIndex === -1) {
      lines.splice(themeIndex + 1, 0, formatThemeField(key, value))
    } else {
      lines.splice(fieldIndex, 1, formatThemeField(key, value))
    }
    systemYaml = lines.join('\n')
  }

  function formatThemeField(key: string, value: string) {
    return `  ${key}: ${value}`
  }

  async function save() {
    saving = true

    try {
      let result: any
      if (activeTab === 'system')
        result = await saveSystemSettings({ systemYaml })
      if (activeTab === 'dashboard')
        result = await saveDashboardSettings({ yaml: dashboardYaml })
      if (activeTab === 'css') result = await saveCssOverride({ customCss })

      if (result.systemYaml) systemYaml = result.systemYaml
      if (result.systemConfig) {
        cellWidth =
          result.systemConfig.system?.dashboardGrid?.cellWidth || cellWidth
        cellHeight =
          result.systemConfig.system?.dashboardGrid?.cellHeight || cellHeight
        backgroundImage =
          result.systemConfig.theme?.backgroundImage || backgroundImage
        title = result.systemConfig.title || 'Magma'
      }
      if (result.yaml) {
        dashboardYaml = result.yaml
        backgroundImage =
          result.config?.theme?.backgroundImage || backgroundImage
      }
      if (typeof result.customCss === 'string') customCss = result.customCss
      toast.success('Saved settings')
      if (activeTab === 'system' && result.systemConfig?.language !== data.language) {
        window.location.reload()
      }
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : String(saveError))
    } finally {
      saving = false
    }
  }

  async function handleAuthenticate() {
    if (authenticating) return
    authenticating = true
    try {
      const origin = window.location.origin
      const rpID = window.location.hostname
      const { challengeId, options } = await authenticateBegin({ origin, rpID })
      const publicKey = {
        ...options,
        challenge: base64urlToBufferSource(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: base64urlToBufferSource(cred.id)
        }))
      } as PublicKeyCredentialRequestOptions

      const assertion = await navigator.credentials.get({
        publicKey,
      }) as PublicKeyCredential | null
      if (!assertion) throw new Error('Cancelled')
      const response = await fetch('/api/auth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, credential: assertion.toJSON(), origin, rpID }),
      })
      if (!response.ok) throw new Error('Authentication failed')
      await invalidateAll()
    } catch (err) {
      if (err instanceof Error && err.message === 'Cancelled') return
      toast.error(err instanceof Error ? err.message : 'Failed to authenticate')
    } finally {
      authenticating = false
    }
  }

  function handlePasskeyChanged() {
    invalidateAll()
  }
</script>

<main
  class="relative min-h-screen p-7 overflow-x-hidden max-sm:p-4.5"
  style={`--magma-accent: ${data.config.theme?.accentColor || '#fabd2f'}; --magma-bg: url('${backgroundImage || '/bg.jpg'}');`}
>
  <div class="background"></div>
  <div class="relative z-1 w-[min(1080px,100%)] mx-auto">
    <header
      class="flex items-center justify-between gap-4.5 max-sm:flex-col max-sm:items-start"
    >
      <nav class="flex flex-row w-full">
        <Button href="/" variant="magma">
          <ArrowLeft size={18} /> {m.settings_back()}
        </Button>
        <div class="grow"></div>
        <Button
          variant="magma"
          onclick={save}
          disabled={saving}
          class="text-magma-text!"
        >
          <Save size={18} />
          {saving ? m.settings_saving() : m.editor_save()}
        </Button>
      </nav>
    </header>

    {#if showGate}
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <Fingerprint size={64} class="text-magma-accent mb-4" />
        <h2 class="text-magma-text text-lg font-bold mb-2">Verify your identity</h2>
        <p class="text-magma-muted text-sm mb-6">Use your passkey to access settings</p>
        <Button
          variant="magma"
          class="text-magma-text!"
          onclick={handleAuthenticate}
          disabled={authenticating}
        >
          {authenticating ? 'Verifying...' : 'Use Passkey'}
        </Button>
      </div>
    {:else}
      <Tabs.Root bind:value={activeTab}>
        <Tabs.List class="flex flex-wrap gap-3 mt-6 bg-transparent">
          {#each tabs as tab (tab.id)}
            <Tabs.Trigger
              value={tab.id}
              class="inline-flex items-center justify-center gap-2 min-h-10 px-3.5 border border-magma-line rounded-lg bg-magma-panel text-magma-text! backdrop-blur-md cursor-pointer transition-all duration-140 hover:border-magma-accent/48 hover:bg-magma-accent/18 hover:shadow-[0_10px_26px_rgb(0_0_0/24%),0_0_0_1px_rgb(250_189_47/14%)] hover:-translate-y-0.5 active:shadow-[0_4px_12px_rgb(0_0_0/22%)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-magma-accent focus-visible:outline-offset-2 data-active:border-magma-accent/48 data-active:bg-magma-accent/40 data-active:hover:bg-magma-accent/96"
            >{tab.label}</Tabs.Trigger
            >
          {/each}
        </Tabs.List>

        <Tabs.Content value="system">
          <section
            class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-2 max-lg:grid-cols-1"
          >
            <CodeEditor
              bind:value={systemYaml}
              highlighted={highlightedSystemYaml}
              label="System YAML"
            />
            <aside
              class="border border-magma-line rounded-lg bg-magma-panel shadow-[0_18px_60px_rgb(0_0_0/24%)] backdrop-blur-xl p-4 text-magma-muted"
            >
              <h2 class="text-magma-text text-base m-0 mb-2.5">
                {m.settings_system()}
              </h2>
              <p>{@html m.settings_system_desc()}</p>
              <Label class="grid gap-2 mt-4">
                <span class="text-magma-accent text-xs font-bold uppercase"
                  >Title</span
                >
                <Input
                  value={title}
                  placeholder="Magma"
                  class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                  oninput={(event: Event) =>
                    updateSystemTitle(inputValue(event))}
                />
              </Label>
              <div class="grid grid-cols-2 gap-3">
                <Label class="grid gap-2 mt-4">
                  <span class="text-magma-accent text-xs font-bold uppercase"
                    >{m.settings_cell_width()}</span
                  >
                  <Input
                    type="number"
                    min="1"
                    value={cellWidth}
                    class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                    oninput={(event: Event) =>
                      updateSystemGridField(
                        'cellWidth',
                        inputValue(event)
                      )}
                  />
                </Label>
                <Label class="grid gap-2 mt-4">
                  <span class="text-magma-accent text-xs font-bold uppercase"
                    >{m.settings_cell_height()}</span
                  >
                  <Input
                    type="number"
                    min="1"
                    value={cellHeight}
                    class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                    oninput={(event: Event) =>
                      updateSystemGridField(
                        'cellHeight',
                        inputValue(event)
                      )}
                  />
                </Label>
                <Label class="grid col-span-2 gap-2 mt-4">
                  <span class="text-magma-accent text-xs font-bold uppercase"
                    >{m.settings_bg_image()}</span
                  >
                  <Input
                    value={backgroundImage}
                    placeholder="/bg.jpg"
                    class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                    oninput={(event: Event) =>
                      updateBackgroundImage(inputValue(event))}
                  />
                </Label>
                <Label class="grid col-span-2 gap-2 mt-4">
                  <span class="text-magma-accent text-xs font-bold uppercase"
                    >{m.settings_language()}</span
                  >
                  <select
                    class="flex h-9 w-full rounded-md border border-magma-line bg-magma-panel px-3 py-1 text-sm text-magma-text shadow-sm cursor-pointer outline-0"
                    value={language}
                    onchange={(event: Event) => {
                      language = inputValue(event)
                      updateSystemLanguage(inputValue(event))
                    }}
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                  </select>
                </Label>
              </div>
            </aside>
          </section>
        </Tabs.Content>

        <Tabs.Content value="dashboard">
          <section
            class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-2 max-lg:grid-cols-1"
          >
            <CodeEditor
              bind:value={dashboardYaml}
              highlighted={highlightedDashboardYaml}
              label="Dashboard YAML"
            />
            <aside
              class="border border-magma-line rounded-lg bg-magma-panel shadow-[0_18px_60px_rgb(0_0_0/24%)] backdrop-blur-xl p-4 text-magma-muted"
            >
              <h2 class="text-magma-text text-base m-0 mb-2.5">
                {m.settings_dashboard()}
              </h2>
              <p>{@html m.settings_dashboard_desc()}</p>
            </aside>
          </section>
        </Tabs.Content>

        <Tabs.Content value="css">
          <section
            class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-2 max-lg:grid-cols-1"
          >
            <CodeEditor
              bind:value={customCss}
              highlighted={highlightedCss}
              label="Override CSS"
              placeholder={`:root {\n  --magma-accent: #fabd2f;\n}\n\n.button-widget {\n  border-radius: 10px;\n}`}
            />
            <aside
              class="border border-magma-line rounded-lg bg-magma-panel shadow-[0_18px_60px_rgb(0_0_0/24%)] backdrop-blur-xl p-4 text-magma-muted"
            >
              <h2 class="text-magma-text text-base m-0 mb-2.5">{m.settings_css()}</h2>
              <p>{@html m.settings_css_desc()}</p>
            </aside>
          </section>
        </Tabs.Content>

        <Tabs.Content value="security">
          <section class="mt-2">
            <aside class="border border-magma-line rounded-lg bg-magma-panel shadow-[0_18px_60px_rgb(0_0_0/24%)] backdrop-blur-xl p-4 text-magma-muted">
              <h2 class="text-magma-text text-base m-0 mb-2.5">Security</h2>
              <p class="mb-4">Manage your passkeys. Passkeys use biometrics (Face ID, Touch ID, Windows Hello) to verify your identity before allowing edit mode and settings access.</p>
              <PasskeySetup onPasskeyChanged={handlePasskeyChanged} />
            </aside>
          </section>
        </Tabs.Content>
      </Tabs.Root>
    {/if}
  </div>
</main>
