# Contributing to SVGFix

Thanks for your interest in contributing to SVGFix! This document outlines the process for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/svgfix.net.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

## Code Style

- We use ESLint and Prettier for code formatting
- Run `pnpm format` before committing
- All code must pass linting: `pnpm lint`

## Testing

- All `/lib` functions must have unit tests
- Aim for 90% test coverage on the SVG processing library
- Run tests with `pnpm test`

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Follow the commit message format: `type: description`
   - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
4. Submit a PR to the `master` branch

## Reporting Bugs

Please use the [GitHub Issues](https://github.com/stardeltaio/svgfix.net/issues) to report bugs. Include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Sample SVG file (if applicable)

## Feature Requests

Feature requests are welcome! Please open an issue with the `enhancement` label.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
