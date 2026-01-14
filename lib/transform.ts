/**
 * Transform SVG paths to origin
 *
 * Translates all path coordinates by the negative viewBox offset,
 * effectively moving the content so it starts at (0, 0).
 *
 * @param svgString - The SVG string to transform
 * @param viewBox - The viewBox with offset to remove
 * @returns SVG string with transformed paths
 *
 * @throws {TypeError} When inputs are invalid types
 * @throws {Error} When transformation fails
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="50 50 100 100"><path d="M 60 60 L 140 140"/></svg>';
 * const viewBox = { minX: 50, minY: 50, width: 100, height: 100 };
 * const transformed = await transformPathsToOrigin(svg, viewBox);
 * // Path is now "M 10 10 L 90 90" (translated by -50, -50)
 * ```
 *
 * @see {@link ViewBox}
 *
 * @lastModified 2026-01-13
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

  const svgPathCommander = (await import('svg-path-commander')) as any;
  const transformPath = svgPathCommander.transformPath || svgPathCommander.default?.transformPath;
  const pathToString = svgPathCommander.pathToString || svgPathCommander.default?.pathToString;

  // Transform each path
  const pathRegex = /(<path[^>]*\sd=["'])([MLHVCSQTAZmlhvcsqtaz][^"']*)["']/gi;

  return svgString.replace(pathRegex, (match, prefix, pathData) => {
    try {
      const translated = transformPath(pathData, {
        translate: [-viewBox.minX, -viewBox.minY],
      });
      const newPathData = pathToString(translated);
      return `${prefix}${newPathData}"`;
    } catch {
      console.warn(`Failed to transform path: ${pathData.substring(0, 50)}...`);
      return match; // Keep original on error
    }
  });
}
