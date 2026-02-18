/**
 * Preprocess SVG to normalize structure before the main pipeline
 *
 * Uses a targeted subset of SVGO plugins to:
 * 1. Convert all non-path shapes (rect, circle, ellipse, etc.) to <path> elements
 * 2. Push group transform attributes down to child elements
 * 3. Bake transform attributes into path coordinate data
 * 4. Collapse now-unnecessary group wrappers
 *
 * After preprocessing, the SVG contains only <path> elements with no transform
 * attributes, allowing the regex-based pipeline to work correctly.
 *
 * @param svgString - The SVG string to preprocess
 * @returns Preprocessed SVG string with all shapes as paths and transforms baked in
 *
 * @throws {TypeError} When svgString is not a string
 * @throws {Error} When preprocessing fails
 *
 * @example
 * ```typescript
 * // SVG with rect and group transform
 * const svg = '<svg viewBox="0 0 200 200"><g transform="translate(10,10)"><rect x="0" y="0" width="80" height="80"/></g></svg>';
 * const preprocessed = await preprocessSvg(svg);
 * // preprocessed now has <path> with coordinates that include the translate
 * ```
 *
 * @example
 * ```typescript
 * // SVG with circle
 * const svg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
 * const preprocessed = await preprocessSvg(svg);
 * // preprocessed now has <path d="..."> equivalent of the circle
 * ```
 *
 * @see {@link processSvg} - Main pipeline that calls this function
 * @see {@link optimizeSvg} - Final optimization step (runs separately)
 *
 * @lastModified 2026-02-18
 */
export async function preprocessSvg(svgString: string): Promise<string> {
  if (typeof svgString !== 'string') {
    throw new TypeError('svgString must be a string');
  }

  if (!svgString.trim()) {
    throw new Error('svgString cannot be empty');
  }

  try {
    // Lazy-load SVGO
    const { optimize } = await import('svgo');

    const result = optimize(svgString, {
      plugins: [
        // Step 1: Convert shapes (rect, circle, ellipse, line, polyline, polygon) to <path>
        {
          name: 'convertShapeToPath',
          params: {
            convertArcs: true,
          },
        },
        // Step 2: Push group transform attributes down to child elements
        'moveGroupAttrsToElems',
        // Step 3: Simplify transform strings before baking
        'convertTransform',
        // Step 4: Bake transforms into path coordinates
        {
          name: 'convertPathData',
          params: {
            applyTransforms: true,
            applyTransformsStroked: true,
            floatPrecision: 6,
            // Disable all other path data optimizations — only bake transforms
            straightCurves: false,
            lineShorthands: false,
            curveSmoothShorthands: false,
            convertToQ: false,
            convertToZ: false,
            removeUseless: false,
            collapseRepeated: false,
            utilizeAbsolute: false,
            makeArcs: { threshold: 0, tolerance: 0 },
          },
        },
        // Step 5: Remove now-empty group wrappers
        'collapseGroups',
      ],
    });

    return result.data;
  } catch (error) {
    throw new Error(
      `Preprocessing failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
