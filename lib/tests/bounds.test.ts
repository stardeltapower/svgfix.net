import { describe, it, expect } from 'vitest';
import { getContentBounds, getPathBounds, getTransformAwareBounds } from '../bounds';

describe('getContentBounds', () => {
  it('should calculate bounds for single path', async () => {
    const paths = ['M 10 10 L 90 90'];
    const result = await getContentBounds(paths);

    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
    expect(result.x2).toBe(90);
    expect(result.y2).toBe(90);
    expect(result.width).toBe(80);
    expect(result.height).toBe(80);
  });

  it('should calculate union bounds for multiple paths', async () => {
    const paths = ['M 10 10 L 50 50', 'M 60 60 L 150 150'];
    const result = await getContentBounds(paths);

    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
    expect(result.x2).toBe(150);
    expect(result.y2).toBe(150);
    expect(result.width).toBe(140);
    expect(result.height).toBe(140);
  });

  it('should handle paths with negative coordinates', async () => {
    const paths = ['M -50 -50 L 50 50'];
    const result = await getContentBounds(paths);

    expect(result.x).toBe(-50);
    expect(result.y).toBe(-50);
    expect(result.x2).toBe(50);
    expect(result.y2).toBe(50);
  });

  it('should handle complex paths with curves', async () => {
    const paths = ['M 50 80 Q 100 50 150 80'];
    const result = await getContentBounds(paths);

    expect(result.x).toBeCloseTo(50, 1);
    expect(result.y).toBeCloseTo(65, 1); // Curve extends higher
    expect(result.x2).toBeCloseTo(150, 1);
    expect(result.y2).toBeCloseTo(80, 1);
  });

  it('should throw error for non-array input', async () => {
    await expect(() => getContentBounds('not an array' as any)).rejects.toThrow(TypeError);
    await expect(() => getContentBounds(null as any)).rejects.toThrow(TypeError);
  });

  it('should throw error for empty array', async () => {
    await expect(() => getContentBounds([])).rejects.toThrow('paths array cannot be empty');
  });

  it('should throw error for array with only empty strings', async () => {
    await expect(() => getContentBounds(['', '  ', ''])).rejects.toThrow('no valid paths found');
  });

  it('should skip invalid paths and calculate bounds for valid ones', async () => {
    const paths = ['M 10 10 L 90 90', 'invalid', 'M 100 100 L 200 200'];
    const result = await getContentBounds(paths);

    expect(result.x).toBe(10);
    expect(result.x2).toBe(200);
  });

  it('should handle paths with arc commands', async () => {
    const paths = ['M 140 100 A 20 20 0 0 1 180 100'];
    const result = await getContentBounds(paths);

    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('width');
    expect(result).toHaveProperty('height');
  });
});

describe('getTransformAwareBounds', () => {
  it('should handle identity matrix (no transform)', async () => {
    const paths = [{ d: 'M 10 10 L 90 90', matrix: [1, 0, 0, 1, 0, 0] as [number, number, number, number, number, number] }];
    const result = await getTransformAwareBounds(paths);

    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
    expect(result.x2).toBe(90);
    expect(result.y2).toBe(90);
  });

  it('should apply translate transform to bounds', async () => {
    const paths = [{ d: 'M 0 0 L 10 10', matrix: [1, 0, 0, 1, 50, 50] as [number, number, number, number, number, number] }];
    const result = await getTransformAwareBounds(paths);

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.x2).toBe(60);
    expect(result.y2).toBe(60);
    expect(result.width).toBe(10);
    expect(result.height).toBe(10);
  });

  it('should apply scale transform to bounds via corner transformation', async () => {
    const paths = [{ d: 'M 10 10 L 20 20', matrix: [2, 0, 0, 2, 0, 0] as [number, number, number, number, number, number] }];
    const result = await getTransformAwareBounds(paths);

    expect(result.x).toBe(20);
    expect(result.y).toBe(20);
    expect(result.x2).toBe(40);
    expect(result.y2).toBe(40);
  });

  it('should compute union of transformed and untransformed paths', async () => {
    type M = [number, number, number, number, number, number];
    const paths = [
      { d: 'M 100 100 L 150 150', matrix: [1, 0, 0, 1, 0, 0] as M },
      { d: 'M 0 0 L 10 10', matrix: [1, 0, 0, 1, 50, 50] as M }, // translate(50, 50)
    ];
    const result = await getTransformAwareBounds(paths);

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.x2).toBe(150);
    expect(result.y2).toBe(150);
  });

  it('should throw for empty array', async () => {
    await expect(() => getTransformAwareBounds([])).rejects.toThrow();
  });
});

describe('getPathBounds', () => {
  it('should calculate bounds for simple path', async () => {
    const result = await getPathBounds('M 0 0 L 100 100');

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.x2).toBe(100);
    expect(result.y2).toBe(100);
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  it('should calculate bounds for path with multiple segments', async () => {
    const result = await getPathBounds('M 10 10 L 90 10 L 90 90 L 10 90 Z');

    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
    expect(result.x2).toBe(90);
    expect(result.y2).toBe(90);
  });

  it('should throw TypeError for non-string input', async () => {
    await expect(() => getPathBounds(123 as any)).rejects.toThrow(TypeError);
  });

  it('should throw error for invalid path data', async () => {
    await expect(() => getPathBounds('invalid')).rejects.toThrow('Invalid path data');
  });

  it('should handle curve commands correctly', async () => {
    const result = await getPathBounds('M 60 120 C 70 100, 90 100, 100 120');

    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('width');
    expect(result).toHaveProperty('height');
  });
});
