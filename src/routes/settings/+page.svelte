<script lang="ts">
  import { ArrowLeft, Save, Fingerprint, GripVertical } from "@lucide/svelte";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { m } from "$lib/paraglide/messages.js";
  import { ErrorCode, toErrorMessage } from "$lib/errors.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { FieldLabel } from "$lib/components/ui/field-label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { SettingsPanel } from "$lib/components/ui/settings-panel/index.js";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import CodeEditor from "$lib/components/settings/CodeEditor.svelte";
  import PasskeySetup from "$lib/components/settings/PasskeySetup.svelte";
  import {
    saveCssOverride,
    saveDashboardSettings,
    saveSystemSettings,
  } from "$lib/remotes/settings.remote.js";
  import { authenticateBegin } from "$lib/remotes/passkey.remote.js";
  import YAML from "yaml";

  let { data }: { data: any } = $props();

  let activeTab = $state("system");
  let systemYaml = $state(data.systemYaml);
  let cellWidth = $state(
    data.systemConfig.system?.dashboardGrid?.cellWidth || 100,
  );
  let cellHeight = $state(
    data.systemConfig.system?.dashboardGrid?.cellHeight || 100,
  );
  let mobileScale = $state(initialMobileScale());
  let navPosition = $state(
    data.systemConfig.system?.navPosition ?? 'left',
  );
  let dashboardYaml = $state(data.yaml);
  let backgroundImage = $state(data.config.theme?.backgroundImage ?? "");
  let customCss = $state(data.customCss || "");
  let dashboardData = $derived.by(() => {
    try { return YAML.parse(dashboardYaml) } catch { return {} }
  })
  let pages: any[] = $derived(
    dashboardData.dashboard?.pages ?? (
      dashboardData.dashboard?.widgets
        ? [{ id: 'home', title: 'Home', widgets: dashboardData.dashboard.widgets }]
        : []
    )
  )
  let themeTemplate = $state("default");
  let themeNames = $derived([
    "gruvbox",
    "one-dark",
    "rose-pine",
    "nord",
    "monokai",
    "dracula",
    "solarized-dark",
    "everforest-dark",
    "catppuccin-mocha",
    "tokyo-night",
  ]);
  let saving = $state(false);
  let language = $state(data.systemConfig.language || "en");
  let title = $state(data.systemConfig.title || "Magma");
  let isAuthenticated = $derived(data.isAuthenticated);
  let passkeyCount = $derived(data.passkeyCount);
  let authenticating = $state(false);
  let showGate = $derived(passkeyCount > 0 && !isAuthenticated);

  let settingsInputClass =
    "w-full min-h-9 border-border rounded-lg bg-[rgb(20_18_16/48%)] text-foreground px-2.5 outline-none transition-all duration-140 hover:border-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]";

  let highlightedSystemYaml = $derived(highlightYaml(systemYaml));
  let highlightedDashboardYaml = $derived(highlightYaml(dashboardYaml));
  let highlightedCss = $derived(highlightCss(customCss));

  let tabs = $derived([
    { id: "system", label: m.settings_system() },
    { id: "dashboard", label: m.settings_dashboard() },
    { id: "theme", label: m.settings_theme() },
    { id: "security", label: m.settings_security() },
  ]);

  function inputValue(event: Event) {
    return (event.currentTarget as HTMLInputElement | HTMLSelectElement).value;
  }

  function initialMobileScale() {
    return data.systemConfig.system?.dashboardGrid?.mobileScale || 0.75;
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function base64urlToBufferSource(base64url: string): BufferSource {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64 + padding);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes as BufferSource;
  }

  function highlightYaml(source: string) {
    return source
      .split("\n")
      .map((line: string) => {
        const escaped = escapeHtml(line);
        const commentIndex = escaped.indexOf("#");
        const content =
          commentIndex >= 0 ? escaped.slice(0, commentIndex) : escaped;
        const comment = commentIndex >= 0 ? escaped.slice(commentIndex) : "";
        const highlighted = content
          .replace(
            /^(\s*-?\s*)([A-Za-z0-9_-]+)(:)/,
            '$1<span class="syntax-key">$2</span>$3',
          )
          .replace(
            /(:\s*)(\/?[^#\s][^#]*?)$/g,
            '$1<span class="syntax-value">$2</span>',
          )
          .replace(
            /\b(true|false|null)\b/g,
            '<span class="syntax-literal">$1</span>',
          )
          .replace(
            /\b(-?\d+(?:\.\d+)?)\b/g,
            '<span class="syntax-number">$1</span>',
          );
        return `${highlighted}${comment ? `<span class="syntax-comment">${comment}</span>` : ""}`;
      })
      .join("\n");
  }

  function highlightCss(source: string) {
    return escapeHtml(source)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syntax-comment">$1</span>')
      .replace(
        /([.#]?[A-Za-z_-][\w-]*)(\s*\{)/g,
        '<span class="syntax-key">$1</span>$2',
      )
      .replace(/([A-Za-z-]+)(\s*:)/g, '<span class="syntax-value">$1</span>$2')
      .replace(
        /(#[0-9A-Fa-f]{3,8}|\b-?\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)?\b)/g,
        '<span class="syntax-number">$1</span>',
      );
  }

  function updateBackgroundImage(value: string) {
    backgroundImage = value;
    updateSystemThemeField("backgroundImage", value);
  }

  function updateSystemTitle(value: string) {
    title = value;
    const lines = systemYaml.split("\n");
    const titleIndex = lines.findIndex((line: string) => /^title:/.test(line));
    if (titleIndex === -1) {
      lines.splice(0, 0, `title: ${value || "Magma"}`);
    } else {
      lines.splice(titleIndex, 1, `title: ${value || "Magma"}`);
    }
    systemYaml = lines.join("\n");
  }

  function updateSystemLanguage(value: string) {
    const lines = systemYaml.split("\n");
    const langIndex = lines.findIndex((line: string) =>
      /^language:/.test(line),
    );
    if (langIndex === -1) {
      lines.splice(1, 0, `language: ${value}`);
    } else {
      lines.splice(langIndex, 1, `language: ${value}`);
    }
    systemYaml = lines.join("\n");
  }

  function updateSystemGridField(
    key: "cellWidth" | "cellHeight" | "mobileScale",
    value: string,
  ) {
    const fallback = key === "mobileScale" ? "0.75" : "100";
    const numberValue =
      key === "mobileScale"
        ? Number.parseFloat(value || fallback)
        : Number.parseInt(value || fallback, 10);
    if (key === "cellWidth") cellWidth = numberValue;
    if (key === "cellHeight") cellHeight = numberValue;
    if (key === "mobileScale") mobileScale = numberValue;

    const lines = systemYaml.split("\n");
    const fieldIndex = lines.findIndex((line: string) =>
      new RegExp(`^\\s+${key}:`).test(line),
    );
    const nextValue = Number.isFinite(numberValue)
      ? numberValue
      : Number(fallback);
    const nextLine = `    ${key}: ${nextValue}`;
    if (fieldIndex === -1) {
      const gridIndex = lines.findIndex((line: string) =>
        /^\s+dashboardGrid:\s*$/.test(line),
      );
      if (gridIndex === -1) {
        const systemIndex = lines.findIndex((line: string) =>
          /^system:\s*$/.test(line),
        );
        if (systemIndex === -1) {
          systemYaml = `version: 1\nsystem:\n  dashboardGrid:\n${nextLine}\n`;
        } else {
          lines.splice(systemIndex + 1, 0, "  dashboardGrid:\n" + nextLine);
          systemYaml = lines.join("\n");
        }
      } else {
        lines.splice(gridIndex + 1, 0, nextLine);
        systemYaml = lines.join("\n");
      }
    } else {
      lines.splice(fieldIndex, 1, nextLine);
      systemYaml = lines.join("\n");
    }
  }

  function updateNavPosition(value: string) {
    navPosition = value as "left" | "right";
    const lines = systemYaml.split("\n");
    const fieldIndex = lines.findIndex((line: string) =>
      /^\s+navPosition:/.test(line),
    );
    const nextLine = `  navPosition: ${value}`;
    if (fieldIndex === -1) {
      const systemIndex = lines.findIndex((line: string) =>
        /^system:\s*$/.test(line),
      );
      if (systemIndex === -1) {
        lines.splice(1, 0, "system:\n" + nextLine);
      } else {
        lines.splice(systemIndex + 1, 0, nextLine);
      }
    } else {
      lines.splice(fieldIndex, 1, nextLine);
    }
    systemYaml = lines.join("\n");
  }

  function updateThemeField(key: string, value: string) {
    const lines = dashboardYaml.split("\n");
    const themeIndex = lines.findIndex((line: string) =>
      /^theme:\s*$/.test(line),
    );
    if (themeIndex === -1) {
      dashboardYaml = `${dashboardYaml.trimEnd()}\n\ntheme:\n${formatThemeField(key, value)}\n`;
      return;
    }

    const nextSectionIndex = lines.findIndex(
      (line: string, index: number) => index > themeIndex && /^\S/.test(line),
    );
    const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
    const fieldIndex = lines.findIndex(
      (line: string, index: number) =>
        index > themeIndex &&
        index < endIndex &&
        new RegExp(`^\\s+${key}:`).test(line),
    );

    if (fieldIndex === -1) {
      lines.splice(themeIndex + 1, 0, formatThemeField(key, value));
    } else {
      lines.splice(fieldIndex, 1, formatThemeField(key, value));
    }
    dashboardYaml = lines.join("\n");
  }

  function updateSystemThemeField(key: string, value: string) {
    const lines = systemYaml.split("\n");
    const themeIndex = lines.findIndex((line: string) =>
      /^theme:\s*$/.test(line),
    );
    if (themeIndex === -1) {
      systemYaml = `${systemYaml.trimEnd()}\n\ntheme:\n${formatThemeField(key, value)}\n`;
      return;
    }

    const nextSectionIndex = lines.findIndex(
      (line: string, index: number) => index > themeIndex && /^\S/.test(line),
    );
    const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
    const fieldIndex = lines.findIndex(
      (line: string, index: number) =>
        index > themeIndex &&
        index < endIndex &&
        new RegExp(`^\\s+${key}:`).test(line),
    );

    if (fieldIndex === -1) {
      lines.splice(themeIndex + 1, 0, formatThemeField(key, value));
    } else {
      lines.splice(fieldIndex, 1, formatThemeField(key, value));
    }
    systemYaml = lines.join("\n");
  }

  function formatThemeField(key: string, value: string) {
    return `  ${key}: ${value}`;
  }

  function updatePageTitle(pageId: string, title: string) {
    try {
      const data = YAML.parse(dashboardYaml)
      if (!data.dashboard) data.dashboard = {}
      if (!data.dashboard.pages) {
        const widgets = data.dashboard.widgets || []
        data.dashboard.pages = widgets.length > 0
          ? [{ id: 'home', title: 'Home', widgets }]
          : [{ id: 'home', title: 'Home', widgets: [] }]
        delete data.dashboard.widgets
      }
      const page = data.dashboard.pages.find((p: any) => p.id === pageId)
      if (page) page.title = title
      dashboardYaml = YAML.stringify(data, { lineWidth: 100 })
    } catch { /* ignore parse errors */ }
  }

  function addPage() {
    try {
      const data = YAML.parse(dashboardYaml)
      if (!data.dashboard) data.dashboard = {}
      if (!data.dashboard.pages) {
        const widgets = data.dashboard.widgets || []
        data.dashboard.pages = widgets.length > 0
          ? [{ id: 'home', title: 'Home', widgets }]
          : []
        delete data.dashboard.widgets
      }
      const id = `page-${Date.now().toString(36)}`
      data.dashboard.pages.push({ id, title: 'New Page', widgets: [] })
      dashboardYaml = YAML.stringify(data, { lineWidth: 100 })
    } catch { /* ignore */ }
  }

  function deletePage(pageId: string) {
    try {
      const data = YAML.parse(dashboardYaml)
      const pages = data.dashboard?.pages
      if (!pages || pages.length <= 1) return
      data.dashboard.pages = pages.filter((p: any) => p.id !== pageId)
      dashboardYaml = YAML.stringify(data, { lineWidth: 100 })
    } catch { /* ignore */ }
  }

  let dragIndex = $state<number | null>(null)
  let dropIndex = $state<number | null>(null)

  function reorderPage(from: number, to: number) {
    if (from === to) return
    try {
      const data = YAML.parse(dashboardYaml)
      const pages = data.dashboard?.pages
      if (!pages) return
      const [moved] = pages.splice(from, 1)
      pages.splice(to, 0, moved)
      dashboardYaml = YAML.stringify(data, { lineWidth: 100 })
    } catch { /* ignore */ }
  }

  async function save() {
    saving = true;

    try {
      let result: any;
      if (activeTab === "system")
        result = await saveSystemSettings({ systemYaml });
      if (activeTab === "dashboard")
        result = await saveDashboardSettings({ yaml: dashboardYaml });
      if (activeTab === "theme") result = await saveCssOverride({ customCss });

      if (result.systemYaml) systemYaml = result.systemYaml;
      if (result.systemConfig) {
        cellWidth =
          result.systemConfig.system?.dashboardGrid?.cellWidth || cellWidth;
        cellHeight =
          result.systemConfig.system?.dashboardGrid?.cellHeight || cellHeight;
        mobileScale =
          result.systemConfig.system?.dashboardGrid?.mobileScale || mobileScale;
        backgroundImage =
          result.systemConfig.theme?.backgroundImage ?? backgroundImage;
        title = result.systemConfig.title || "Magma";
      }
      if (result.yaml) {
        dashboardYaml = result.yaml;
        backgroundImage =
          result.config?.theme?.backgroundImage ?? backgroundImage;
      }
      if (typeof result.customCss === "string") customCss = result.customCss;
      toast.success(m.settings_saved());
      if (
        activeTab === "system" &&
        result.systemConfig?.language !== data.language
      ) {
        window.location.reload();
      }
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      saving = false;
    }
  }

  async function handleAuthenticate() {
    if (authenticating) return;
    authenticating = true;
    try {
      const origin = window.location.origin;
      const rpID = window.location.hostname;
      const { challengeId, options } = await authenticateBegin({
        origin,
        rpID,
      });
      const publicKey = {
        ...options,
        challenge: base64urlToBufferSource(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: base64urlToBufferSource(cred.id),
        })),
      } as PublicKeyCredentialRequestOptions;

      const assertion = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null;
      if (!assertion) throw new Error(ErrorCode.AUTH_CANCELLED);
      const response = await fetch("/api/auth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          credential: assertion.toJSON(),
          origin,
          rpID,
        }),
      });
      if (!response.ok) throw new Error(ErrorCode.AUTH_FAILED);
      await invalidateAll();
    } catch (err) {
      if (err instanceof Error && err.message === ErrorCode.AUTH_CANCELLED)
        return;
      toast.error(
        err instanceof Error
          ? toErrorMessage(err.message)
          : m.passkey_failed_to_authenticate(),
      );
    } finally {
      authenticating = false;
    }
  }

  function handlePasskeyChanged() {
    invalidateAll();
  }
</script>

<main class="p-7 overflow-x-hidden max-sm:p-4.5">
  <div class="relative z-1 w-[min(1080px,100%)] mx-auto">
    <header
      class="flex items-center justify-between gap-4.5 max-sm:flex-col max-sm:items-start"
    >
      <nav class="flex flex-row w-full">
        <Button href="/" variant="magma">
          <ArrowLeft size={18} />
          {m.settings_back()}
        </Button>
        <div class="grow"></div>
        <Button
          variant="magma"
          onclick={save}
          disabled={saving}
          class="text-foreground!"
        >
          <Save size={18} />
          {saving ? m.settings_saving() : m.editor_save()}
        </Button>
      </nav>
    </header>

    {#if showGate}
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <Fingerprint size={64} class="text-accent mb-4" />
        <h2 class="text-foreground text-lg font-bold mb-2">
          {m.passkey_verify_identity()}
        </h2>
        <p class="text-muted-foreground text-sm mb-6">
          {m.settings_use_passkey_access()}
        </p>
        <Button
          variant="magma"
          class="text-foreground!"
          onclick={handleAuthenticate}
          disabled={authenticating}
        >
          {authenticating ? m.passkey_verifying() : m.passkey_use_passkey()}
        </Button>
      </div>
    {:else}
      <Tabs.Root bind:value={activeTab}>
        <Tabs.List class="flex flex-wrap gap-3 mt-6 bg-transparent">
          {#each tabs as tab (tab.id)}
            <Tabs.Trigger
              value={tab.id}
              class="inline-flex items-center justify-center gap-2 min-h-10 px-3.5 border border-border rounded-lg bg-card text-foreground! backdrop-blur-md cursor-pointer transition-all duration-140 hover:border-accent/48 hover:bg-accent/18 hover:shadow-[0_10px_26px_rgb(0_0_0/24%),0_0_0_1px_rgb(250_189_47/14%)] hover:-translate-y-0.5 active:shadow-[0_4px_12px_rgb(0_0_0/22%)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 data-active:border-accent/48 data-active:bg-accent/40 data-active:hover:bg-accent/96"
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
              label={m.settings_label_system_yaml()}
            />
            <SettingsPanel
              title={m.settings_system()}
              description={m.settings_system_desc()}
            >
              <Label class="grid gap-2 mt-4">
                <FieldLabel accent>{m.settings_title()}</FieldLabel>

                <Input
                  value={title}
                  placeholder={m.settings_title_placeholder()}
                  class={settingsInputClass}
                  oninput={(event: Event) =>
                    updateSystemTitle(inputValue(event))}
                />
              </Label>
              <div class="grid grid-cols-2 gap-3">
                <Label class="grid gap-2 mt-4">
                  <FieldLabel accent>{m.settings_cell_width()}</FieldLabel>

                  <Input
                    type="number"
                    min="1"
                    value={cellWidth}
                    class={settingsInputClass}
                    oninput={(event: Event) =>
                      updateSystemGridField("cellWidth", inputValue(event))}
                  />
                </Label>
                <Label class="grid gap-2 mt-4">
                  <FieldLabel accent>{m.settings_cell_height()}</FieldLabel>

                  <Input
                    type="number"
                    min="1"
                    value={cellHeight}
                    class={settingsInputClass}
                    oninput={(event: Event) =>
                      updateSystemGridField("cellHeight", inputValue(event))}
                  />
                </Label>
                <Label class="grid col-span-2 gap-2 mt-4">
                  <FieldLabel accent>{m.settings_mobile_scale()}</FieldLabel>

                  <Input
                    type="number"
                    min="0.4"
                    max="1"
                    step="0.05"
                    value={mobileScale}
                    class={settingsInputClass}
                    oninput={(event: Event) =>
                      updateSystemGridField("mobileScale", inputValue(event))}
                  />
                </Label>
                <Label class="grid col-span-2 gap-2 mt-4">
                  <FieldLabel accent>Page Nav Position</FieldLabel>
                  <Select
                    type="single"
                    value={navPosition}
                    onValueChange={(v) => updateNavPosition(v as string)}
                  >
                    <SelectTrigger class={settingsInputClass}>
                      {navPosition === 'left' ? 'Left' : 'Right'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </Label>
                <Label class="grid col-span-2 gap-2 mt-4">
                  <FieldLabel accent>{m.settings_bg_image()}</FieldLabel>

                  <Input
                    value={backgroundImage}
                    placeholder={m.settings_background_image_placeholder()}
                    class={settingsInputClass}
                    oninput={(event: Event) =>
                      updateBackgroundImage(inputValue(event))}
                  />
                </Label>
                <Label class="grid col-span-2 gap-2 mt-4">
                  <FieldLabel accent>{m.settings_language()}</FieldLabel>
                  <Select
                    type="single"
                    bind:value={language}
                    onValueChange={(v) => updateSystemLanguage(v as string)}
                  >
                    <SelectTrigger class={settingsInputClass}>
                      {language === "en"
                        ? m.settings_language_en()
                        : m.settings_language_vi()}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en"
                        >{m.settings_language_en()}</SelectItem
                      >
                      <SelectItem value="vi"
                        >{m.settings_language_vi()}</SelectItem
                      >
                    </SelectContent>
                  </Select>
                </Label>
              </div>
            </SettingsPanel>
          </section>
        </Tabs.Content>

        <Tabs.Content value="dashboard">
          <section
            class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-2 max-lg:grid-cols-1"
          >
            <CodeEditor
              bind:value={dashboardYaml}
              highlighted={highlightedDashboardYaml}
              label={m.settings_label_dashboard_yaml()}
            />
            <div class="flex flex-col gap-4">
              <SettingsPanel
                title={m.settings_dashboard()}
                description={m.settings_dashboard_desc()}
              />
              <SettingsPanel
                title="Pages"
                description="Manage dashboard pages/tabs"
              >
                  {#each pages as page, i (page.id)}
                  <div
                    draggable="true"
                    ondragstart={(e) => {
                      const dt = e.dataTransfer
                      if (!dt) return
                      dragIndex = i
                      dt.effectAllowed = 'move'
                      dt.setData('text/plain', '')
                    }}
                    ondragenter={() => dropIndex = i}
                    ondragover={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
                    }}
                    ondrop={(e) => {
                      e.preventDefault()
                      dropIndex = null
                      if (dragIndex !== null && dragIndex !== i) {
                        reorderPage(dragIndex, i)
                      }
                      dragIndex = null
                    }}
                    ondragend={() => { dragIndex = null; dropIndex = null }}
                    class="flex items-center gap-2 mt-3 transition-all duration-140 {dropIndex === i ? 'opacity-60' : ''}"
                  >
                    <span class="text-muted-foreground shrink-0 cursor-grab">
                      <GripVertical size={16} />
                    </span>
                    <Input
                      value={page.title}
                      class={settingsInputClass}
                      onchange={(e: Event) => {
                        const val = (e.currentTarget as HTMLInputElement).value
                        updatePageTitle(page.id, val)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pages.length <= 1}
                      onclick={() => deletePage(page.id)}
                      class="text-red-400 hover:text-red-300 shrink-0"
                    >
                      ×
                    </Button>
                  </div>
                {/each}
                <Button
                  variant="magma"
                  class="mt-3 w-full text-foreground!"
                  onclick={addPage}
                >
                  + Add Page
                </Button>
              </SettingsPanel>
            </div>
          </section>
        </Tabs.Content>

        <Tabs.Content value="theme">
          <section
            class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-2 max-lg:grid-cols-1"
          >
            <CodeEditor
              bind:value={customCss}
              highlighted={highlightedCss}
              label={m.settings_label_override_css()}
              placeholder={`/* Some custom css value */`}
            />
            <SettingsPanel
              title={m.settings_theme()}
              description={m.settings_theme_desc()}
            >
              <Label class="grid gap-2 mt-4">
                <FieldLabel accent>{m.settings_theme_template()}</FieldLabel>
                <Select
                  type="single"
                  bind:value={themeTemplate}
                  onValueChange={(v) => {
                    themeTemplate = v as string;
                    if (v === "default") {
                      customCss = "";
                    } else {
                      customCss = `@import "/themes/${v}.css";`;
                    }
                  }}
                >
                  <SelectTrigger class={settingsInputClass}>
                    {themeTemplate === "default"
                      ? m.settings_theme_template_default()
                      : themeTemplate}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default"
                      >{m.settings_theme_template_default()}</SelectItem
                    >
                    {#each themeNames as name (name)}
                      <SelectItem value={name}>{name}</SelectItem>
                    {/each}
                  </SelectContent>
                </Select>
              </Label>
            </SettingsPanel>
          </section>
        </Tabs.Content>

        <Tabs.Content value="security">
          <section class="mt-2">
            <SettingsPanel
              title={m.settings_security()}
              description={m.settings_passkey_description()}
            >
              <PasskeySetup onPasskeyChanged={handlePasskeyChanged} />
            </SettingsPanel>
          </section>
        </Tabs.Content>
      </Tabs.Root>
    {/if}
  </div>
</main>
