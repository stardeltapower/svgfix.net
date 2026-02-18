import { describe, it, expect } from 'vitest';
import { transformPathsToOrigin } from '../transform';

describe('transformPathsToOrigin', () => {
  it('should translate paths by negative viewBox offset', async () => {
    const svg = '<svg viewBox="50 50 100 100"><path d="M 60 60 L 140 140"/></svg>';
    const viewBox = { minX: 50, minY: 50, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    // Path should be translated by -50, -50
    expect(result).toContain('M10 10');
    expect(result).toContain('L90 90');
  });

  it('should not transform if viewBox is already at origin', async () => {
    const svg = '<svg viewBox="0 0 100 100"><path d="M 10 10 L 90 90"/></svg>';
    const viewBox = { minX: 0, minY: 0, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    expect(result).toBe(svg);
  });

  it('should handle negative viewBox offsets', async () => {
    const svg = '<svg viewBox="-50 -50 100 100"><path d="M -40 -40 L 40 40"/></svg>';
    const viewBox = { minX: -50, minY: -50, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    // Translate by +50, +50
    expect(result).toMatch(/M\s*10\s+10/);
  });

  it('should throw TypeError for invalid inputs', async () => {
    await expect(() => transformPathsToOrigin(123 as any, {} as any)).rejects.toThrow(TypeError);
    await expect(() => transformPathsToOrigin('<svg/>', null as any)).rejects.toThrow(TypeError);
  });

  it('should use wrapper group for SVGs with group transforms', async () => {
    const svg = '<svg viewBox="50 50 100 100"><g transform="translate(50, 50)"><path d="M 10 10 L 30 30"/></g></svg>';
    const viewBox = { minX: 50, minY: 50, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    // Path d should NOT be shifted (wrapper group handles the offset)
    expect(result).toContain('d="M 10 10 L 30 30"');
    // Original group transform preserved
    expect(result).toContain('translate(50, 50)');
    // Wrapper group with translate(-50, -50) added
    expect(result).toContain('translate(-50, -50)');
  });

  it('should preserve nested transforms with wrapper group approach', async () => {
    const svg = '<svg viewBox="10 10 100 100"><g transform="translate(10, 10)"><g transform="translate(20, 20)"><path d="M 5 5 L 15 15"/></g></g></svg>';
    const viewBox = { minX: 10, minY: 10, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    // Path d NOT shifted (wrapper handles offset)
    expect(result).toContain('d="M 5 5 L 15 15"');
    // Both original transforms preserved
    expect(result).toContain('translate(10, 10)');
    expect(result).toContain('translate(20, 20)');
    // Wrapper translate(-10, -10) added
    expect(result).toContain('translate(-10, -10)');
  });

  it('should preserve clip-path defs when using wrapper approach', async () => {
    const svg = '<svg viewBox="50 50 100 100"><defs><clipPath id="c"><path d="M 0 0 h 30 v 30 h -30 z"/></clipPath></defs><g transform="translate(50, 50)" clip-path="url(#c)"><path d="M 5 5 L 25 25"/></g></svg>';
    const viewBox = { minX: 50, minY: 50, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    // Clip-path d values should NOT be shifted
    expect(result).toContain('d="M 0 0 h 30 v 30 h -30 z"');
    // Content path d should NOT be shifted
    expect(result).toContain('d="M 5 5 L 25 25"');
    // Original transform preserved
    expect(result).toContain('translate(50, 50)');
    // Wrapper translate added
    expect(result).toContain('translate(-50, -50)');
  });

  it('should shift d values directly for simple SVGs without transforms', async () => {
    const svg = '<svg viewBox="50 50 100 100"><defs><clipPath id="c"><path d="M 50 50 h 100 v 100 h -100 z"/></clipPath></defs><path d="M 60 60 L 140 140"/></svg>';
    const viewBox = { minX: 50, minY: 50, width: 100, height: 100 };
    const result = await transformPathsToOrigin(svg, viewBox);

    // Both content and defs paths shifted uniformly
    expect(result).toContain('M10 10');
    expect(result).toContain('L90 90');
    // Clip-path also shifted (same coordinate space, no group transforms)
    expect(result).toContain('M0 0');
    // No wrapper group added
    expect(result).not.toContain('translate(-50, -50)');
  });
});
