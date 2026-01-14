# SVGFix Roadmap

**Version:** 1.0 Planning
**Last Updated:** 2025-01-13
**Domain:** svgfix.net

---

## Vision

SVGFix is the only online tool that **genuinely normalizes SVG coordinates** - not just cropping the viewBox, but actually translating path data so everything starts at `0 0`. This solves real problems when converting SVGs to PNG, using them in icon systems, or embedding them in applications that don't properly handle viewBox offsets.

**Design Philosophy:** Tool-first, no landing page. Users see the working interface immediately (like svgcrop.com and svgviewer.dev). SEO content lives below the fold or in expandable sections.

---

## Phase 1: Foundation

**Status:** Not Started
**Goal:** Working Astro project with basic infrastructure

### Deliverables

- [ ] Initialize Astro 5 project with Vue integration
- [ ] Configure Tailwind CSS v4 with dark mode (class strategy)
- [ ] Set up Vitest for unit testing
- [ ] Set up Playwright for E2E testing
- [ ] Configure ESLint + Prettier
- [ ] Create base layout with header/footer
- [ ] Implement light/dark theme toggle
- [ ] Deploy to Cloudflare Pages (preview)

### Files to Create

```
/src/pages/index.astro
/src/layouts/Layout.astro
/src/components/Header.astro
/src/components/Footer.astro
/src/components/ThemeToggle.astro
/src/styles/global.css
/tailwind.config.ts
/astro.config.mjs
/vitest.config.ts
/playwright.config.ts
/.prettierrc
/.eslintrc.cjs
```

---

## Phase 2: SVG Processing Library

**Status:** Not Started
**Goal:** Pure TypeScript library for SVG manipulation

### Deliverables

- [ ] `parseSvg()` - Parse SVG string, extract viewBox and paths
- [ ] `getContentBounds()` - Calculate bounding box of all visible content
- [ ] `cropToContent()` - Update viewBox to tight bounding box
- [ ] `transformPathsToOrigin()` - Translate all path `d` attributes by viewBox offset
- [ ] `normalizeViewBox()` - Set viewBox to `0 0 width height`
- [ ] `optimizeSvg()` - SVGO wrapper with safe defaults
- [ ] `formatSvg()` - Pretty-print or minify output
- [ ] `processSvg()` - Pipeline function combining all operations
- [ ] Unit tests for all functions (90% coverage)
- [ ] TSDoc documentation for all functions

### Files to Create

```
/lib/types.ts
/lib/parse-svg.ts
/lib/bounds.ts
/lib/crop.ts
/lib/transform.ts
/lib/normalize.ts
/lib/optimize.ts
/lib/format.ts
/lib/process.ts
/lib/index.ts
/lib/tests/parse-svg.test.ts
/lib/tests/bounds.test.ts
/lib/tests/crop.test.ts
/lib/tests/transform.test.ts
/lib/tests/normalize.test.ts
/lib/tests/optimize.test.ts
/lib/tests/format.test.ts
/lib/tests/process.test.ts
```

### Dependencies

```json
{
  "svg-path-commander": "2.x",
  "svgo": "3.x"
}
```

---

## Phase 3: Tool UI

**Status:** Not Started
**Goal:** Interactive Vue component with split-panel interface

### Deliverables

- [ ] Split-panel layout (code left, preview right)
- [ ] Code editor with syntax highlighting (CodeMirror or simple textarea)
- [ ] File upload via drag-drop or file picker
- [ ] Live SVG preview with zoom/pan
- [ ] Processing options checkboxes:
  - [x] Crop whitespace (default: on)
  - [x] Transform to origin (default: on)
  - [x] Normalize viewBox (default: on)
  - [x] Optimize with SVGO (default: on)
  - [ ] Minify output (default: off)
- [ ] "Fix SVG" action button
- [ ] Before/after comparison view
- [ ] Download button (`.svg` file)
- [ ] Copy to clipboard button
- [ ] Error handling with user-friendly messages
- [ ] Mobile-responsive layout (stacked panels)

### Files to Create

```
/src/components/SvgTool.vue
/src/components/CodeEditor.vue
/src/components/SvgPreview.vue
/src/components/ProcessingOptions.vue
/src/components/ActionBar.vue
/src/components/FileDropzone.vue
```

### UI States

1. **Empty** - Dropzone visible, "Paste or upload SVG" prompt
2. **Loaded** - Code editor populated, preview shows original
3. **Processing** - Button shows spinner, inputs disabled
4. **Complete** - Preview shows result, download/copy enabled
5. **Error** - Error message displayed, original preserved

---

## Phase 4: Polish & SEO

**Status:** Not Started
**Goal:** Production-ready with SEO optimization

### Deliverables

- [ ] Meta tags (title, description, og:image)
- [ ] Structured data (WebApplication schema)
- [ ] Below-fold SEO content section
- [ ] FAQ accordion (helps with long-tail keywords)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] 404 page
- [ ] Google Analytics 4 (GA4: G-RC45XTZLH0)
- [ ] Performance optimization (lazy-load SVGO)
- [ ] Accessibility audit and fixes
- [ ] Cross-browser testing

### SEO Content Topics

- What is viewBox in SVG?
- Why do SVG paths have offset coordinates?
- How to fix SVG for icon systems
- SVG optimization best practices
- Converting SVG to PNG without cropping issues

---

## Phase 5: Monetization

**Status:** Planning
**Goal:** Cover domain costs (~£11/year) without degrading UX

### Strategy: Donations First, Ads Later

The tool is **100% free** with full functionality. This is a hobby project under Star Delta Software Ltd - goal is to cover costs, not generate profit.

### Revenue Stream: Buy Me a Coffee (Primary)

**Why Buy Me a Coffee:**

- No traffic requirements (works from day 1)
- No exclusive contracts
- 5% fee only (you keep 95%)
- Instant payouts via Stripe
- Can receive as Star Delta Software Ltd
- Non-intrusive - just a footer link

**Implementation:**

```
Footer: "SVGFix is free forever. Like it? [Buy me a coffee] | Built by Star Delta Software"
```

**Realistic expectations:**

- Niche tool = 1-5 coffees/month once established
- At £3/coffee = £3-15/month
- Easily covers domain (~£11/year)
- VPS hosting shared with other Star Delta projects (no additional cost)

### Future: Ad Networks (Only if 10k+ monthly pageviews)

If traffic grows significantly, consider applying to:

| Network    | Min Traffic | Notes                         |
| ---------- | ----------- | ----------------------------- |
| Carbon Ads | 10k/month   | Developer-focused, exclusive  |
| EthicalAds | 50k/month   | Privacy-respecting, $2.50 CPM |

**Ad placement rules (if ever implemented):**

- Single ad below the tool only
- Never above the fold
- No mobile ads
- No interstitials/popups
- Keep Buy Me a Coffee alongside

### What We Won't Do

- Paywalls or feature restrictions
- Email capture requirements
- Forced account creation
- Intrusive ad formats
- Selling user data
- Tracking beyond basic analytics

---

## SEO Strategy

### Target Keywords

**Primary (high intent, lower competition):**

- "svg viewbox normalizer"
- "svg crop whitespace online"
- "fix svg viewbox"
- "svg path transform tool"
- "normalize svg coordinates"

**Secondary (broader, educational):**

- "svg viewbox explained"
- "svg offset coordinates fix"
- "svg to png cropping issues"
- "svg icon system problems"

**Long-tail (FAQ targets):**

- "why does my svg have offset viewbox"
- "svg paths not starting at 0 0"
- "convert svg to png cuts off image"
- "figma svg export viewbox problem"

### On-Page SEO

1. **Title:** "SVGFix - Normalize SVG ViewBox & Crop Whitespace | Free Online Tool"
2. **H1:** "SVG ViewBox Normalizer" (visible but below tool)
3. **Meta Description:** "Free tool to properly normalize SVG files. Crops whitespace, transforms path coordinates to origin, and optimizes output. No upload required - runs in your browser."

### Content Structure

```
[TOOL UI - Above the fold, immediate access]

[Below fold - expandable/scrollable]

## What This Tool Does
Brief explanation of the 4-step process

## Why You Need This
Common problems this solves

## FAQ
- What is viewBox in SVG?
- Why don't other crop tools fix my SVG?
- Is my SVG uploaded to a server?
- How do I use this with [Figma/Illustrator/etc]?

## Technical Details
For developers who want to understand the process
```

### Technical SEO

- Server-side rendered (Astro handles this)
- Fast load times (static site, CDN)
- Mobile-friendly (responsive design)
- Structured data for WebApplication
- Canonical URL
- XML sitemap

### Link Building Opportunities

- Submit to design tool directories
- Reddit posts in r/web_design, r/svg, r/frontend
- Dev.to article about the viewBox problem
- Twitter/X posts with before/after examples
- GitHub awesome-svg lists

---

## Success Metrics

### Launch (Month 1)

- [ ] Tool fully functional
- [ ] Deployed to svgfix.net
- [ ] Basic analytics in place
- [ ] Indexed by Google
- [ ] Buy Me a Coffee set up

### Growth (Month 2-3)

- [ ] 1,000 unique visitors/month
- [ ] First page Google for "svg viewbox normalizer"
- [ ] Positive feedback/shares
- [ ] First coffee donation

### Established (Month 6+)

- [ ] 10,000 unique visitors/month
- [ ] First page for 5+ target keywords
- [ ] Community contributions (if open source)
- [ ] Domain costs covered by donations

---

## Technical Decisions

### Why Astro?

- Static-first = fast load times
- Island architecture = minimal JS
- Built-in optimizations
- Easy Cloudflare Pages deployment
- Overkill avoided (vs Next.js, Nuxt)

### Why Vue for the Island?

- Familiar syntax
- Good TypeScript support
- Smaller bundle than React
- Single-file components

### Why Client-Side Processing?

- Privacy: SVGs never leave the browser
- Speed: No server round-trip
- Cost: No backend infrastructure
- Trust: Users can verify in DevTools

### Why svg-path-commander?

- Handles all SVG path commands correctly
- Transform functions built-in
- Bounding box calculation
- Well-maintained, TypeScript support

---

## Open Questions

1. **Code editor choice:** Monaco (feature-rich, large) vs CodeMirror (lighter) vs plain textarea (simplest)?

   - Recommendation: Start with textarea, upgrade if users request

2. **SVGO configuration:** Which plugins to enable by default?

   - Recommendation: Safe defaults only, no lossy optimizations

3. **Batch processing:** Support multiple files?

   - Recommendation: v1 single file only, batch in v2 if requested

4. **Open source:** Public repo from day 1?
   - Recommendation: Yes, builds trust and allows contributions

---

## Deployment

### Infrastructure (same as griddata.uk)

**Server:** VPS2 (shared with other Star Delta projects)
**SSH:** `ssh vps2`

| Component       | Details                                |
| --------------- | -------------------------------------- |
| App directory   | `/var/www/svgfix.net`                  |
| Port            | 3001                                   |
| Systemd service | `svgfix.service`                       |
| nginx config    | `/etc/nginx/sites-enabled/svgfix.net`  |
| SSL             | Let's Encrypt (auto-renew via certbot) |
| Logs            | `/var/log/svgfix.net.log`              |

### Deployment Commands

```bash
# Build locally
pnpm build

# Deploy to server
rsync -avz .output/ vps2:/var/www/svgfix.net/.output/

# Restart service
ssh vps2 "sudo systemctl restart svgfix"

# Check status
ssh vps2 "sudo systemctl status svgfix"

# View logs
ssh vps2 "tail -f /var/log/svgfix.net.log"
```

### Analytics

- **Google Analytics 4:** G-RC45XTZLH0

---

## Costs & Revenue

### Fixed Costs

| Item                | Cost          | Frequency                  |
| ------------------- | ------------- | -------------------------- |
| Domain (svgfix.net) | ~£11          | Annual                     |
| VPS hosting         | £0            | Shared with other projects |
| **Total**           | **~£11/year** |                            |

### Revenue Target

- **Break-even:** 4 coffees/year at £3 each = £12
- **Comfortable:** 1 coffee/month = £36/year

This is achievable once the tool has ~500+ monthly visitors.

---

## Phase 6: Minimal UI Redesign

**Status:** Planned
**Goal:** Strip down to SVGCrop-style simplicity
**Reference:** See `docs/COMPETITIVE-ANALYSIS.md` for full research

### Design Inspiration

Based on competitive analysis, the most successful minimal tools (SVGCrop, svgfix.com) share:

- Single large drop zone (70%+ of viewport)
- ~20 words of text total
- Auto-process on upload (no "Fix" button)
- Results with Download/Copy buttons
- Coffee/donation link in footer

### Proposed Layout

See `docs/COMPETITIVE-ANALYSIS.md` → Appendix A for ASCII wireframes.

**Before upload:**

- Logo + dark/light toggle
- Giant drop zone with "Drop your SVG here"
- One-line tagline
- Footer with coffee link + StarDelta attribution

**After upload:**

- SVG preview
- "Fixed! Saved X%" badge
- Download / Copy / Fix Another buttons

### Colour Scheme Options

**Option A: Teal (matches griddata.uk)**

```css
--color-primary: #2dd4bf;
--color-primary-hover: #06b6d4;
```

**Option B: Golden (matches stardeltapower.co.uk)**

```css
--color-primary: #c9a47a;
--color-primary-hover: #a67c52;
```

**Option C: Fresh/Distinct (recommended for differentiation)**

```css
--color-primary: #10b981; /* Emerald green - "fix/success" connotation */
--color-primary-hover: #059669;
```

### Changes Required

**Remove:**

- Two-column input/output layout
- 5 processing option checkboxes
- Input/output textareas
- Statistics panel (inline the savings)
- SEO content sections (move to /about or remove)

**Keep:**

- Drop zone (make huge)
- SVG preview
- Download/Copy buttons
- Dark/light mode toggle
- Coffee link

**Add:**

- Auto-process on file drop
- Inline "Saved X%" success badge
- StarDelta attribution in footer

---

## Changelog

### 2025-01-13

- Initial roadmap created
- Defined 5 implementation phases
- Simplified monetization to Buy Me a Coffee only
- Added costs & revenue section
- Domain confirmed: svgfix.net
- VPS infrastructure set up (nginx, systemd, SSL)

### 2026-01-13

- [x] Competitive analysis completed (see `docs/COMPETITIVE-ANALYSIS.md`)
- [x] Screenshots captured of 6 competitor tools
- [x] stardelta.io landing page created and deployed
- [x] StarDelta brand identity established:
  - Domain: stardelta.io
  - GitHub: github.com/stardeltaio
  - Email: hello@stardelta.io
  - Buy Me a Coffee: buymeacoffee.com/stardelta
- [ ] Minimal UI redesign (in progress)
