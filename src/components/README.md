# Diagram Fullscreen Components

Interactive fullscreen modal functionality for Mermaid and D2 diagrams in Starlight documentation.

## Components

- **MermaidFullscreen.astro** - Handles Mermaid diagrams (`svg[id^="mermaid-"]`)
- **D2Fullscreen.astro** - Handles D2 diagrams (`img[src*="/d2/"]`)

Both components are loaded via `Head.astro` and automatically enhance all diagrams on every page.

## Features

- **Click-to-expand**: Click any diagram or the expand button to open fullscreen modal
- **Pan & Zoom**: Drag to pan, scroll/pinch to zoom (0.5x-5x range)
- **Zoom controls**: +/−/1:1 buttons in fullscreen view
- **Keyboard shortcuts**: Enter/Space to open, Escape to close
- **Mobile support**: Pinch-to-zoom and touch gestures
- **Dark mode**: Automatically adapts to Starlight theme
- **Accessible**: ARIA labels, focus management, keyboard navigation

## How It Works

### Mermaid Diagrams
1. Detects all `svg[id^="mermaid-"]` elements
2. Wraps them in a container with expand button
3. Clones SVG into modal for interactive viewing

### D2 Diagrams
1. Detects all `img[src*="/d2/"]` elements
2. Wraps them in a container with expand button
3. Fetches SVG content and injects into modal for interactive viewing

## User Interactions

### Desktop
| Action | Result |
|--------|--------|
| Click diagram or button | Open fullscreen view |
| Drag | Pan around the diagram |
| Scroll wheel | Zoom in/out |
| +/− buttons | Zoom in/out |
| 1:1 button | Reset zoom and position |
| Escape or click outside | Close modal |

### Mobile
| Action | Result |
|--------|--------|
| Tap diagram | Open fullscreen view |
| Drag | Pan around the diagram |
| Pinch | Zoom in/out |
| Tap outside | Close modal |

## D2 Diagram Setup

D2 diagrams use `remark-d2` plugin configured in `astro.config.mjs`:

```js
remarkPlugins: [
  [remarkD2, {
    compilePath: "public/d2",
    linkPath: "/d2",
    defaultD2Opts: ["-t=100", "--dark-theme=200", "--layout=elk"],
  }],
],
```

### Theming
- Light mode: Theme 100 (Vanilla Nitro Cola)
- Dark mode: Theme 200 (Dark Mauve)
- SVGs include embedded `@media (prefers-color-scheme: dark)` styles
- CSS fallback in `custom.css` handles manual theme toggle mismatches

### Writing D2 Diagrams

Use fenced code blocks with `d2` language:

~~~markdown
```d2
direction: right

client: Client {shape: person}
server: Server
database: Database {shape: cylinder}

client -> server: request
server -> database: query
```
~~~

#### Best Practices

- **Prefer `direction: right`** for simple flowcharts - horizontal layouts fit better in content widths
- **Use `direction: down`** only for complex architecture diagrams showing hierarchical layers
- **Let D2's theme handle colors** - avoid explicit `style.fill` to maintain light/dark mode support
- **Keep diagrams simple** - complex diagrams with many nodes work better as vertical layouts

## Implementation Details

### Security
- Safe DOM methods (createElement, not innerHTML for user content)
- No external dependencies
- Self-contained functionality

### Performance
- Lazy initialization on DOMContentLoaded
- Prevents duplicate processing with data attributes
- CSS transforms for smooth animations
- Efficient event handling

### Accessibility
- `role="button"` and `aria-label` on diagrams
- `role="dialog"` and `aria-modal` on modals
- Focus management (focuses close button on open)
- Keyboard navigation support
- `tabindex="0"` for keyboard accessibility

## Customization

Override styles in `custom.css`:

```css
/* Change expand button position */
.d2-expand-btn,
.mermaid-expand-btn {
  top: 0.5rem;
  right: 0.5rem;
}

/* Change modal background */
.d2-modal,
.mermaid-modal {
  background: rgba(0, 0, 0, 0.95);
}

/* Change wrapper background */
.d2-diagram-wrapper,
.mermaid-diagram-wrapper {
  background: var(--sl-color-gray-6);
  padding: 1.5rem;
}
```

## Browser Support

Requires:
- ES6+ JavaScript (async/await, arrow functions)
- Fetch API
- SVG support
- CSS transforms
- Touch events (for mobile)

## Credits

Inspired by:
- [starlight-codeblock-fullscreen](https://github.com/frostybee/starlight-codeblock-fullscreen)
- [@beoe/pan-zoom](https://astro-digital-garden.stereobooster.com/recipes/svg-pan-zoom/)
- [Starlight component override system](https://starlight.astro.build/reference/overrides/)
- [D2 Language](https://d2lang.com/)
