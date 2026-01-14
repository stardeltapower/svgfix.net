/**
 * SVGFix - SVG Processing Library
 *
 * A pure TypeScript library for normalizing SVG files by cropping whitespace,
 * transforming path coordinates to origin, and optimizing output.
 *
 * @packageDocumentation
 */

// Export types
export type { ViewBox, BoundingBox, ParsedSvg, ProcessingOptions, ProcessingResult } from './types';

export { DEFAULT_OPTIONS } from './types';

// Export main processing function
export { processSvg } from './process';

// Export individual functions for advanced usage
export { parseSvg, parseViewBox } from './parse-svg';
export { getContentBounds, getPathBounds } from './bounds';
export { cropToContent } from './crop';
export { transformPathsToOrigin } from './transform';
export { normalizeViewBox } from './normalize';
export { optimizeSvg } from './optimize';
export { formatSvg } from './format';
