# preprocessSvg

Preprocess SVG to normalize structure before the main processing pipeline.

## Purpose

Converts all non-path SVG shapes to `<path>` elements and bakes all `transform` attributes into path coordinates. This ensures the regex-based pipeline in `lib/` can correctly handle SVGs containing `<g>` groups with transforms, `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, and `<polygon>` elements.

## Signature

```typescript
async function preprocessSvg(svgString: string): Promise<string>
```

## Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| `svgString` | `string` | The raw SVG string to preprocess |

## Output

Returns the preprocessed SVG string with:
- All shapes converted to `<path>` elements
- All `transform` attributes baked into path `d` coordinates
- Empty `<g>` wrappers collapsed

## Throws

| Error Type | Condition |
|------------|-----------|
| `TypeError` | `svgString` is not a string |
| `Error` | `svgString` is empty or whitespace-only |
| `Error` | SVGO preprocessing fails |

## Assumptions

- SVGO is available as a dependency (lazy-loaded at call time)
- Input is a valid or near-valid SVG string
- Elements with `id` attributes may retain their transforms (SVGO safety behavior for `<use>` references)
- `<text>` elements are not converted (no font-metric-based path equivalent)

## SVGO Plugins Used

Executed in this order:

1. **`convertShapeToPath`** (`convertArcs: true`) — shapes to `<path>`
2. **`moveGroupAttrsToElems`** — pushes group transforms to children
3. **`convertTransform`** — simplifies transform strings
4. **`convertPathData`** (`applyTransforms: true`) — bakes transforms into `d` data
5. **`collapseGroups`** — removes empty group wrappers

All other SVGO optimizations are disabled to preserve path structure.

## Linked Tests

- `lib/tests/preprocess.test.ts` — 17 unit tests covering shape conversion, transform baking, mixed content, edge cases
- `lib/tests/process.test.ts` — integration tests via the full `processSvg()` pipeline

## Last Modified

2026-02-18
