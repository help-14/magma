---
layout: layouts/doc.njk
title: CSS Override
description: Configure config/override.css.
---

# CSS Override

`config/override.css` stores custom CSS that loads after Magma's built-in styles.

Use this file for small visual adjustments, brand tweaks, or dashboard-specific overrides that should survive app updates.

```css
:root {
  --accent: #fabd2f;
}

.dashboard-grid {
  letter-spacing: -0.01em;
}
```

Keep CSS overrides focused. If a change should become default behavior, change the app styles instead of hiding it in override CSS.
