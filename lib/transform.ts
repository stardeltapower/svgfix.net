/**
 * Transform SVG paths to origin
 *
 * Translates all path coordinates by the negative viewBox offset,
 * effectively moving the content so it starts at (0, 0).
 *
 * Uses two strategies based on SVG complexity:
 * - Simple SVGs (no group transforms): shifts path d values directly
 * - Complex SVGs (with group transforms): wraps content in a translate
 *   group to preserve clip-path and filter coordinate relationships
 *
 * @param svgString - The SVG string to transform
 * @param viewBox - The viewBox with offset to remove
 * @returns SVG string with transformed paths
 *
 * @throws {TypeError} When inputs are invalid types
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="50 50 100 100"><path d="M 60 60 L 140 140"/></svg>';
 * const viewBox = { minX: 50, minY: 50, width: 100, height: 100 };
 * const transformed = await transformPathsToOrigin(svg, viewBox);
 * // Path is now "M10 10L90 90" (translated by -50, -50)
 * ```
 *
 * @example
 * ```typescript
 * // SVG with group transforms uses wrapper approach
 * const svg = '<svg viewBox="50 50 100 100"><g transform="translate(50,50)"><path d="M 0 0 L 10 10"/></g></svg>';
 * const result = await transformPathsToOrigin(svg, viewBox);
 * // Wraps content in <g transform="translate(-50, -50)"> instead of shifting d values
 * ```
 *
 * @see {@link ViewBox}
 *
 * @lastModified 2026-02-18
 */
export async function transformPathsToOrigin(
  svgString: string,
  viewBox: import('./types').ViewBox
): Promise<string> {
  if (typeof svgString !== 'string') {
    throw new TypeError('svgString must be a string');
  }

  if (!viewBox || typeof viewBox !== 'object') {
    throw new TypeError('viewBox must be a ViewBox object');
  }

  // If viewBox already starts at origin, no transformation needed
  if (viewBox.minX === 0 && viewBox.minY === 0) {
    return svgString;
  }

  const dx = -viewBox.minX;
  const dy = -viewBox.minY;

  // Check if the SVG contains <g> elements with transform attributes.
  // If so, use a wrapper group approach to preserve clip-path, filter,
  // and mask coordinate relationships. Clip-paths in <defs> may be
  // referenced from different coordinate contexts (root vs. inside
  // transformed groups), so selectively shifting individual d values
  // would break rendering.
  const hasGroupTransforms = /<g\s[^>]*transform\s*=/i.test(svgString);

  if (hasGroupTransforms) {
    return wrapWithTranslate(svgString, dx, dy);
  }

  // Simple case: no group transforms. All content is in root coordinate
  // space, so we can safely shift all path d values uniformly.
  return await shiftAllPathDs(svgString, dx, dy);
}

/**
 * Wrap all SVG inner content in a translate group.
 *
 * This preserves all internal coordinate relationships because:
 * - <defs> content is not rendered and clip-path coordinates resolve
 *   in the referencing element's coordinate system, not the def's position
 * - All referencing elements are uniformly shifted by the wrapper
 * - Nested group transforms remain unchanged relative to each other
 *
 * The SVGO optimization step (if enabled) can later bake the wrapper
 * translate into individual paths where no clip-path/filter blocks it.
 */
function wrapWithTranslate(svgString: string, dx: number, dy: number): string {
  const svgOpenMatch = svgString.match(/<svg[^>]*>/i);
  if (!svgOpenMatch) return svgString;

  const svgOpenEnd = svgOpenMatch.index! + svgOpenMatch[0].length;
  const svgCloseIdx = svgString.lastIndexOf('</svg>');
  if (svgCloseIdx === -1) return svgString;

  return (
    svgString.substring(0, svgOpenEnd) +
    `<g transform="translate(${dx}, ${dy})">` +
    svgString.substring(svgOpenEnd, svgCloseIdx) +
    '</g>' +
    svgString.substring(svgCloseIdx)
  );
}

/**
 * Shift all path d values in the SVG by (dx, dy).
 *
 * Used only for simple SVGs without group transforms, where all paths
 * (including those in <defs>) are in root coordinate space.
 */
async function shiftAllPathDs(svgString: string, dx: number, dy: number): Promise<string> {
  const svgPathCommander = (await import('svg-path-commander')) as any;
  const transformPath = svgPathCommander.transformPath || svgPathCommander.default?.transformPath;
  const pathToString = svgPathCommander.pathToString || svgPathCommander.default?.pathToString;

  return svgString.replace(
    /(\sd=["'])([MLHVCSQTAZmlhvcsqtaz][^"']*)["']/gi,
    (match, prefix, pathData) => {
      try {
        const translated = transformPath(pathData, { translate: [dx, dy] });
        const newPathData = pathToString(translated);
        return `${prefix}${newPathData}"`;
      } catch {
        console.warn(`Failed to transform path: ${pathData.substring(0, 50)}...`);
        return match;
      }
    }
  );
}
