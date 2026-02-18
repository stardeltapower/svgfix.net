/**
 * Normalize SVG viewBox to start at origin
 *
 * Sets the viewBox to "0 0 width height" after paths have been transformed.
 * This is the final step to ensure the SVG truly starts at (0, 0).
 *
 * @param svgString - The SVG string to normalize
 * @param width - The content width
 * @param height - The content height
 * @returns SVG string with normalized viewBox
 *
 * @throws {TypeError} When inputs are invalid types
 * @throws {Error} When width or height are invalid
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="50 50 100 100"><path d="M 10 10 L 90 90"/></svg>';
 * const normalized = normalizeViewBox(svg, 100, 100);
 * // viewBox is now "0 0 100 100"
 * ```
 *
 * @lastModified 2026-01-13
 */
export function normalizeViewBox(svgString: string, width: number, height: number): string {
  if (typeof svgString !== 'string') {
    throw new TypeError('svgString must be a string');
  }

  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new TypeError('width and height must be numbers');
  }

  if (width <= 0 || height <= 0) {
    throw new Error('width and height must be positive');
  }

  const newViewBox = `0 0 ${width} ${height}`;

  let result = svgString;

  // Replace existing viewBox
  if (result.includes('viewBox=')) {
    result = result.replace(/viewBox=["'][^"']*["']/i, `viewBox="${newViewBox}"`);
  } else {
    result = result.replace(/<svg/i, `<svg viewBox="${newViewBox}"`);
  }

  // Remove explicit width/height and preserveAspectRatio from <svg> element
  // so the SVG scales naturally based on its viewBox
  result = result.replace(/(<svg[^>]*)\s+width=["'][^"']*["']/i, '$1');
  result = result.replace(/(<svg[^>]*)\s+height=["'][^"']*["']/i, '$1');
  result = result.replace(/(<svg[^>]*)\s+preserveAspectRatio=["'][^"']*["']/i, '$1');

  return result;
}
