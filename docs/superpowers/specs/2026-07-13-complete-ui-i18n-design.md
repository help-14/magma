# Complete UI i18n Migration Design

## Goal

Move all application-owned, user-visible text in `src/` into the existing
Paraglide message catalogs and provide English and Vietnamese translations.

## Scope

- Include visible text, placeholders, labels, tooltips, titles, ARIA labels,
  empty states, and client-facing feedback messages.
- Include property-panel field labels, option labels, and placeholders supplied
  by `widget-config-fields.ts`.
- Keep identifiers, widget type values, URLs, HTTP methods, API-provided
  content, configuration defaults, and internal/server-only errors unchanged.

## Design

Property-field descriptors will retain their current structural shape, but
their localizable values will become Paraglide message functions. The
properties panel will resolve the functions when it renders a field or option.
This keeps labels reactive to the active locale without introducing a
key-resolution layer or coupling the descriptors to a particular locale file.

All other hardcoded application UI copy will be replaced directly with
`m.<message>()` calls. New entries will be added to both `messages/en.json` and
`messages/vi.json` with matching parameter names where interpolation is needed.

## Validation

Run a targeted source scan for remaining hardcoded UI literals, run the Svelte
autofixer on edited Svelte components, then run `pnpm check` and `pnpm build`.
