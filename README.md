# Technical Documentation Portal

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This repository contains technical documentation and guides for various technologies and services. It is built using [Astro](https://astro.build) with the [Starlight](https://starlight.astro.build) documentation theme.

## Features

- Responsive design optimized for both desktop and mobile viewing
- Dark/light mode support
- Mermaid diagram integration for clear visualizations
- Syntax highlighting for code blocks
- Organized structure with guides and reference materials

## 📁 Project Structure

The documentation site is organized as follows:

```
.
├── public/              # Static assets (favicons, etc.)
├── src/
│   ├── assets/          # Images and other assets
│   ├── content/
│   │   ├── docs/        # Documentation content
│   │   │   ├── guides/  # Step-by-step guides
│   │   │   └── reference/ # Reference materials
│   └── styles/          # Custom CSS for styling
├── astro.config.mjs     # Astro configuration
└── package.json
```

Documentation content is written in `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

## 🔧 Development

All commands are run from the root of the project:

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| `bun install`     | Installs dependencies                            |
| `bun dev`         | Starts local dev server at `localhost:4321`      |
| `bun build`       | Build your production site to `./dist/`          |
| `bun preview`     | Preview your build locally, before deploying     |

## 📝 Content Guidelines

When adding new documentation:

1. Choose the appropriate section (guides or reference)
2. Use descriptive filenames and titles
3. Include diagrams for complex architectures using Mermaid
4. Provide both CLI and Infrastructure-as-Code examples when applicable
5. Include adequate comments in code samples

## 🔗 Resources

- [Starlight Documentation](https://starlight.astro.build/)
- [Astro Documentation](https://docs.astro.build)
- [Mermaid Diagram Syntax](https://mermaid.js.org/)