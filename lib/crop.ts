/**
 * Crop SVG viewBox to content bounds
 *
 * Updates the viewBox attribute to match the bounding box of all visible content,
 * effectively removing whitespace around the SVG.
 *
 * @param svgString - The SVG string to crop
 * @param bounds - The bounding box of content
 * @returns SVG string with updated viewBox
 *
 * @throws {TypeError} When inputs are invalid types
 * @throws {Error} When SVG element not found
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="0 0 200 200"><path d="M 50 50 L 150 150"/></svg>';
 * const bounds = { x: 50, y: 50, x2: 150, y2: 150, width: 100, height: 100 };
 * const cropped = cropToContent(svg, bounds);
 * // SVG now has viewBox="50 50 100 100"
 * ```
 *
 * @see {@link BoundingBox}
 *
 * @lastModified 2026-01-13
 */
export function cropToContent(svgString: string, bounds: import('./types').BoundingBox): string {
  if (typeof svgString !== 'string') {
    throw new TypeError('svgString must be a string');
  }

  if (!bounds || typeof bounds !== 'object') {
    throw new TypeError('bounds must be a BoundingBox object');
  }

  const newViewBox = `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;

  // Replace existing viewBox or add new one
  if (svgString.includes('viewBox=')) {
    return svgString.replace(/viewBox=["'][^"']*["']/i, `viewBox="${newViewBox}"`);
  } else {
    return svgString.replace(/<svg/i, `<svg viewBox="${newViewBox}"`);
  }
}
