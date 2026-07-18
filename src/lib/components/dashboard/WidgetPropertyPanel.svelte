<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { FieldLabel } from "$lib/components/ui/field-label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import IconPicker from "./IconPicker.svelte";
  import { widgetConfigFields } from "$lib/types/widget-config-fields.js";
  import type { ConfigFieldDescriptor } from "$lib/types/config.js";
  import type { PropertyPanelProps } from "$lib/types/widget.js";

  let {
    grid,
    gridRows,
    selected,
    widget,
    onClose = () => {},
    onUpdate = () => {},
    onUpdateConfig = () => {},
    onUpdateNumber = () => {},
  }: PropertyPanelProps = $props();

  let fields: ConfigFieldDescriptor[] = $derived([
    {
      key: "hideTitle",
      label: m.properties_field_hide_title,
      type: "checkbox",
      default: false,
    },
    ...(widgetConfigFields[widget.type] || []),
  ]);

  function inputValue(event: Event) {
    return (
      event.currentTarget as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
    ).value;
  }

  function inputChecked(event: Event) {
    return (event.currentTarget as HTMLInputElement).checked;
  }
</script>

<aside
  class="fixed top-6 bottom-6 right-6 z-23 w-[min(340px,calc(100vw-48px))] p-4 overflow-auto border border-border rounded-lg bg-[rgb(26_22_18/92%)] text-foreground shadow-[0_30px_90px_rgb(0_0_0/45%)] backdrop-blur-xl max-sm:top-3 max-sm:left-3 max-sm:w-[calc(100vw-24px)] max-sm:bottom-auto max-sm:max-h-[calc(100vh-102px)]"
  aria-label={m.properties_aria_label()}
>
  <div class="flex items-start justify-between gap-3.5 mb-4">
    <div>
      <FieldLabel accent class="m-0 mb-1">{m.properties_title()}</FieldLabel>
      <h2 class="m-0 text-lg leading-tight">{widget.title}</h2>
    </div>
    <Button variant="outline" type="button" onclick={onClose}
      >{m.properties_close()}</Button
    >
  </div>

  <Label class="grid gap-1.5 mt-3">
    <FieldLabel>{m.properties_title_field()}</FieldLabel>
    <Input
      value={widget.title}
      oninput={(event: Event) => onUpdate({ title: inputValue(event) })}
    />
  </Label>

  <Label class="grid gap-1.5 mt-3">
    <FieldLabel>{m.properties_id_field()}</FieldLabel>
    <Input value={widget.id} readonly />
  </Label>

  <Label class="grid gap-1.5 mt-3">
    <FieldLabel>{m.properties_type_field()}</FieldLabel>
    <Input value={widget.type} readonly />
  </Label>

  {#if !selected?.childId}
    <div class="grid grid-cols-4 gap-2">
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{m.properties_x()}</FieldLabel>
        <Input
          type="number"
          value={widget.x}
          oninput={(event: Event) => onUpdateNumber("x", inputValue(event))}
        />
      </Label>
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{m.properties_y()}</FieldLabel>
        <Input
          type="number"
          min="1"
          value={widget.y}
          oninput={(event: Event) => onUpdateNumber("y", inputValue(event))}
        />
      </Label>
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{m.properties_w()}</FieldLabel>
        <Input
          type="number"
          min="1"
          max={grid.columns}
          value={widget.w}
          oninput={(event: Event) => onUpdateNumber("w", inputValue(event))}
        />
      </Label>
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{m.properties_h()}</FieldLabel>
        <Input
          type="number"
          min="1"
          max={gridRows}
          value={widget.h}
          oninput={(event: Event) => onUpdateNumber("h", inputValue(event))}
        />
      </Label>
    </div>
  {/if}

  {#each fields as field (field.key)}
    {#if field.type === "icon-picker"}
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{field.label()}</FieldLabel>
        <IconPicker
          value={widget.config?.[field.key] || field.default}
          onSelect={(icon) => onUpdateConfig(field.key, icon)}
        />
      </Label>
    {:else if field.type === "color"}
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{field.label()}</FieldLabel>
        <div class="grid grid-cols-[44px_1fr] gap-2">
          <Input
            class="min-w-0 p-1 cursor-pointer"
            type="color"
            value={widget.config?.[field.key] || field.default}
            oninput={(event: Event) =>
              onUpdateConfig(field.key, inputValue(event))}
          />
          <Input
            value={widget.config?.[field.key] || ""}
            placeholder={m.properties_color_default({
              value: String(field.default),
            })}
            oninput={(event: Event) =>
              onUpdateConfig(field.key, inputValue(event))}
          />
        </div>
      </Label>
    {:else if field.type === "checkbox"}
      <Label class="flex items-center gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={widget.config?.[field.key] ?? field.default}
          onchange={(event: Event) =>
            onUpdateConfig(field.key, inputChecked(event))}
          class="accent-accent"
        />
        <FieldLabel>{field.label()}</FieldLabel>
      </Label>
    {:else if field.type === "password"}
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{field.label()}</FieldLabel>
        <Input
          type="password"
          value={widget.config?.[field.key] ?? field.default}
          placeholder={field.placeholder?.()}
          oninput={(event: Event) =>
            onUpdateConfig(field.key, inputValue(event))}
        />
      </Label>
    {:else if field.type === "select"}
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{field.label()}</FieldLabel>
        <select
          class="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm cursor-pointer outline-0"
          value={widget.config?.[field.key] ?? field.default}
          onchange={(event: Event) =>
            onUpdateConfig(field.key, inputValue(event))}
        >
          {#each field.options || [] as option (option.value)}
            <option value={option.value}>{option.label()}</option>
          {/each}
        </select>
      </Label>
    {:else if field.type === "textarea"}
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{field.label()}</FieldLabel>
        <Textarea
          value={widget.config?.[field.key] ?? field.default}
          rows={field.rows || 4}
          oninput={(event: Event) =>
            onUpdateConfig(field.key, inputValue(event))}
        />
      </Label>
    {:else}
      <Label class="grid gap-1.5 mt-3">
        <FieldLabel>{field.label()}</FieldLabel>
        <Input
          type={field.type === "number" ? "number" : "text"}
          min={field.type === "number" ? "0" : undefined}
          value={widget.config?.[field.key] ?? field.default}
          placeholder={field.placeholder?.()}
          oninput={(event: Event) => {
            const value = inputValue(event);
            const val = field.type === "number" ? Number(value) : value;
            onUpdateConfig(field.key, val);
          }}
        />
      </Label>
    {/if}
  {/each}
</aside>
