/**
 * Unit tests for src/input.ts
 *
 * Tests:
 * 1. OR logic for pointer/keyboard states
 * 2. Verify 1-frame lifetime of clearJustPressed
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('../../src/keyboard', () => ({
  init: vi.fn(),
  update: vi.fn(),
  isPressed: false,
  isJustPressed: false,
  isJustReleased: false,
  clearJustPressed: vi.fn(),
}));

vi.mock('../../src/pointer', () => ({
  init: vi.fn(),
  update: vi.fn(),
  pos: { x: 50, y: 50 },
  isPressed: false,
  isJustPressed: false,
  isJustReleased: false,
  clearJustPressed: vi.fn(),
}));

vi.mock('../../src/view', () => ({
  canvas: typeof document !== 'undefined' ? document.createElement('canvas') : {},
  size: { x: 100, y: 100 },
}));

// Import after mocks are defined
import * as input from '../../src/input';
import { Vector } from '../../src/vector';

describe('input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize keyboard and pointer', async () => {
      const keyboardModule = await import('../../src/keyboard');
      const pointerModule = await import('../../src/pointer');

      const mockCallback = vi.fn();
      input.init(mockCallback);

      expect(keyboardModule.init).toHaveBeenCalled();
      expect(pointerModule.init).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should OR keyboard and pointer isPressed states', async () => {
      const keyboardModule = await import('../../src/keyboard');
      const pointerModule = await import('../../src/pointer');

      input.init(() => {});

      // Test: keyboard pressed, pointer not pressed
      (keyboardModule as any).isPressed = true;
      (pointerModule as any).isPressed = false;
      input.update();
      expect(input.isPressed).toBe(true);

      // Test: keyboard not pressed, pointer pressed
      (keyboardModule as any).isPressed = false;
      (pointerModule as any).isPressed = true;
      input.update();
      expect(input.isPressed).toBe(true);

      // Test: both pressed
      (keyboardModule as any).isPressed = true;
      (pointerModule as any).isPressed = true;
      input.update();
      expect(input.isPressed).toBe(true);

      // Test: neither pressed
      (keyboardModule as any).isPressed = false;
      (pointerModule as any).isPressed = false;
      input.update();
      expect(input.isPressed).toBe(false);
    });

    it('should OR keyboard and pointer isJustPressed states', async () => {
      const keyboardModule = await import('../../src/keyboard');
      const pointerModule = await import('../../src/pointer');

      input.init(() => {});

      // Test: keyboard just pressed, pointer not
      (keyboardModule as any).isJustPressed = true;
      (pointerModule as any).isJustPressed = false;
      input.update();
      expect(input.isJustPressed).toBe(true);

      // Test: pointer just pressed, keyboard not
      (keyboardModule as any).isJustPressed = false;
      (pointerModule as any).isJustPressed = true;
      input.update();
      expect(input.isJustPressed).toBe(true);

      // Test: both just pressed
      (keyboardModule as any).isJustPressed = true;
      (pointerModule as any).isJustPressed = true;
      input.update();
      expect(input.isJustPressed).toBe(true);

      // Test: neither just pressed
      (keyboardModule as any).isJustPressed = false;
      (pointerModule as any).isJustPressed = false;
      input.update();
      expect(input.isJustPressed).toBe(false);
    });

    it('should OR keyboard and pointer isJustReleased states', async () => {
      const keyboardModule = await import('../../src/keyboard');
      const pointerModule = await import('../../src/pointer');

      input.init(() => {});

      // Test: keyboard just released, pointer not
      (keyboardModule as any).isJustReleased = true;
      (pointerModule as any).isJustReleased = false;
      input.update();
      expect(input.isJustReleased).toBe(true);

      // Test: pointer just released, keyboard not
      (keyboardModule as any).isJustReleased = false;
      (pointerModule as any).isJustReleased = true;
      input.update();
      expect(input.isJustReleased).toBe(true);

      // Test: both just released
      (keyboardModule as any).isJustReleased = true;
      (pointerModule as any).isJustReleased = true;
      input.update();
      expect(input.isJustReleased).toBe(true);

      // Test: neither just released
      (keyboardModule as any).isJustReleased = false;
      (pointerModule as any).isJustReleased = false;
      input.update();
      expect(input.isJustReleased).toBe(false);
    });

    it('should update pos from pointer', async () => {
      const pointerModule = await import('../../src/pointer');

      input.init(() => {});

      const testPos = new Vector(75, 80);
      (pointerModule as any).pos = testPos;

      input.update();

      expect(input.pos.x).toBe(75);
      expect(input.pos.y).toBe(80);
    });
  });

  describe('clearJustPressed', () => {
    it('should call clearJustPressed on both keyboard and pointer', async () => {
      const keyboardModule = await import('../../src/keyboard');
      const pointerModule = await import('../../src/pointer');

      input.init(() => {});
      input.clearJustPressed();

      expect(keyboardModule.clearJustPressed).toHaveBeenCalled();
      expect(pointerModule.clearJustPressed).toHaveBeenCalled();
    });

    it('should clear just pressed state after one frame', async () => {
      const keyboardModule = await import('../../src/keyboard');
      const pointerModule = await import('../../src/pointer');

      input.init(() => {});

      // Set just pressed
      (keyboardModule as any).isJustPressed = true;
      (pointerModule as any).isJustPressed = false;
      input.update();
      expect(input.isJustPressed).toBe(true);

      // Clear and update again
      vi.mocked(keyboardModule.clearJustPressed).mockImplementation(() => {
        (keyboardModule as any).isJustPressed = false;
      });
      input.clearJustPressed();
      input.update();

      expect(input.isJustPressed).toBe(false);
    });
  });

  describe('set', () => {
    it('should set all input state', () => {
      input.init(() => {});

      const testState = {
        pos: new Vector(30, 40),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      input.set(testState);

      expect(input.pos.x).toBe(30);
      expect(input.pos.y).toBe(40);
      expect(input.isPressed).toBe(true);
      expect(input.isJustPressed).toBe(true);
      expect(input.isJustReleased).toBe(false);
    });
  });
});
