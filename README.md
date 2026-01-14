# SVGFix

[![Build and Deploy](https://github.com/stardeltaio/svgfix.net/actions/workflows/deploy.yml/badge.svg)](https://github.com/stardeltaio/svgfix.net/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Free online tool to properly normalize SVG files.**

🔗 **[svgfix.net](https://svgfix.net)**

## What It Does

SVGFix solves a common problem: SVGs exported from design tools often have offset viewBox coordinates that cause issues when:

- Converting SVGs to PNG (cropping problems)
- Using SVGs in icon systems
- Embedding SVGs in applications

Unlike other tools that only adjust the viewBox attribute, **SVGFix actually transforms path coordinates** so everything genuinely starts at `0 0`.

### Features

- **Crop whitespace** - Remove empty space around your SVG content
- **Transform to origin** - Translate path coordinates to start at 0,0
- **Normalize viewBox** - Set viewBox to `0 0 width height`
- **Optimize with SVGO** - Reduce file size while preserving quality
- **100% client-side** - Your files never leave your browser

## Tech Stack

- [Astro](https://astro.build/) - Static site framework
- [Vue 3](https://vuejs.org/) - Interactive UI component
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [svg-path-commander](https://github.com/nicolo-ribaudo/svg-path-commander) - Path transformations
- [SVGO](https://github.com/svg/svgo) - SVG optimization

## Development

### Prerequisites

- Node.js 20+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/stardeltaio/svgfix.net.git
cd svgfix.net

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `pnpm dev`     | Start dev server at localhost:4321 |
| `pnpm build`   | Build for production               |
| `pnpm preview` | Preview production build           |
| `pnpm test`    | Run unit tests                     |
| `pnpm lint`    | Run ESLint                         |
| `pnpm format`  | Format code with Prettier          |

### Project Structure

```
svgfix.net/
├── src/
│   ├── components/    # Astro & Vue components
│   ├── layouts/       # Page layouts
│   ├── pages/         # File-based routing
│   └── styles/        # Global CSS
├── lib/               # SVG processing library
│   └── tests/         # Unit tests
├── public/            # Static assets
└── docs/              # Documentation
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

[MIT](LICENSE) © [StarDelta](https://stardelta.io)

## Support

If you find this tool useful, consider [buying me a coffee](https://buymeacoffee.com/stardelta) ☕
