# CLAUDE.md - Project Authority File

This file is the authoritative reference for Claude Code agents working in this repository.

**Critical References:**

- **[ROADMAP.md](docs/ROADMAP.md)** - v1.0 feature roadmap and phase tracking
- **[LIVE_CONTEXT.md](LIVE_CONTEXT.md)** - Current work, blockers, decisions (update frequently)

---

## Project Intent

**SVGFix** is a free online tool that properly normalizes SVG files by cropping whitespace, transforming path coordinates to the origin, and optimizing output. It's for developers, designers, and anyone working with SVGs who need clean, portable vector files. Unlike existing tools that only adjust the viewBox attribute, SVGFix actually translates path coordinates so the viewBox genuinely starts at `0 0` - solving real-world issues when converting to PNG or using SVGs in icon systems.

### Core Principles

1. **Client-side processing only** - All SVG manipulation happens in the browser; no files uploaded to servers
2. **Genuine coordinate transformation** - Don't just crop viewBox; actually translate path `d` attributes to origin
3. **Static-first, single interactive island** - Astro static shell with one Vue component for the tool UI
4. **Free with optional ads** - Core functionality always free; ads non-intrusive
5. **Validate before and after** - Always verify paths fit within the new viewBox using bounding box calculations

---

## Development Workflow

### Explore → Plan → Code → Commit

**MANDATORY**: Never skip planning. Use Plan mode BEFORE implementation.

1. **Explore** (Research phase)

   - Ask Claude to examine relevant files WITHOUT writing code
   - Understand the problem space thoroughly
   - Identify constraints and dependencies

2. **Plan** (Design phase)

   - Use Plan mode (`/plan` or EnterPlanMode tool)
   - Create numbered plan in `docs/plans/##-feature-name.md`
   - Get user approval before proceeding

3. **Code** (Implementation phase)

   - Small, focused diffs
   - Test-driven development (write tests FIRST)
   - **Work in parallel** - Use multiple tool calls in a single message when tasks are independent
   - Commit after EVERY working feature

4. **Test** (Validation phase)

   - **Run tests in parallel** - Execute multiple test suites simultaneously when independent
   - Validate coverage meets thresholds
   - Fix any failing tests immediately

5. **Commit** (Finalization phase)
   - Review changes carefully
   - Ensure all tests pass
   - Create meaningful commit messages

### Parallel Working

**CRITICAL: Always work in parallel when possible.**

During implementation and testing:

- **Make multiple tool calls in a single message** when tasks are independent
- **Read multiple files simultaneously** if they're all needed
- **Run tests in parallel** - Execute unit tests, linting, and type checking concurrently
- **Only work sequentially** when tasks have dependencies

**Examples:**

```
✅ GOOD - Parallel file reads:
- Read component file
- Read test file
- Read related composable
All in one message with 3 Read tool calls

✅ GOOD - Parallel testing:
- Run unit tests
- Run linting
- Run type checking
All in one message with 3 Bash tool calls

❌ BAD - Sequential when unnecessary:
- Read file 1, wait
- Read file 2, wait
- Read file 3, wait
```

### Context Management

- **Never exceed 60% context** - Use `/clear` between distinct tasks
- **One feature per chat** - Mixing features degrades quality
- **Use checkpoints** - "Stop after X and wait for review"
- **Update LIVE_CONTEXT.md** - After discoveries, blockers, or key decisions

---

## Folder Boundaries

```
/src                 # Astro source files
  /src/pages         # File-based routing (.astro)
  /src/layouts       # Layout components
  /src/components    # Reusable components (.astro for static, .vue for interactive)
  /src/styles        # Global styles and CSS variables
/lib                 # Pure TypeScript SVG processing logic
  /lib/tests         # Unit tests for SVG processing functions
/public              # Static assets (favicon, og-image, etc.)
/docs                # All documentation (always kept in sync)
  /docs/plans        # Numbered implementation plans
  /docs/functions    # Function documentation for /lib
  /docs/ROADMAP.md   # v1.0 feature roadmap
/tmp                 # All generated/scratch/AI artefacts only
/.claude/agents      # Claude Code agents for enforcement
/.github             # Workflows (CI, coverage, linting, releases)
/scripts             # Repo scripts (dev, test, release helpers)
```

### Boundary Rules

#### /lib (SVG PROCESSING LOGIC)

Pure TypeScript functions for SVG manipulation. This is the core business logic.

**MUST:**

- Contain only pure TypeScript (no framework dependencies)
- Export typed functions with full TSDoc documentation
- Have unit tests for every exported function
- Use `svg-path-commander` for path transformations
- Validate inputs and throw on invalid SVG

**MUST NOT:**

- Import Vue, Astro, or any UI framework code
- Manipulate DOM directly (work with SVG strings)
- Make network requests
- Have side effects beyond the returned value

#### /src/components (COMPONENTS)

Reusable UI components with Vue for the interactive tool.

**MUST:**

- Use `.astro` for static components (header, footer, layout pieces)
- Use `.vue` only for the main interactive tool component
- Keep the Vue island self-contained
- Import SVG processing logic from `/lib`

**MUST NOT:**

- Put SVG processing logic in components (use /lib)
- Create multiple Vue islands (one is sufficient)
- Mix React/Svelte - Vue only for this project

#### /docs (DOCUMENTATION)

All documentation lives here.

**Required for every /lib function:**

- Unit tests in /lib/tests
- Markdown doc in /docs/functions/<function-name>.md

---

## Rules Claude Must Follow

### Architecture Rules

1. **Never process SVGs on the server** - All processing client-side in the Vue island
2. **One Vue island only** - The tool UI; everything else is static Astro
3. **SVG logic lives in /lib** - Components only orchestrate, never contain processing logic
4. **Always validate bounding boxes** - After any transformation, verify paths fit in viewBox
5. **Preserve original SVG structure** - Only modify path `d` attributes and viewBox; don't restructure

### Code Rules

1. **No function in /lib without unit tests**
2. **Minimum 90% test coverage** on /lib functions
3. **Use islands sparingly** - Only the tool UI needs client:load
4. **No silent assumptions for viewBox values** - Always parse and validate
5. **Flag uncertainty clearly** - If SVG parsing might fail, handle gracefully
6. **Prefer explicitness over shortcuts**

### Workflow Rules

1. **ALWAYS work in parallel during implementation and testing**
   - Make multiple tool calls in a single message when tasks are independent
   - Read multiple files simultaneously
   - Run tests, linting, and type checking concurrently
   - Only work sequentially when dependencies exist
2. **Never make users wait unnecessarily**
   - Don't read files one at a time if you need multiple files
   - Don't run tests sequentially if they can run in parallel

### Documentation Rules

1. **Every function doc must include: Purpose, Inputs/Outputs, Assumptions, Linked Tests**
2. **Keep docs in sync - update docs when code changes**
3. **No undocumented /lib functions may be imported or used**

### Commit Rules

1. **Pre-commit hooks must pass before commits**
2. **TypeScript type checking on /lib**
3. **All tests passing**
4. **Coverage threshold met (90%)**

---

## Development Infrastructure

### Pre-commit Hooks

**MANDATORY**: All projects must use pre-commit hooks to enforce code quality before commits.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0 # PINNED VERSION - update across project and CI
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict

  - repo: local
    hooks:
      - id: eslint
        name: eslint
        entry: pnpm exec eslint
        language: system
        types: [javascript, typescript, astro, vue]
        pass_filenames: false

      - id: prettier
        name: prettier
        entry: pnpm exec prettier --check
        language: system
        types: [javascript, typescript, json, yaml, markdown, astro, vue]
        pass_filenames: false

      - id: astro-check
        name: astro check
        entry: pnpm exec astro check
        language: system
        pass_filenames: false
        stages: [pre-push] # Only on push, not every commit
```

**Setup:**

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install
pre-commit install --hook-type pre-push

# Test hooks
pre-commit run --all-files
```

### Version Pinning

**CRITICAL**: All versions must be pinned (no ^ or ~) to ensure CI/CD uses exact same versions.

```json
// package.json
{
  "engines": {
    "node": "20.11.0",
    "pnpm": "8.15.0"
  },
  "devDependencies": {
    "astro": "5.0.0",
    "eslint": "8.56.0",
    "prettier": "3.2.5",
    "vitest": "1.2.0"
  }
}
```

### Deployment

**VPS (vps2) with nginx + systemd** (same as griddata.uk)

**Server Details:**

- SSH: `ssh vps2`
- App directory: `/var/www/svgfix.net`
- Port: 3001 (griddata.uk uses 3000)
- Systemd service: `svgfix.service`
- Logs: `/var/log/svgfix.net.log`

**Deployment Process:**

1. Build locally: `pnpm build`
2. Copy `.output` to server: `rsync -avz .output/ vps2:/var/www/svgfix.net/.output/`
3. Restart service: `ssh vps2 "sudo systemctl restart svgfix"`

**nginx config:** `/etc/nginx/sites-enabled/svgfix.net`
**SSL:** Let's Encrypt via certbot (auto-renew)

**Checklist for initial setup:**

1. [ ] Create `/var/www/svgfix.net` directory
2. [ ] Create systemd service file
3. [ ] Create nginx config
4. [ ] Run certbot for SSL
5. [ ] Test and verify

---

## Coding Principles

### DRY (Don't Repeat Yourself)

- Extract repeated logic into reusable functions
- Use shared types across components
- Create reusable Astro components
- Centralize constants
- If you write similar code 3+ times, refactor it

**When NOT to apply DRY:**

- Code appears similar but serves different purposes
- Abstraction makes code harder to understand
- Two uses that might diverge in the future

### KISS (Keep It Simple, Stupid)

- Prefer simple, readable code over clever abstractions
- One function = one responsibility
- Avoid premature optimization
- Use standard library functions when available
- If a function needs extensive comments to explain, simplify it

**Guidelines:**

- Avoid deep nesting (max 3 levels)
- Avoid functions longer than 50 lines
- Prefer explicit over implicit
- Prefer standard patterns over custom solutions

### YAGNI (You Ain't Gonna Need It)

- Build features when required, not when anticipated
- Avoid "future-proofing" that adds complexity now
- Start simple, refactor when actual needs emerge
- Delete unused code aggressively

### Fail Fast

- Validate inputs at function entry
- Throw errors immediately when invalid state detected
- Don't let bad data propagate through the system
- Make debugging faster by catching issues at the source

```typescript
// GOOD: Fail fast with validation
function parseViewBox(viewBox: string): ViewBox {
  if (!viewBox || typeof viewBox !== 'string') {
    throw new TypeError('viewBox must be a non-empty string');
  }
  const parts = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error(`Invalid viewBox format: "${viewBox}"`);
  }
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}
```

### Early Return / Guard Clauses

- Check preconditions first, return/throw if not met
- Avoid deep nesting with multiple if-else blocks
- Make the "happy path" the main flow

```typescript
// BAD: Deep nesting
function processSvg(svg, options) {
  if (svg) {
    if (svg.includes('<path')) {
      if (options) {
        // Finally do the work
        return transform(svg, options);
      }
    }
  }
  return null;
}

// GOOD: Guard clauses
function processSvg(svg, options) {
  if (!svg) return null;
  if (!svg.includes('<path')) return null;
  if (!options) return null;

  return transform(svg, options);
}
```

### Defensive Programming

- Validate all external inputs (user input, pasted SVG code)
- Never trust data from outside your control
- Type checking + runtime validation
- Graceful error handling with user-friendly messages

---

## Function Documentation Standards

**MANDATORY**: Document every function as it's built. Update documentation when function changes.

### TypeScript/JavaScript (TSDoc)

````typescript
/**
 * [One-line summary in imperative mood]
 *
 * [Detailed description of what this function does, including any important
 * context about when to use it and what it's designed for.]
 *
 * @param paramName - Description of parameter
 * @param anotherParam - Description of another parameter
 *
 * @returns Description of return value
 *
 * @throws {ErrorType} When this specific error occurs
 * @throws {AnotherError} When this other error occurs
 *
 * @example
 * ```typescript
 * // Example 1: Common use case
 * const result = myFunction(arg1, arg2);
 * // result = expected output
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Edge case or alternative usage
 * const result = myFunction(specialArg1, specialArg2);
 * // result = different expected output
 * ```
 *
 * @see {@link relatedFunction} - For related functionality
 *
 * @lastModified YYYY-MM-DD
 */
export function myFunction(paramName: string, anotherParam: number): ReturnType {
  // Implementation
}
````

**Required Sections:**

- One-line summary (imperative mood)
- Detailed description
- `@param` for every parameter
- `@returns` description
- `@throws` for exceptions
- At least 2 `@example` blocks
- `@see` for related functions
- `@lastModified` date

---

## Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Astro 5+
- **UI Framework:** Vue 3 (single island for tool UI)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Cloudflare Pages
- **SVG Processing:**
  - `svg-path-commander` - Path transformation and bounding box calculation
  - `svgo` - SVG optimization (minification, cleanup)

---

## MCP Tools

### Context7 (Library Documentation)

Always use Context7 MCP when you need:

- Code generation involving external libraries
- Setup or configuration steps for frameworks/tools
- Library or API documentation lookup
- Understanding library-specific behavior (e.g., svg-path-commander API, SVGO plugins)

**Usage:** Automatically use the Context7 MCP tools (`mcp__context7__resolve-library-id` and `mcp__context7__get-library-docs`) to fetch up-to-date documentation without being explicitly asked.

**When to use:**

- Before implementing features that use Astro, Vue, svg-path-commander, etc.
- When encountering unexpected library behavior
- When configuring build tools, plugins, or integrations

---

## Frontend Requirements

### Day-One Requirements

These features must be present from the initial implementation of any UI:

1. **Light/Dark Mode** - All pages and components must support both themes

   - Use CSS variables for colors (defined in `src/styles/global.css`)
   - Use Tailwind's dark mode with class strategy
   - Never hardcode colors - always use theme variables

2. **Mobile-Friendly** - All UI must be responsive from the start

   - Split-panel layout stacks vertically on mobile
   - Touch-friendly tap targets (minimum 44x44px)
   - No horizontal scrolling on mobile

3. **Accessibility** - Use semantic HTML and ARIA attributes

   - All interactive elements must be keyboard accessible
   - Form inputs must have associated labels
   - Code editor must be accessible

4. **Performance** - Leverage Astro's static-first approach
   - Use `client:load` only for the tool Vue component
   - Lazy-load SVGO (it's large) - only when optimization is requested
   - Minimize JavaScript shipped to client

### Testing Requirements

Every page and critical flow must have tests:

```
/tests/
├── unit/              # Unit tests for /lib functions
│   ├── parse-svg.test.ts
│   ├── crop-viewbox.test.ts
│   ├── transform-paths.test.ts
│   └── optimize.test.ts
├── e2e/               # Playwright E2E tests
│   ├── tool-workflow.spec.ts
│   ├── theme.spec.ts
│   └── error-handling.spec.ts
```

**Test Coverage Rules:**

1. **All /lib functions require unit tests** - 90% coverage minimum
2. **E2E tests for the main workflow** - Upload/paste → process → download
3. **Test error states** - Invalid SVG, empty input, malformed paths
4. **Run tests before deployment** - `pnpm test && pnpm exec playwright test`

---

## Domain-Specific Requirements

### SVG Processing Pipeline

The tool performs these operations in order (user can toggle each):

1. **Crop Whitespace** - Calculate tight bounding box of all visible paths, update viewBox to match
2. **Transform to Origin** - Translate all path `d` attributes by negative viewBox offset (`-minX`, `-minY`)
3. **Normalize ViewBox** - Set viewBox to `0 0 width height` after transformation
4. **Optimize (SVGO)** - Run SVGO with safe defaults (remove metadata, prettify, etc.)
5. **Format Output** - Pretty-print or minify the final SVG

### Critical Technical Details

**Path Matching Regex:**

```typescript
// Match path d attributes - must start with a valid path command
/ d="([MLHVCSQTAZmlhvcsqtaz][^"]+)"/g;
```

This ensures we only match actual path data, not `id="..."` or other attributes.

**Coordinate Transformation:**

```typescript
import { transformPath, pathToString } from 'svg-path-commander';

const translated = transformPath(pathData, {
  translate: [-viewBox.minX, -viewBox.minY],
});
```

**Bounding Box Validation:**

```typescript
import { getPathBBox } from 'svg-path-commander';

// After transformation, verify all paths fit in 0 0 width height
const bbox = getPathBBox(transformedPath);
if (bbox.x < 0 || bbox.y < 0) {
  throw new Error('Path extends outside normalized viewBox');
}
```

### UI Layout

Split-panel interface similar to svgviewer.dev:

- **Left panel:** Code editor (Monaco or CodeMirror) + file upload dropzone
- **Right panel:** Live SVG preview with zoom/pan
- **Bottom/sidebar:** Processing options as checkboxes (all enabled by default)
- **Action button:** "Fix SVG" runs selected operations
- **Output:** Download button + copy-to-clipboard

---

## Claude Code Agents

Agents are defined in `/.claude/agents/` and enforce project rules automatically.

### Agent Configuration

| Agent                      | Model  | Purpose                                                                |
| -------------------------- | ------ | ---------------------------------------------------------------------- |
| **planner**                | opus   | Strategic planning, architectural decisions, multi-step task breakdown |
| **frontend-dev**           | sonnet | UI components, Astro/Vue development                                   |
| **architecture-guardian**  | haiku  | Validate /lib vs component separation, import checks                   |
| **test-coverage-enforcer** | haiku  | Verify 90% coverage on /lib, run tests                                 |
| **documentation-monitor**  | haiku  | Ensure docs stay in sync with code                                     |
| **repo-hygiene-enforcer**  | haiku  | Check folder structure, no floating files                              |
| **release-manager**        | haiku  | Changelog and versioning                                               |
| **svg-validator**          | haiku  | Validate SVG processing logic correctness                              |

### Model Selection Guidelines

- **opus** - Complex reasoning, planning, architectural decisions
- **sonnet** - Code generation, implementation, UI development
- **haiku** - Fast validation, scanning, enforcement checks

### When to Use Each Agent

- **planner** - Before starting new features or major refactors
- **frontend-dev** - When building UI components or pages
- **architecture-guardian** - Before any commit touching /lib
- **test-coverage-enforcer** - After writing /lib code
- **documentation-monitor** - After modifying /lib functions
- **repo-hygiene-enforcer** - Before commits, periodically
- **release-manager** - When preparing releases
- **svg-validator** - After changes to SVG processing logic

### Parallelization

Agents can run in parallel when tasks are independent:

```
# PARALLEL: These agents check different things
├── architecture-guardian (validates imports)
├── test-coverage-enforcer (runs tests)
├── documentation-monitor (checks docs)
└── svg-validator (checks SVG logic)

# SEQUENTIAL: These depend on each other
1. planner (creates implementation plan)
2. frontend-dev (implements UI based on plan)
3. test-coverage-enforcer (validates tests after implementation)
```

---

## Plan Documentation

All implementation plans are stored in `/docs/plans/` for project history and traceability.

See **[ROADMAP.md](docs/ROADMAP.md)** for current progress and upcoming phases.

### Naming Convention

```
/docs/plans/
├── 01-project-setup.md
├── 02-svg-processing-lib.md
├── 03-tool-ui.md
└── NN-[feature-name].md
```

Format: `{NN}-{descriptive-name}.md` where NN is a zero-padded sequence number.

### Plan Structure

Every plan document must include:

1. **Plan ID** - Unique identifier matching filename
2. **Created Date** - When the plan was created
3. **Status** - Draft | Approved | In Progress | Complete
4. **Overview** - What the plan achieves
5. **Current State** - What exists before implementation
6. **Implementation Phases** - Ordered phases with dependencies
7. **File Structure** - New files to be created
8. **Constraints** - Rules from CLAUDE.md that apply
9. **Deliverables** - Expected outputs (files, tests, docs)

---

## Scripting Standards

All scripts in `/scripts` follow the **Shell Module Pattern** for consistency.

### Pattern: Shell Module

```bash
#!/usr/bin/env bash
set -euo pipefail

#===============================================================================
# SCRIPT NAME
# Description of what this script does
#===============================================================================

# --- Configuration ---
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# --- Functions ---
log_info() { echo "[INFO] $*"; }
log_error() { echo "[ERROR] $*" >&2; }

main() {
  log_info "Starting..."
  # Script logic here
  log_info "Done."
}

# --- Entry Point ---
main "$@"
```

### Script Rules

1. **Always use `set -euo pipefail`** - Fail fast on errors
2. **Use `readonly` for constants** - Prevent accidental modification
3. **Wrap logic in `main()` function** - Clear entry point
4. **Quote all variables** - Prevent word splitting

---

## Quick Reference

### Key Commands

```bash
# Development
pnpm install                   # Install dependencies
pnpm dev                       # Start Astro dev server (localhost:4321)
pnpm astro add vue             # Add Vue integration (already done)

# Testing
pnpm test                      # Run unit tests
pnpm test:coverage             # Run tests with coverage
pnpm exec playwright test      # E2E tests

# Build & Deploy
pnpm build                     # Build for production
pnpm preview                   # Preview production build
pnpm astro check               # Type-check Astro files
```

### Git Commit Format

```bash
git commit -m "$(cat <<'EOF'
feat: Add [feature name]

[Detailed description of what was added, changed, or fixed.
Include relevant context, standards followed, or decisions made.]

Tests: [Coverage percentage or test summary]

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Commit Types:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`
