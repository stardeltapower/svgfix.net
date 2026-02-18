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

  // Extract visible path d attributes (skip paths inside defs, clipPath, mask, filter)
  const paths: string[] = extractVisualPaths(element);

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
/**
 * Extract path d attributes from visible content only
 *
 * Skips paths inside non-visual containers: <defs>, <clipPath>, <mask>, <filter>.
 * These elements define reusable resources but don't render directly, so including
 * them in bounding box calculations produces incorrect results.
 *
 * @param svgElement - The SVG element string to extract paths from
 * @returns Array of visible path d attribute values
 *
 * @lastModified 2026-02-18
 */
function extractVisualPaths(svgElement: string): string[] {
  const paths: string[] = [];
  // Skip paths inside these containers — they don't contribute to visible content bounds.
  // <defs> is excluded because its children (clipPath, pattern, etc.) define shapes in LOCAL
  // coordinate space of the referencing element, not SVG root space.
  const nonVisualTags = ['defs', 'mask', 'filter', 'symbol', 'pattern'];
  const stack: string[] = [];
  let pos = 0;

  while (pos < svgElement.length) {
    const tagStart = svgElement.indexOf('<', pos);
    if (tagStart === -1) break;

    const tagEnd = svgElement.indexOf('>', tagStart);
    if (tagEnd === -1) break;

    const tag = svgElement.substring(tagStart, tagEnd + 1);
    pos = tagEnd + 1;

    // Check for opening non-visual container tags
    for (const nvTag of nonVisualTags) {
      const openRegex = new RegExp(`^<${nvTag}[\\s>]`, 'i');
      if (openRegex.test(tag) && !tag.endsWith('/>')) {
        stack.push(nvTag);
        break;
      }
    }

    // Check for closing non-visual container tags
    for (const nvTag of nonVisualTags) {
      const closeRegex = new RegExp(`^</${nvTag}>`, 'i');
      if (closeRegex.test(tag) && stack[stack.length - 1] === nvTag) {
        stack.pop();
        break;
      }
    }

    // Only extract paths when NOT inside a non-visual container
    if (stack.length === 0) {
      const pathMatch = tag.match(/\sd=["']([MLHVCSQTAZmlhvcsqtaz][^"']*)["']/i);
      if (pathMatch && /^<path[\s>]/i.test(tag)) {
        paths.push(pathMatch[1].trim());
      }
    }
  }

  return paths;
}

/**
 * 2D affine transformation matrix [a, b, c, d, e, f]
 *
 * Represents:
 *   | a c e |
 *   | b d f |
 *   | 0 0 1 |
 */
type Matrix2D = [number, number, number, number, number, number];

const IDENTITY_MATRIX: Matrix2D = [1, 0, 0, 1, 0, 0];

function multiplyMatrices(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function parseTransformToMatrix(transformStr: string): Matrix2D {
  let result: Matrix2D = [...IDENTITY_MATRIX] as Matrix2D;
  const regex = /(translate|scale|rotate|matrix|skewX|skewY)\s*\(([^)]+)\)/gi;
  let match;
  while ((match = regex.exec(transformStr)) !== null) {
    const fn = match[1].toLowerCase();
    const args = match[2].split(/[\s,]+/).map(Number);
    let m: Matrix2D;
    switch (fn) {
      case 'translate':
        m = [1, 0, 0, 1, args[0] || 0, args[1] || 0];
        break;
      case 'scale': {
        const sx = args[0] || 1;
        const sy = args.length > 1 ? args[1] : sx;
        m = [sx, 0, 0, sy, 0, 0];
        break;
      }
      case 'rotate': {
        const angle = ((args[0] || 0) * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        if (args.length >= 3) {
          const cx = args[1], cy = args[2];
          m = [cos, sin, -sin, cos, cx - cx * cos + cy * sin, cy - cx * sin - cy * cos];
        } else {
          m = [cos, sin, -sin, cos, 0, 0];
        }
        break;
      }
      case 'matrix':
        m = [args[0], args[1], args[2], args[3], args[4], args[5]];
        break;
      case 'skewx': {
        const t = Math.tan(((args[0] || 0) * Math.PI) / 180);
        m = [1, 0, t, 1, 0, 0];
        break;
      }
      case 'skewy': {
        const t = Math.tan(((args[0] || 0) * Math.PI) / 180);
        m = [1, t, 0, 1, 0, 0];
        break;
      }
      default:
        m = [...IDENTITY_MATRIX] as Matrix2D;
    }
    result = multiplyMatrices(result, m);
  }
  return result;
}

/**
 * Extract visible path d attributes with their accumulated parent group transforms
 *
 * Like extractVisualPaths, but also tracks `<g>` transform attributes and returns
 * the accumulated transform matrix for each path. This allows bounds calculation
 * to account for group transforms that weren't baked into path coordinates
 * (e.g. groups with clip-path or filter that SVGO can't flatten).
 *
 * @param svgElement - The SVG element string to extract paths from
 * @returns Array of objects with path d value and accumulated transform matrix
 *
 * @lastModified 2026-02-18
 */
export function extractVisualPathsWithTransforms(
  svgElement: string
): Array<{ d: string; matrix: [number, number, number, number, number, number] }> {
  const results: Array<{ d: string; matrix: Matrix2D }> = [];
  // Exclude paths inside these containers — they use local coordinate spaces, not SVG root.
  const nonVisualTags = ['defs', 'mask', 'filter', 'symbol', 'pattern'];
  const nonVisualStack: string[] = [];
  const transformStack: Matrix2D[] = [];
  let pos = 0;

  while (pos < svgElement.length) {
    const tagStart = svgElement.indexOf('<', pos);
    if (tagStart === -1) break;

    const tagEnd = svgElement.indexOf('>', tagStart);
    if (tagEnd === -1) break;

    const tag = svgElement.substring(tagStart, tagEnd + 1);
    pos = tagEnd + 1;

    // Track <g> opening/closing for transform accumulation
    if (/^<g[\s>]/i.test(tag) && !tag.endsWith('/>')) {
      const transformMatch = tag.match(/\stransform=["']([^"']*)["']/i);
      const matrix = transformMatch
        ? parseTransformToMatrix(transformMatch[1])
        : ([...IDENTITY_MATRIX] as Matrix2D);
      transformStack.push(matrix);
    } else if (/^<\/g>/i.test(tag) && transformStack.length > 0) {
      transformStack.pop();
    }

    // Track non-visual container opening/closing
    for (const nvTag of nonVisualTags) {
      if (new RegExp(`^<${nvTag}[\\s>]`, 'i').test(tag) && !tag.endsWith('/>')) {
        nonVisualStack.push(nvTag);
        break;
      }
    }
    for (const nvTag of nonVisualTags) {
      if (new RegExp(`^</${nvTag}>`, 'i').test(tag) && nonVisualStack[nonVisualStack.length - 1] === nvTag) {
        nonVisualStack.pop();
        break;
      }
    }

    // Only extract visual elements when NOT inside a non-visual container
    if (nonVisualStack.length === 0) {
      // Compute accumulated transform from all parent groups
      let accumulated: Matrix2D = [...IDENTITY_MATRIX] as Matrix2D;
      for (const m of transformStack) {
        accumulated = multiplyMatrices(accumulated, m);
      }

      // Extract <path> elements
      const pathMatch = tag.match(/\sd=["']([MLHVCSQTAZmlhvcsqtaz][^"']*)["']/i);
      if (pathMatch && /^<path[\s>]/i.test(tag)) {
        // Include path's own transform attribute if present
        let pathAccum = accumulated;
        const pathTransformMatch = tag.match(/\stransform=["']([^"']*)["']/i);
        if (pathTransformMatch) {
          const pathMatrix = parseTransformToMatrix(pathTransformMatch[1]);
          pathAccum = multiplyMatrices(pathAccum, pathMatrix);
        }
        results.push({ d: pathMatch[1].trim(), matrix: pathAccum });
      }

      // Extract <image> element bounds (for raster content like bitmaps)
      // Creates a synthetic rect path from x/y/width/height attributes
      if (/^<image[\s>]/i.test(tag)) {
        const xMatch = tag.match(/\bx=["']([^"']*)["']/i);
        const yMatch = tag.match(/\by=["']([^"']*)["']/i);
        const wMatch = tag.match(/\bwidth=["']([^"']*)["']/i);
        const hMatch = tag.match(/\bheight=["']([^"']*)["']/i);

        const ix = parseFloat(xMatch?.[1] || '0');
        const iy = parseFloat(yMatch?.[1] || '0');
        const iw = parseFloat(wMatch?.[1] || '0');
        const ih = parseFloat(hMatch?.[1] || '0');

        if (iw > 0 && ih > 0) {
          // Include image's own transform if present
          let imgAccum = accumulated;
          const imgTransformMatch = tag.match(/\stransform=["']([^"']*)["']/i);
          if (imgTransformMatch) {
            const imgMatrix = parseTransformToMatrix(imgTransformMatch[1]);
            imgAccum = multiplyMatrices(imgAccum, imgMatrix);
          }
          const rectPath = `M${ix} ${iy}h${iw}v${ih}h${-iw}z`;
          results.push({ d: rectPath, matrix: imgAccum });
        }
      }
    }
  }

  return results;
}

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
