# Mermaid Fullscreen Component

Adds interactive fullscreen modal functionality to all Mermaid diagrams in your Starlight documentation.

## Features

✨ **Click-to-expand**: Click any Mermaid diagram or the fullscreen button to open it in a modal
🔍 **Pan & Zoom**: Drag to pan, scroll/pinch to zoom in fullscreen view
⌨️ **Keyboard shortcuts**: Press `F` to fullscreen, `Escape` to close
📱 **Mobile support**: Pinch-to-zoom and touch gestures on mobile devices
🎨 **Dark mode**: Automatically adapts to your Starlight theme
♿ **Accessible**: ARIA labels and keyboard navigation

## How It Works

The component automatically:
1. Detects all `.mermaid` elements on the page
2. Wraps them in a container with a fullscreen button
3. Adds click handlers to open diagrams in a modal
4. Enables pan/zoom functionality in the modal view

## User Interactions

### Desktop
- **Click diagram or button**: Open fullscreen view
- **Drag**: Pan around the diagram
- **Scroll**: Zoom in/out
- **Escape or click outside**: Close modal
- **Reset View button**: Reset zoom and pan

### Mobile
- **Tap diagram**: Open fullscreen view
- **Drag**: Pan around the diagram
- **Pinch**: Zoom in/out
- **Tap outside**: Close modal

## Implementation Details

### Security
- Uses safe DOM methods (no innerHTML) to create SVG icons
- No external dependencies
- All functionality is self-contained

### Performance
- Lazy initialization (only processes diagrams when needed)
- Prevents duplicate processing with flag checks
- Smooth animations using CSS transforms
- Efficient event handling with event delegation

### Accessibility
- ARIA roles and labels for screen readers
- Keyboard navigation support
- Focus management (focuses close button on open)
- Semantic HTML structure

## Customization

You can customize the appearance by modifying the CSS variables in the component or overriding styles in your `custom.css`:

```css
/* Example: Change fullscreen button position */
.mermaid-fullscreen-btn {
  top: 0.5rem;
  right: 0.5rem;
}

/* Example: Change modal background */
.mermaid-modal {
  background: rgba(0, 0, 0, 0.95);
}

/* Example: Adjust zoom limits */
/* Modify in the component: scale = Math.min(Math.max(0.5, scale), 5); */
```

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- SVG
- CSS transforms
- Touch events (for mobile)

## Credits

Inspired by:
- [starlight-codeblock-fullscreen](https://github.com/frostybee/starlight-codeblock-fullscreen) for code block fullscreen
- [@beoe/pan-zoom](https://astro-digital-garden.stereobooster.com/recipes/svg-pan-zoom/) for pan/zoom patterns
- [Starlight component override system](https://starlight.astro.build/reference/overrides/)
