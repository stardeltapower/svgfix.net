/**
 * Main SVG processing pipeline
 *
 * Combines all SVG processing operations into a single function.
 * Processes SVG based on provided options and returns detailed results.
 *
 * @param svgString - The SVG string to process
 * @param options - Processing options (defaults to all enabled)
 * @returns Processing result with SVG and statistics
 *
 * @throws Never throws - errors are returned in result.errors
 *
 * @example
 * ```typescript
 * const svg = '<svg viewBox="50 50 100 100"><path d="M 60 60 L 140 140"/></svg>';
 * const result = await processSvg(svg);
 * // result.svg has normalized coordinates starting at (0, 0)
 * // result.stats shows before/after viewBox
 * ```
 *
 * @example
 * ```typescript
 * // Process with custom options
 * const result = await processSvg(svg, {
 *   cropWhitespace: true,
 *   transformToOrigin: true,
 *   normalizeViewBox: true,
 *   optimize: false, // Skip optimization
 *   minify: false,
 * });
 * ```
 *
 * @see {@link ProcessingOptions}
 * @see {@link ProcessingResult}
 *
 * @lastModified 2026-01-13
 */
import type { ProcessingOptions, ProcessingResult, ViewBox } from './types';
import { DEFAULT_OPTIONS } from './types';
import { parseSvg } from './parse-svg';
import { getContentBounds } from './bounds';
import { cropToContent } from './crop';
import { transformPathsToOrigin } from './transform';
import { normalizeViewBox } from './normalize';
import { optimizeSvg } from './optimize';
import { formatSvg } from './format';

export async function processSvg(
  svgString: string,
  options: Partial<ProcessingOptions> = {}
): Promise<ProcessingResult> {
  const opts: ProcessingOptions = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  const originalSize = svgString.length;

  try {
    // Step 1: Parse SVG
    const parsed = parseSvg(svgString);
    let processedSvg = parsed.originalSvg;
    const viewBoxBefore = parsed.viewBox;

    // If no paths found, return early with warning
    if (parsed.paths.length === 0) {
      warnings.push('No paths found in SVG - nothing to process');
      return {
        svg: processedSvg,
        success: true,
        errors,
        warnings,
        stats: {
          originalSize,
          processedSize: processedSvg.length,
          viewBoxBefore,
          viewBoxAfter: viewBoxBefore || { minX: 0, minY: 0, width: 0, height: 0 },
        },
      };
    }

    // Step 2: Calculate content bounds (needed for crop and transform)
    let bounds;
    try {
      bounds = await getContentBounds(parsed.paths);
    } catch (error) {
      errors.push(
        `Failed to calculate bounds: ${error instanceof Error ? error.message : 'unknown'}`
      );
      return {
        svg: processedSvg,
        success: false,
        errors,
        warnings,
        stats: {
          originalSize,
          processedSize: processedSvg.length,
          viewBoxBefore,
          viewBoxAfter: viewBoxBefore || { minX: 0, minY: 0, width: 0, height: 0 },
        },
      };
    }

    let currentViewBox: ViewBox = viewBoxBefore || {
      minX: bounds.x,
      minY: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };

    // Step 3: Crop whitespace
    if (opts.cropWhitespace) {
      try {
        processedSvg = cropToContent(processedSvg, bounds);
        currentViewBox = {
          minX: bounds.x,
          minY: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      } catch (error) {
        warnings.push(`Crop failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    // Step 4: Transform paths to origin
    if (opts.transformToOrigin && (currentViewBox.minX !== 0 || currentViewBox.minY !== 0)) {
      try {
        processedSvg = await transformPathsToOrigin(processedSvg, currentViewBox);
      } catch (error) {
        warnings.push(`Transform failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    // Step 5: Normalize viewBox
    if (opts.normalizeViewBox) {
      try {
        processedSvg = normalizeViewBox(processedSvg, bounds.width, bounds.height);
        currentViewBox = {
          minX: 0,
          minY: 0,
          width: bounds.width,
          height: bounds.height,
        };
      } catch (error) {
        warnings.push(`Normalize failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    // Step 6: Optimize with SVGO
    if (opts.optimize) {
      try {
        processedSvg = await optimizeSvg(processedSvg);
      } catch (error) {
        warnings.push(`Optimization failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    // Step 7: Format output
    try {
      processedSvg = formatSvg(processedSvg, opts.minify);
    } catch (error) {
      warnings.push(`Formatting failed: ${error instanceof Error ? error.message : 'unknown'}`);
    }

    return {
      svg: processedSvg,
      success: true,
      errors,
      warnings,
      stats: {
        originalSize,
        processedSize: processedSvg.length,
        viewBoxBefore,
        viewBoxAfter: currentViewBox,
      },
    };
  } catch (error) {
    errors.push(`Processing failed: ${error instanceof Error ? error.message : 'unknown'}`);
    return {
      svg: svgString,
      success: false,
      errors,
      warnings,
      stats: {
        originalSize,
        processedSize: svgString.length,
        viewBoxBefore: null,
        viewBoxAfter: { minX: 0, minY: 0, width: 0, height: 0 },
      },
    };
  }
}
