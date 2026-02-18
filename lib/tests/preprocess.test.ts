import { describe, it, expect } from 'vitest';
import { preprocessSvg } from '../preprocess';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8');
}

describe('preprocessSvg', () => {
  // --- Input validation ---

  it('should throw TypeError for non-string input', async () => {
    await expect(preprocessSvg(123 as any)).rejects.toThrow(TypeError);
  });

  it('should throw Error for empty string', async () => {
    await expect(preprocessSvg('')).rejects.toThrow('svgString cannot be empty');
  });

  it('should throw Error for whitespace-only string', async () => {
    await expect(preprocessSvg('   ')).rejects.toThrow('svgString cannot be empty');
  });

  // --- Shape conversion ---

  it('should convert rect to path', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).not.toContain('<rect');
  });

  it('should convert circle to path', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).not.toContain('<circle');
  });

  it('should convert ellipse to path', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="50" rx="40" ry="20"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).not.toContain('<ellipse');
  });

  it('should convert line to path', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="90" y2="90" stroke="black"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).not.toContain('<line');
  });

  it('should convert polygon to path', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).not.toContain('<polygon');
  });

  it('should convert polyline to path', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polyline points="10,10 50,50 90,10" fill="none" stroke="black"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).not.toContain('<polyline');
  });

  it('should convert all shapes in shapes-only fixture', async () => {
    const svg = loadFixture('shapes-only.svg');
    const result = await preprocessSvg(svg);
    expect(result).not.toContain('<rect');
    expect(result).not.toContain('<circle');
    expect(result).not.toContain('<ellipse');
    const pathCount = (result.match(/<path/g) || []).length;
    expect(pathCount).toBeGreaterThanOrEqual(3);
  });

  // --- Transform baking ---

  it('should bake group transform into path coordinates', async () => {
    const svg = loadFixture('group-transform.svg');
    const result = await preprocessSvg(svg);
    expect(result).not.toMatch(/transform=/);
    expect(result).toContain('<path');
  });

  it('should bake nested group transforms', async () => {
    const svg = loadFixture('nested-groups.svg');
    const result = await preprocessSvg(svg);
    expect(result).not.toMatch(/transform=/);
    expect(result).toContain('<path');
  });

  it('should bake transform on path element itself', async () => {
    const svg = loadFixture('path-with-transform.svg');
    const result = await preprocessSvg(svg);
    expect(result).not.toMatch(/transform=/);
    expect(result).toContain('<path');
  });

  // --- Mixed content ---

  it('should handle SVGs with both shapes and paths', async () => {
    const svg = loadFixture('mixed-content.svg');
    const result = await preprocessSvg(svg);
    expect(result).not.toContain('<rect');
    expect(result).not.toContain('<circle');
    const pathCount = (result.match(/<path/g) || []).length;
    expect(pathCount).toBeGreaterThanOrEqual(3);
  });

  // --- Passthrough ---

  it('should pass through paths-only SVG structurally intact', async () => {
    const svg =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 10 10 L 90 90"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<path');
    expect(result).toContain('viewBox');
  });

  // --- ViewBox preservation ---

  it('should preserve viewBox attribute', async () => {
    const svg =
      '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80"/></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('viewBox');
  });

  // --- Edge cases ---

  it('should handle SVG with no visual content', async () => {
    const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
    const result = await preprocessSvg(svg);
    expect(result).toContain('<svg');
  });
});
