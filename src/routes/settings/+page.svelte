<script>
  // @ts-nocheck
  import { ArrowLeft, Save } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import CodeEditor from "$lib/components/settings/CodeEditor.svelte";
  import {
    saveCssOverride,
    saveDashboardSettings,
    saveSystemSettings,
  } from "$lib/remotes/settings.remote.js";

  let { data } = $props();

  let activeTab = $state("system");
  let systemYaml = $state(data.systemYaml);
  let systemColumns = $state(
    data.systemConfig.system?.dashboardGrid?.columns || 12,
  );
  let systemRows = $state(data.systemConfig.system?.dashboardGrid?.rows || 12);
  let dashboardYaml = $state(data.yaml);
  let backgroundImage = $state(data.config.theme?.backgroundImage || "/bg.jpg");
  let customCss = $state(data.customCss || "");
  let saving = $state(false);

  let highlightedSystemYaml = $derived(highlightYaml(systemYaml));
  let highlightedDashboardYaml = $derived(highlightYaml(dashboardYaml));
  let highlightedCss = $derived(highlightCss(customCss));

  const tabs = [
    { id: "system", label: "System settings" },
    { id: "dashboard", label: "Dashboard settings" },
    { id: "css", label: "CSS override" },
  ];

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function highlightYaml(source) {
    return source
      .split("\n")
      .map((line) => {
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

  function highlightCss(source) {
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

  function updateBackgroundImage(value) {
    backgroundImage = value;
    updateSystemThemeField("backgroundImage", value || "/bg.jpg");
  }

  function updateSystemGridField(key, value) {
    const numberValue = Number.parseInt(value || "1", 10);
    if (key === "columns") systemColumns = numberValue;
    if (key === "rows") systemRows = numberValue;

    const lines = systemYaml.split("\n");
    const fieldIndex = lines.findIndex((line) =>
      new RegExp(`^\\s+${key}:`).test(line),
    );
    const nextLine = `    ${key}: ${Number.isFinite(numberValue) ? numberValue : 1}`;
    if (fieldIndex === -1) {
      const gridIndex = lines.findIndex((line) =>
        /^\s+dashboardGrid:\s*$/.test(line),
      );
      if (gridIndex === -1) {
        systemYaml = `version: 1\nsystem:\n  dashboardGrid:\n${nextLine}\n`;
      } else {
        lines.splice(gridIndex + 1, 0, nextLine);
        systemYaml = lines.join("\n");
      }
    } else {
      lines.splice(fieldIndex, 1, nextLine);
      systemYaml = lines.join("\n");
    }
  }

  function updateThemeField(key, value) {
    const lines = dashboardYaml.split("\n");
    const themeIndex = lines.findIndex((line) => /^theme:\s*$/.test(line));
    if (themeIndex === -1) {
      dashboardYaml = `${dashboardYaml.trimEnd()}\n\ntheme:\n${formatThemeField(key, value)}\n`;
      return;
    }

    const nextSectionIndex = lines.findIndex(
      (line, index) => index > themeIndex && /^\S/.test(line),
    );
    const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
    const fieldIndex = lines.findIndex(
      (line, index) =>
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

  function updateSystemThemeField(key, value) {
    const lines = systemYaml.split("\n");
    const themeIndex = lines.findIndex((line) => /^theme:\s*$/.test(line));
    if (themeIndex === -1) {
      systemYaml = `${systemYaml.trimEnd()}\n\ntheme:\n${formatThemeField(key, value)}\n`;
      return;
    }

    const nextSectionIndex = lines.findIndex(
      (line, index) => index > themeIndex && /^\S/.test(line),
    );
    const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
    const fieldIndex = lines.findIndex(
      (line, index) =>
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

  function formatThemeField(key, value) {
    return `  ${key}: ${value}`;
  }

  async function save() {
    saving = true;

    try {
      let result;
      if (activeTab === "system")
        result = await saveSystemSettings({ systemYaml });
      if (activeTab === "dashboard")
        result = await saveDashboardSettings({ yaml: dashboardYaml });
      if (activeTab === "css") result = await saveCssOverride({ customCss });

      if (result.systemYaml) systemYaml = result.systemYaml;
      if (result.systemConfig) {
        systemColumns =
          result.systemConfig.system?.dashboardGrid?.columns || systemColumns;
        systemRows =
          result.systemConfig.system?.dashboardGrid?.rows || systemRows;
        backgroundImage =
          result.systemConfig.theme?.backgroundImage || backgroundImage;
      }
      if (result.yaml) {
        dashboardYaml = result.yaml;
        backgroundImage =
          result.config?.theme?.backgroundImage || backgroundImage;
      }
      if (typeof result.customCss === "string") customCss = result.customCss;
      toast.success("Saved settings");
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      saving = false;
    }
  }
</script>

<main
  class="relative min-h-screen p-7 overflow-x-hidden max-sm:p-4.5"
  style={`--magma-accent: ${data.config.theme?.accentColor || "#fabd2f"}; --magma-bg: url('${backgroundImage || "/bg.jpg"}');`}
>
  <div class="background"></div>
  <div class="relative z-1 w-[min(1080px,100%)] mx-auto">
    <header
      class="flex items-center justify-between gap-4.5 max-sm:flex-col max-sm:items-start"
    >
      <nav class="flex flex-row w-full">
        <Button href="/" variant="magma">
          <ArrowLeft size={18} /> Dashboard
        </Button>
        <div class="grow"></div>
        <Button
          variant="magma"
          onclick={save}
          disabled={saving}
          class="text-magma-text!"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save"}
        </Button>
      </nav>
    </header>

    <Tabs.Root bind:value={activeTab}>
      <Tabs.List class="flex flex-wrap gap-3 mt-6 bg-transparent">
        {#each tabs as tab}
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
              System Settings
            </h2>
            <p>The server reads and writes <code>config/system.yaml</code>.</p>
            <p>
              Use this for app-level behavior, including the dashboard box
              system.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <Label class="grid gap-2 mt-4">
                <span class="text-magma-accent text-xs font-bold uppercase"
                  >Grid columns</span
                >
                <Input
                  type="number"
                  min="1"
                  value={systemColumns}
                  class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                  oninput={(event) =>
                    updateSystemGridField("columns", event.currentTarget.value)}
                />
              </Label>
              <Label class="grid gap-2 mt-4">
                <span class="text-magma-accent text-xs font-bold uppercase"
                  >Grid rows</span
                >
                <Input
                  type="number"
                  min="1"
                  value={systemRows}
                  class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                  oninput={(event) =>
                    updateSystemGridField("rows", event.currentTarget.value)}
                />
              </Label>
              <Label class="grid col-span-2 gap-2 mt-4">
                <span class="text-magma-accent text-xs font-bold uppercase"
                  >Background image URL</span
                >
                <Input
                  value={backgroundImage}
                  placeholder="/bg.jpg"
                  class="w-full min-h-9 border-magma-line rounded-lg bg-[rgb(20_18_16/48%)] text-magma-text px-2.5 outline-none transition-all duration-140 hover:border-magma-accent/34 hover:bg-[rgb(20_18_16/62%)] focus:border-magma-accent/54 focus:bg-[rgb(20_18_16/72%)] focus:shadow-[0_0_0_3px_rgb(250_189_47/12%)]"
                  oninput={(event) =>
                    updateBackgroundImage(event.currentTarget.value)}
                />
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
              Dashboard Settings
            </h2>
            <p>
              The server reads and writes <code>config/dashboard.yaml</code>.
            </p>
            <p>
              This file controls what the main page renders: widgets, services,
              search, theme, and integrations.
            </p>
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
            <h2 class="text-magma-text text-base m-0 mb-2.5">CSS Override</h2>
            <p>The server reads and writes <code>config/override.css</code>.</p>
            <p>
              This stylesheet is loaded after the built-in app CSS, so it can
              override colors and component styles.
            </p>
          </aside>
        </section>
      </Tabs.Content>
    </Tabs.Root>
  </div>
</main>
