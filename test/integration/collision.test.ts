/**
 * Integration tests for drawing and collision detection
 *
 * Tests:
 * 1. Polymorphic parameter expansion in rect()/box()/line() correctly accumulates hitBoxes
 * 2. createShorthand color shorthand map propagates to Collision
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector } from '../../src/vector';

// Mock dependencies
vi.mock('../../src/view', () => ({
  fillRect: vi.fn(),
  drawLine: vi.fn(),
  setColor: vi.fn(),
  currentColor: 'white',
  theme: { isUsingPixi: false },
}));

// Import after mocks
import * as collision from '../../src/collision';
import * as rect from '../../src/rect';

describe('collision integration', () => {
  beforeEach(() => {
    collision.clear();
    vi.clearAllMocks();
  });

  describe('rect drawing and hitBoxes', () => {
    it('should create hitBoxes when drawing rect with Vector parameter', () => {
      collision.clear();

      const pos = new Vector(10, 20);
      rect.rect(pos, 30, 40);

      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBeGreaterThan(0);
      expect(collision.hitBoxes[0].pos).toEqual({ x: 10, y: 20 });
      expect(collision.hitBoxes[0].size).toEqual({ x: 30, y: 40 });
    });

    it('should create hitBoxes when drawing rect with number parameters', () => {
      collision.clear();

      rect.rect(5, 10, 15, 20);

      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBeGreaterThan(0);
      expect(collision.hitBoxes[0].pos).toEqual({ x: 5, y: 10 });
      expect(collision.hitBoxes[0].size).toEqual({ x: 15, y: 20 });
    });

    it('should create hitBoxes when drawing box (centered)', () => {
      collision.clear();

      rect.box(50, 50, 20, 10);

      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBeGreaterThan(0);
      // Box is centered, so top-left should be at (50-10, 50-5) = (40, 45)
      expect(collision.hitBoxes[0].pos.x).toBe(40);
      expect(collision.hitBoxes[0].pos.y).toBe(45);
      expect(collision.hitBoxes[0].size).toEqual({ x: 20, y: 10 });
    });

    it('should accumulate multiple hitBoxes', () => {
      collision.clear();

      rect.rect(0, 0, 10, 10);
      collision.concatTmpHitBoxes();

      rect.rect(20, 20, 10, 10);
      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBe(2);
    });
  });

  describe('collision detection', () => {
    it('should detect collision between overlapping hitBoxes', () => {
      collision.clear();

      // Draw first rect
      rect.rect(0, 0, 20, 20);
      collision.concatTmpHitBoxes();

      // Draw second rect that overlaps with first
      const result = rect.rect(10, 10, 20, 20);

      // Should detect collision
      expect(result.isColliding.rect).toBeDefined();
    });

    it('should not detect collision for non-overlapping hitBoxes', () => {
      collision.clear();

      // Draw first rect
      rect.rect(0, 0, 10, 10);
      collision.concatTmpHitBoxes();

      // Draw second rect that doesn't overlap
      const result = rect.rect(50, 50, 10, 10);

      // Should not detect collision with rect
      expect(Object.keys(result.isColliding.rect || {}).length).toBe(0);
    });

    it('should propagate shorthand color flags to collision result', async () => {
      const viewModule = await import('../../src/view');

      collision.clear();

      // Set current color to red and draw first rect
      vi.mocked(viewModule).currentColor = 'red';
      rect.rect(0, 0, 20, 20);
      collision.concatTmpHitBoxes();

      // Set current color to blue and draw overlapping rect
      vi.mocked(viewModule).currentColor = 'blue';
      const result = rect.rect(10, 10, 20, 20);

      // Should detect collision
      expect(result.isColliding.rect).toBeDefined();

      // Should detect collision with full color name
      expect(result.isColliding.rect!.red).toBe(true);

      // Should also have shorthand color flag (rd for red)
      // This verifies that createShorthand propagates through checkHitBoxes
      // as per src/collision.ts:87-145
      expect(result.rd).toBe(true);
    });

    it('should include multiple shorthand flags for multi-color collisions', async () => {
      const viewModule = await import('../../src/view');

      collision.clear();

      // Draw red rect
      vi.mocked(viewModule).currentColor = 'red';
      rect.rect(0, 0, 30, 30);
      collision.concatTmpHitBoxes();

      // Draw green rect overlapping with red
      vi.mocked(viewModule).currentColor = 'green';
      rect.rect(10, 10, 30, 30);
      collision.concatTmpHitBoxes();

      // Draw blue rect overlapping with both
      vi.mocked(viewModule).currentColor = 'blue';
      const result = rect.rect(15, 15, 20, 20);

      // Should detect collision
      expect(result.isColliding.rect).toBeDefined();

      // Should detect collision with both colors
      expect(result.isColliding.rect!.red).toBe(true);
      expect(result.isColliding.rect!.green).toBe(true);

      // Should have shorthand flags for both
      expect(result.rd).toBe(true);
      expect(result.gr).toBe(true);
    });
  });

  describe('createShorthand', () => {
    it('should create color shorthand mappings', () => {
      const rects = {
        red: true,
        blue: true,
        green: true,
      };

      const shorthand = collision.createShorthand(rects);

      expect(shorthand).toEqual({
        rd: true,
        bl: true,
        gr: true,
      });
    });

    it('should handle empty rects', () => {
      const shorthand = collision.createShorthand({});

      expect(shorthand).toEqual({});
    });

    it('should handle null rects', () => {
      const shorthand = collision.createShorthand(null);

      expect(shorthand).toEqual({});
    });

    it('should only include true values in shorthand', () => {
      const rects = {
        red: true,
        blue: false,
        green: true,
      };

      const shorthand = collision.createShorthand(rects);

      expect(shorthand).toEqual({
        rd: true,
        gr: true,
      });
      expect(shorthand['bl']).toBeUndefined();
    });

    it('should map all standard colors correctly', () => {
      const rects = {
        transparent: true,
        white: true,
        red: true,
        green: true,
        yellow: true,
        blue: true,
        purple: true,
        cyan: true,
        black: true,
      };

      const shorthand = collision.createShorthand(rects);

      expect(shorthand).toEqual({
        tr: true,
        wh: true,
        rd: true,
        gr: true,
        yl: true,
        bl: true,
        pr: true,
        cy: true,
        lc: true,
      });
    });
  });

  describe('bar and line drawing', () => {
    it('should create hitBoxes for bar', () => {
      collision.clear();

      rect.bar(50, 50, 30, 5);
      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBeGreaterThan(0);
    });

    it('should create hitBoxes for line with number parameters', () => {
      collision.clear();

      rect.line(10, 10, 50, 50, 3);
      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBeGreaterThan(0);
    });

    it('should create hitBoxes for line with Vector parameters', () => {
      collision.clear();

      const p1 = new Vector(10, 10);
      const p2 = new Vector(50, 50);
      rect.line(p1, p2, 3);
      collision.concatTmpHitBoxes();

      expect(collision.hitBoxes.length).toBeGreaterThan(0);
    });
  });

  describe('checkHitBoxes', () => {
    it('should check collision against existing hitBoxes', () => {
      collision.clear();

      // Draw a rect to create a hitBox
      rect.rect(10, 10, 20, 20);
      collision.concatTmpHitBoxes();

      // Verify that a hitBox was created
      expect(collision.hitBoxes.length).toBeGreaterThan(0);

      // Draw another overlapping rect and check for collision
      const result = rect.rect(15, 15, 20, 20);

      // Should have collision information
      expect(result.isColliding).toBeDefined();
    });

    it('should return empty collision for non-overlapping boxes', () => {
      collision.clear();

      // Add a hitBox by drawing rect
      rect.rect(10, 10, 20, 20);
      collision.concatTmpHitBoxes();

      // Check collision with non-overlapping box
      const testBox = {
        pos: { x: 100, y: 100 },
        size: { x: 20, y: 20 },
        collision: {
          isColliding: {
            rect: {},
            text: {},
            char: {},
          },
        },
      };

      const result = collision.checkHitBoxes(testBox);

      expect(result.isColliding.rect.red).toBeUndefined();
      expect(result.rd).toBeUndefined();
    });
  });
});
