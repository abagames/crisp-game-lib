/**
 * Unit tests for src/button.ts
 *
 * Tests:
 * 1. Button hover → press → toggle group behavior
 * 2. Color save/restore call sequence
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('../../src/pointer', () => ({
  isJustPressed: false,
  isJustReleased: false,
}));

vi.mock('../../src/input', () => ({
  pos: { x: 0, y: 0 },
}));

vi.mock('../../src/view', () => ({
  saveCurrentColor: vi.fn(),
  loadCurrentColor: vi.fn(),
  setColor: vi.fn(),
}));

vi.mock('../../src/rect', () => ({
  rect: vi.fn(),
}));

vi.mock('../../src/letter', () => ({
  text: vi.fn(),
}));

// Import after mocks are defined
import * as button from '../../src/button';
import { Vector } from '../../src/vector';

describe('button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should create a button with default values', () => {
      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      expect(btn.pos).toEqual({ x: 10, y: 20 });
      expect(btn.size).toEqual({ x: 50, y: 30 });
      expect(btn.text).toBe('Test');
      expect(btn.isToggle).toBe(false);
      expect(btn.isPressed).toBe(false);
      expect(btn.isSelected).toBe(false);
      expect(btn.isHovered).toBe(false);
      expect(btn.toggleGroup).toEqual([]);
      expect(btn.isSmallText).toBe(true);
    });

    it('should create a toggle button', () => {
      const btn = button.get({
        pos: { x: 0, y: 0 },
        size: { x: 50, y: 30 },
        text: 'Toggle',
        isToggle: true,
      });

      expect(btn.isToggle).toBe(true);
    });
  });

  describe('update', () => {
    it('should detect hover when pointer is over button', async () => {
      const inputModule = await import('../../src/input');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      // Pointer inside button bounds
      (inputModule as any).pos = new Vector(30, 35);

      button.update(btn);

      expect(btn.isHovered).toBe(true);
    });

    it('should not hover when pointer is outside button', async () => {
      const inputModule = await import('../../src/input');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      // Pointer outside button bounds
      (inputModule as any).pos = new Vector(5, 5);

      button.update(btn);

      expect(btn.isHovered).toBe(false);
    });

    it('should set pressed when hovered and pointer just pressed', async () => {
      const inputModule = await import('../../src/input');
      const pointerModule = await import('../../src/pointer');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      // Hover over button
      (inputModule as any).pos = new Vector(30, 35);
      (pointerModule as any).isJustPressed = true;

      button.update(btn);

      expect(btn.isPressed).toBe(true);
    });

    it('should clear pressed when no longer hovered', async () => {
      const inputModule = await import('../../src/input');
      const pointerModule = await import('../../src/pointer');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      // First, press the button
      (inputModule as any).pos = new Vector(30, 35);
      (pointerModule as any).isJustPressed = true;
      button.update(btn);
      expect(btn.isPressed).toBe(true);

      // Then move pointer away
      (pointerModule as any).isJustPressed = false;
      (inputModule as any).pos = new Vector(5, 5);
      button.update(btn);

      expect(btn.isPressed).toBe(false);
    });

    it('should call onClick when button is released while pressed', async () => {
      const inputModule = await import('../../src/input');
      const pointerModule = await import('../../src/pointer');

      const onClick = vi.fn();
      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
        onClick,
      });

      // Press button
      (inputModule as any).pos = new Vector(30, 35);
      (pointerModule as any).isJustPressed = true;
      button.update(btn);

      // Release button
      (pointerModule as any).isJustPressed = false;
      (pointerModule as any).isJustReleased = true;
      button.update(btn);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(btn.isPressed).toBe(false);
    });

    it('should toggle selection on single toggle button', async () => {
      const inputModule = await import('../../src/input');
      const pointerModule = await import('../../src/pointer');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Toggle',
        isToggle: true,
      });

      (inputModule as any).pos = new Vector(30, 35);

      // First click - select
      (pointerModule as any).isJustPressed = true;
      button.update(btn);
      (pointerModule as any).isJustPressed = false;
      (pointerModule as any).isJustReleased = true;
      button.update(btn);

      expect(btn.isSelected).toBe(true);

      // Second click - deselect
      (pointerModule as any).isJustReleased = false;
      (pointerModule as any).isJustPressed = true;
      button.update(btn);
      (pointerModule as any).isJustPressed = false;
      (pointerModule as any).isJustReleased = true;
      button.update(btn);

      expect(btn.isSelected).toBe(false);
    });

    it('should handle toggle group correctly', async () => {
      const inputModule = await import('../../src/input');
      const pointerModule = await import('../../src/pointer');

      const btn1 = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Button 1',
        isToggle: true,
      });

      const btn2 = button.get({
        pos: { x: 10, y: 60 },
        size: { x: 50, y: 30 },
        text: 'Button 2',
        isToggle: true,
      });

      // Set up toggle group
      btn1.toggleGroup = [btn1, btn2];
      btn2.toggleGroup = [btn1, btn2];

      (inputModule as any).pos = new Vector(30, 35);

      // Click first button
      (pointerModule as any).isJustPressed = true;
      button.update(btn1);
      (pointerModule as any).isJustPressed = false;
      (pointerModule as any).isJustReleased = true;
      button.update(btn1);

      expect(btn1.isSelected).toBe(true);
      expect(btn2.isSelected).toBe(false);

      // Click second button
      (inputModule as any).pos = new Vector(30, 75);
      (pointerModule as any).isJustReleased = false;
      (pointerModule as any).isJustPressed = true;
      button.update(btn2);
      (pointerModule as any).isJustPressed = false;
      (pointerModule as any).isJustReleased = true;
      button.update(btn2);

      expect(btn1.isSelected).toBe(false);
      expect(btn2.isSelected).toBe(true);
    });
  });

  describe('draw', () => {
    it('should call color save/restore in correct order', async () => {
      const viewModule = await import('../../src/view');
      const calls: string[] = [];

      vi.mocked(viewModule.saveCurrentColor).mockImplementation(() => {
        calls.push('save');
      });
      vi.mocked(viewModule.loadCurrentColor).mockImplementation(() => {
        calls.push('load');
      });
      vi.mocked(viewModule.setColor).mockImplementation(() => {
        calls.push('setColor');
      });

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      button.draw(btn);

      expect(calls[0]).toBe('save');
      expect(calls[calls.length - 1]).toBe('load');
    });

    it('should use different colors for pressed and unpressed states', async () => {
      const viewModule = await import('../../src/view');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Test',
      });

      // Unpressed state
      btn.isPressed = false;
      button.draw(btn);
      expect(viewModule.setColor).toHaveBeenCalledWith('light_blue');

      vi.clearAllMocks();

      // Pressed state
      btn.isPressed = true;
      button.draw(btn);
      expect(viewModule.setColor).toHaveBeenCalledWith('blue');
    });

    it('should draw inner rect for unselected toggle buttons', async () => {
      const viewModule = await import('../../src/view');
      const rectModule = await import('../../src/rect');

      const btn = button.get({
        pos: { x: 10, y: 20 },
        size: { x: 50, y: 30 },
        text: 'Toggle',
        isToggle: true,
      });

      btn.isSelected = false;
      button.draw(btn);

      // Should draw outer rect and inner white rect
      expect(rectModule.rect).toHaveBeenCalledWith(10, 20, 50, 30);
      expect(rectModule.rect).toHaveBeenCalledWith(11, 21, 48, 28);
      expect(viewModule.setColor).toHaveBeenCalledWith('white');
    });
  });
});
