import { describe, it, expect } from 'vitest';
import { processSvg } from '../process';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8');
}

describe('processSvg', () => {
  it('should process simple SVG with default options', async () => {
    const svg = loadFixture('simple.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.svg).toContain('viewBox="0 0');
    expect(result.stats.viewBoxAfter.minX).toBe(0);
    expect(result.stats.viewBoxAfter.minY).toBe(0);
  });

  it('should transform offset SVG to origin', async () => {
    const svg = loadFixture('offset.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.stats.viewBoxBefore?.minX).toBe(50);
    expect(result.stats.viewBoxAfter.minX).toBe(0);
    expect(result.stats.viewBoxAfter.minY).toBe(0);
  });

  it('should process complex SVG with multiple paths', async () => {
    const svg = loadFixture('complex.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.svg).toContain('viewBox="0 0');
  });

  it('should handle SVG without viewBox', async () => {
    const svg = loadFixture('no-viewbox.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.stats.viewBoxBefore).toBeNull();
    expect(result.stats.viewBoxAfter.minX).toBe(0);
  });

  it('should respect partial options', async () => {
    const svg = loadFixture('simple.svg');
    const result = await processSvg(svg, {
      cropWhitespace: true,
      transformToOrigin: false,
      normalizeViewBox: false,
      optimize: false,
      minify: false,
    });

    expect(result.success).toBe(true);
  });

  it('should process SVG with only shapes after preprocessing', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80"/></svg>';
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    // With preprocessing enabled (default), rect is converted to path
    expect(result.warnings).not.toContain('No paths found in SVG - nothing to process');
    expect(result.svg).toContain('<path');
  });

  it('should skip preprocessing when preprocessShapes is false', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80"/></svg>';
    const result = await processSvg(svg, { preprocessShapes: false });

    // Without preprocessing, rect is invisible to the pipeline
    expect(result.warnings).toContain('No paths found in SVG - nothing to process');
  });

  it('should warn when no visual content exists at all', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls{fill:red}</style></defs></svg>';
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.warnings).toContain('No paths found in SVG - nothing to process');
  });

  it('should return errors for invalid SVG', async () => {
    const svg = 'not an svg';
    const result = await processSvg(svg);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should minify when option is enabled', async () => {
    const svg = loadFixture('simple.svg');
    const result = await processSvg(svg, { minify: true });

    expect(result.success).toBe(true);
    expect(result.svg).not.toContain('\n  '); // No indentation
  });

  it('should report size reduction in stats', async () => {
    const svg = loadFixture('simple.svg');
    const result = await processSvg(svg, { optimize: true, minify: true });

    expect(result.success).toBe(true);
    expect(result.stats.processedSize).toBeLessThanOrEqual(result.stats.originalSize);
  });

  // --- Preprocessing integration tests ---

  it('should process shapes-only SVG via preprocessing', async () => {
    const svg = loadFixture('shapes-only.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.warnings).not.toContain('No paths found in SVG - nothing to process');
    expect(result.svg).toContain('viewBox="0 0');
  });

  it('should process SVG with group transforms correctly', async () => {
    const svg = loadFixture('group-transform.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.stats.viewBoxAfter.minX).toBe(0);
    expect(result.stats.viewBoxAfter.minY).toBe(0);
  });

  it('should process SVG with nested group transforms', async () => {
    const svg = loadFixture('nested-groups.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.stats.viewBoxAfter.minX).toBe(0);
    expect(result.stats.viewBoxAfter.minY).toBe(0);
  });

  it('should process SVG with mixed shapes and paths', async () => {
    const svg = loadFixture('mixed-content.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.svg).toContain('viewBox="0 0');
  });

  it('should process SVG with transform on path element', async () => {
    const svg = loadFixture('path-with-transform.svg');
    const result = await processSvg(svg);

    expect(result.success).toBe(true);
    expect(result.svg).not.toMatch(/transform=/);
    expect(result.svg).toContain('viewBox="0 0');
  });
});
