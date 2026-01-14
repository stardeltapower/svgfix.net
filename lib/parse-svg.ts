/**
 * Parse SVG string and extract viewBox and paths
 *
 * Extracts the SVG element, viewBox attribute, width/height attributes,
 * and all path d attributes from an SVG string. Handles missing or malformed
 * viewBox gracefully.
 *
 * @param svgString - The SVG string to parse
 * @returns Parsed SVG data structure
 *
 * @throws {TypeError} When svgString is not a string
 * @throws {Error} When SVG element is not found
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="0 0 100 100"><path d="M 10 10 L 90 90"/></svg>';
 * const parsed = parseSvg(svg);
 * // parsed.viewBox = { minX: 0, minY: 0, width: 100, height: 100 }
 * // parsed.paths = ['M 10 10 L 90 90']
 * ```
 *
 * @example
 * ```typescript
 * // Handle SVG without viewBox
 * const svg = '<svg width="100" height="100"><path d="M 0 0"/></svg>';
 * const parsed = parseSvg(svg);
 * // parsed.viewBox = null
 * // parsed.width = '100'
 * // parsed.height = '100'
 * ```
 *
 * @see {@link ViewBox}
 * @see {@link ParsedSvg}
 *
 * @lastModified 2026-01-13
 */
export function parseSvg(svgString: string): import('./types').ParsedSvg {
  // Fail fast: validate input
  if (typeof svgString !== 'string') {
    throw new TypeError('svgString must be a string');
  }

  if (!svgString.trim()) {
    throw new Error('svgString cannot be empty');
  }

  // Extract <svg> element
  const svgMatch = svgString.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
  if (!svgMatch) {
    throw new Error('No <svg> element found in input string');
  }

  const element = svgMatch[0];

  // Parse viewBox attribute
  let viewBox: import('./types').ViewBox | null = null;
  const viewBoxMatch = element.match(/viewBox=["']([^"']+)["']/i);

  if (viewBoxMatch) {
    const viewBoxStr = viewBoxMatch[1].trim();
    const parts = viewBoxStr.split(/[\s,]+/).map(Number);

    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      viewBox = {
        minX: parts[0],
        minY: parts[1],
        width: parts[2],
        height: parts[3],
      };
    }
  }

  // Parse width and height attributes
  const widthMatch = element.match(/width=["']([^"']+)["']/i);
  const heightMatch = element.match(/height=["']([^"']+)["']/i);

  const width = widthMatch ? widthMatch[1] : undefined;
  const height = heightMatch ? heightMatch[1] : undefined;

  // Extract all path d attributes
  const paths: string[] = [];
  const pathRegex = /<path[^>]*\sd=["']([MLHVCSQTAZmlhvcsqtaz][^"']*)["']/gi;
  let pathMatch;

  while ((pathMatch = pathRegex.exec(element)) !== null) {
    paths.push(pathMatch[1].trim());
  }

  return {
    element,
    viewBox,
    width,
    height,
    paths,
    originalSvg: svgString,
  };
}

/**
 * Parse a viewBox string into a ViewBox object
 *
 * Helper function to parse viewBox attribute values.
 *
 * @param viewBoxStr - The viewBox attribute value (e.g., "0 0 100 100")
 * @returns Parsed ViewBox object
 *
 * @throws {TypeError} When viewBoxStr is not a string
 * @throws {Error} When viewBox format is invalid
 *
 * @example
 * ```typescript
 * const vb = parseViewBox('0 0 100 100');
 * // vb = { minX: 0, minY: 0, width: 100, height: 100 }
 * ```
 *
 * @lastModified 2026-01-13
 */
export function parseViewBox(viewBoxStr: string): import('./types').ViewBox {
  if (typeof viewBoxStr !== 'string') {
    throw new TypeError('viewBox must be a string');
  }

  const parts = viewBoxStr
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error(`Invalid viewBox format: "${viewBoxStr}"`);
  }

  return {
    minX: parts[0],
    minY: parts[1],
    width: parts[2],
    height: parts[3],
  };
}
