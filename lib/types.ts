/**
 * Type definitions for SVG processing library
 * @lastModified 2026-01-13
 */

/**
 * Represents an SVG viewBox with x, y coordinates and dimensions
 */
export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/**
 * Represents a bounding box for SVG content
 */
export interface BoundingBox {
  x: number;
  y: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

/**
 * Result of parsing an SVG string
 */
export interface ParsedSvg {
  /** Full <svg> element as string */
  element: string;
  /** Parsed viewBox or null if not present */
  viewBox: ViewBox | null;
  /** Width attribute value if present */
  width?: string;
  /** Height attribute value if present */
  height?: string;
  /** Array of path d attribute values */
  paths: string[];
  /** Original SVG string */
  originalSvg: string;
}

/**
 * Options for SVG processing
 */
export interface ProcessingOptions {
  /** Preprocess: convert shapes to paths and bake transforms into coordinates */
  preprocessShapes: boolean;
  /** Crop whitespace by calculating tight bounding box */
  cropWhitespace: boolean;
  /** Transform path coordinates to origin (0, 0) */
  transformToOrigin: boolean;
  /** Normalize viewBox to start at 0 0 */
  normalizeViewBox: boolean;
  /** Optimize SVG using SVGO */
  optimize: boolean;
  /** Minify output (remove whitespace) */
  minify: boolean;
}

/**
 * Result of SVG processing operation
 */
export interface ProcessingResult {
  /** Processed SVG string */
  svg: string;
  /** Whether processing was successful */
  success: boolean;
  /** Array of error messages if any */
  errors: string[];
  /** Array of warning messages if any */
  warnings: string[];
  /** Statistics about the processing */
  stats: {
    /** Original SVG size in bytes */
    originalSize: number;
    /** Processed SVG size in bytes */
    processedSize: number;
    /** ViewBox before processing */
    viewBoxBefore: ViewBox | null;
    /** ViewBox after processing */
    viewBoxAfter: ViewBox;
  };
}

/**
 * Default processing options with all features enabled
 */
export const DEFAULT_OPTIONS: ProcessingOptions = {
  preprocessShapes: true,
  cropWhitespace: true,
  transformToOrigin: true,
  normalizeViewBox: true,
  optimize: true,
  minify: false,
};
