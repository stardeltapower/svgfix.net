/**
 * Optimize SVG using SVGO
 *
 * Applies safe optimizations to reduce file size without losing quality.
 * SVGO is lazy-loaded to minimize initial bundle size.
 *
 * @param svgString - The SVG string to optimize
 * @returns Optimized SVG string
 *
 * @throws {TypeError} When svgString is not a string
 * @throws {Error} When optimization fails
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="0 0 100 100">  <path d="M 10 10 L 90 90"/>  </svg>';
 * const optimized = await optimizeSvg(svg);
 * // Whitespace removed, attributes cleaned up
 * ```
 *
 * @lastModified 2026-01-13
 */
export async function optimizeSvg(svgString: string): Promise<string> {
  if (typeof svgString !== 'string') {
    throw new TypeError('svgString must be a string');
  }

  try {
    // Lazy-load SVGO
    const { optimize } = await import('svgo');

    const result = optimize(svgString, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // Disable lossy optimizations
              cleanupNumericValues: false,
              convertPathData: {
                floatPrecision: 6, // High precision to avoid data loss
              },
              // Keep structure intact
              removeViewBox: false,
            },
          },
        },
        'sortAttrs', // Sort attributes for consistency
        // Note: We do NOT use 'removeXMLNS' because standalone SVG files
        // require xmlns="http://www.w3.org/2000/svg" to render in browsers
      ],
    });

    return result.data;
  } catch (error) {
    throw new Error(
      `Optimization failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
