/**
 * Calculate bounding boxes for SVG paths
 *
 * Uses svg-path-commander to accurately calculate the bounding box
 * of SVG path data, accounting for all path commands including curves.
 *
 * @param paths - Array of SVG path d attributes
 * @returns Union bounding box containing all paths
 *
 * @throws {TypeError} When paths is not an array
 * @throws {Error} When paths array is empty
 *
 * @example
 * ```typescript
 * const paths = ['M 10 10 L 90 90', 'M 50 50 L 150 150'];
 * const bbox = await getContentBounds(paths);
 * // bbox = { x: 10, y: 10, x2: 150, y2: 150, width: 140, height: 140 }
 * ```
 *
 * @example
 * ```typescript
 * // Single path
 * const paths = ['M 0 0 L 100 100'];
 * const bbox = await getContentBounds(paths);
 * // bbox = { x: 0, y: 0, x2: 100, y2: 100, width: 100, height: 100 }
 * ```
 *
 * @see {@link BoundingBox}
 *
 * @lastModified 2026-01-13
 */
export async function getContentBounds(paths: string[]): Promise<import('./types').BoundingBox> {
  // Fail fast: validate input
  if (!Array.isArray(paths)) {
    throw new TypeError('paths must be an array');
  }

  if (paths.length === 0) {
    throw new Error('paths array cannot be empty');
  }

  // Filter out empty paths
  const validPaths = paths.filter((p) => p && p.trim());

  if (validPaths.length === 0) {
    throw new Error('no valid paths found');
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Use svg-path-commander to get accurate bounding boxes
  const svgPathCommander = (await import('svg-path-commander')) as any;
  const getPathBBox = svgPathCommander.getPathBBox || svgPathCommander.default?.getPathBBox;

  for (const pathData of validPaths) {
    try {
      const bbox = getPathBBox(pathData);

      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x2);
      maxY = Math.max(maxY, bbox.y2);
    } catch {
      // Skip invalid paths but warn
      console.warn(`Failed to calculate bounds for path: ${pathData.substring(0, 50)}...`);
    }
  }

  // Check if we got any valid bounds
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    throw new Error('failed to calculate bounds for any paths');
  }

  return {
    x: minX,
    y: minY,
    x2: maxX,
    y2: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get bounding box for a single path
 *
 * Helper function to get bounds for a single path.
 *
 * @param pathData - SVG path d attribute
 * @returns Bounding box for the path
 *
 * @throws {TypeError} When pathData is not a string
 * @throws {Error} When path is invalid
 *
 * @example
 * ```typescript
 * const bbox = await getPathBounds('M 10 10 L 90 90');
 * // bbox = { x: 10, y: 10, x2: 90, y2: 90, width: 80, height: 80 }
 * ```
 *
 * @lastModified 2026-01-13
 */
export async function getPathBounds(pathData: string): Promise<import('./types').BoundingBox> {
  if (typeof pathData !== 'string') {
    throw new TypeError('pathData must be a string');
  }

  const svgPathCommander = (await import('svg-path-commander')) as any;
  const getPathBBox = svgPathCommander.getPathBBox || svgPathCommander.default?.getPathBBox;

  try {
    const bbox = getPathBBox(pathData);
    return {
      x: bbox.x,
      y: bbox.y,
      x2: bbox.x2,
      y2: bbox.y2,
      width: bbox.x2 - bbox.x,
      height: bbox.y2 - bbox.y,
    };
  } catch (error) {
    throw new Error(
      `Invalid path data: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
