<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { flip } from "svelte/animate";
  import {
    dndzone,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
  } from "svelte-dnd-action";
  import WidgetRenderer from "../WidgetRenderer.svelte";
  import WidgetStackChildFrame from "./WidgetStackChildFrame.svelte";
  import { buildStackGridStyle } from "./stack-grid-style.js";
  import type { StackWidgetProps } from "$lib/types/widget.js";

  let {
    widget,
    locations = {},
    compact = false,
    editMode = false,
    selectedChildId = null,
    onSelectChild = () => {},
    onDeleteChild = () => {},
    onDropChild = () => {},
    onDragOverChild = () => {},
    onStackDnd = () => {},
  }: StackWidgetProps = $props();

  let size = $derived(
    compact ? "small" : (widget.config?.interface ?? "medium"),
  );

  let flow = $derived(
    widget.config?.flow ||
      (widget.type === "stack-vertical" ? "vertical" : "horizontal"),
  );
  let cols = $derived(widget.config?.cols ?? 2);
  let rows = $derived(widget.config?.rows ?? 0);
  let gap = $derived(widget.config?.gap ?? 12);

  let gridStyle = $derived.by(() => {
    return buildStackGridStyle({ flow, cols, rows, gap });
  });

  let children = $derived(widget.children || []);

  let dndOptions = $derived({
    items: children,
    type: "magma-stack-button",
    flipDurationMs: 200,
    dragDisabled: !editMode,
  });

  function isDndShadowItem(child: unknown) {
    return Boolean((child as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
  }
</script>

<div
  use:dndzone={dndOptions}
  class="flex-1 min-h-10 p-2 min-w-10 stack-grid w-full h-full content-center"
  role="list"
  aria-label={m.stack_children_label({ title: widget.title })}
  style={gridStyle}
  ondrop={onDropChild}
  ondragover={onDragOverChild}
  onconsider={(event) => onStackDnd(widget.id, event.detail.items, false)}
  onfinalize={(event) => onStackDnd(widget.id, event.detail.items, true)}
>
  {#each children as child (child.id)}
    <div
      animate:flip={{ duration: 200 }}
      data-is-dnd-shadow-item-hint={isDndShadowItem(child)}
    >
      {#if isDndShadowItem(child)}
        <div
          class="relative min-w-0 h-full overflow-hidden rounded-lg bg-white/6 border-2 border-dashed border-yellow-400/50"
          role="listitem"
          aria-label={m.stack_drop_position()}
        ></div>
      {:else}
        <WidgetStackChildFrame
          {child}
          {editMode}
          selected={selectedChildId === child.id}
          onSelect={onSelectChild}
          onDelete={(event, target) => {
            event.preventDefault();
            event.stopPropagation();
            onDeleteChild(event, target);
          }}
        >
          <WidgetRenderer
            widget={child}
            {locations}
            compact={size === "small"}
            {editMode}
          />
        </WidgetStackChildFrame>
      {/if}
    </div>
  {/each}
</div>

<style>
</style>
