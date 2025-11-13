/**
 * Unit tests for src/loop.ts
 *
 * The refactored loop is now responsible purely for scheduling and per-frame
 * updates, so these tests focus on verifying timing, dependency updates, and
 * capture behavior rather than subsystem initialization.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupFakeTimers, getClock, advanceFrame } from '../helpers/setup';

// Mock dependencies that loop interacts with each frame.
const viewMock = vi.hoisted(() => ({
  capture: vi.fn(),
}));

const inputMock = vi.hoisted(() => ({
  update: vi.fn(),
}));

const letterMock = vi.hoisted(() => ({
  enableCache: vi.fn(),
}));

const audioMock = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock('../../src/view', () => viewMock);
vi.mock('../../src/input', () => inputMock);
vi.mock('../../src/letter', () => letterMock);
vi.mock('../../src/audio', () => audioMock);

let loop: typeof import('../../src/loop');

describe('loop', () => {
  setupFakeTimers();

  let mockInit: () => void;
  let mockUpdate: () => void;

  beforeEach(async () => {
    mockInit = vi.fn();
    mockUpdate = vi.fn();
    vi.clearAllMocks();
    vi.resetModules();
    loop = await import('../../src/loop');
  });

  afterEach(() => {
    loop.stop();
  });

  describe('init', () => {
    it('should use mocked dependencies', async () => {
      const viewModule = await import('../../src/view');
      const audioModule = await import('../../src/audio');
      const inputModule = await import('../../src/input');
      const letterModule = await import('../../src/letter');

      expect(viewModule.capture).toBe(viewMock.capture);
      expect(audioModule.update).toBe(audioMock.update);
      expect(inputModule.update).toBe(inputMock.update);
      expect(letterModule.enableCache).toBe(letterMock.enableCache);
    });

    it('should run user init and start the animation loop', async () => {
      await loop.init(mockInit, mockUpdate, false);

      expect(mockInit).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledTimes(1);

      advanceFrame();
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });

  describe('per-frame behavior', () => {
    it('should update audio and input every frame', async () => {
      await loop.init(mockInit, mockUpdate, false);
      expect(audioMock.update).toHaveBeenCalledTimes(1);
      expect(inputMock.update).toHaveBeenCalledTimes(1);

      advanceFrame();

      expect(audioMock.update).toHaveBeenCalledTimes(2);
      expect(inputMock.update).toHaveBeenCalledTimes(2);
    });

    it('should enable the letter cache after the configured delay', async () => {
      await loop.init(mockInit, mockUpdate, false);
      expect(letterMock.enableCache).not.toHaveBeenCalled();

      for (let i = 0; i < 9; i += 1) {
        advanceFrame();
      }

      expect(letterMock.enableCache).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should cancel animation frame', () => {
      loop.init(mockInit, mockUpdate, false);

      loop.stop();

      // After stopping, no more updates should occur
      const updateCallCount = mockUpdate.mock.calls.length;
      getClock().tick(100);
      expect(mockUpdate.mock.calls.length).toBe(updateCallCount);
    });
  });

  describe('capture mode', () => {
    it('should call view.capture on every frame when enabled', async () => {
      await loop.init(mockInit, mockUpdate, true);
      expect(viewMock.capture).toHaveBeenCalledTimes(1);

      advanceFrame();
      expect(viewMock.capture).toHaveBeenCalledTimes(2);
    });

    it('should skip view.capture when capturing is disabled', async () => {
      await loop.init(mockInit, mockUpdate, false);
      advanceFrame();

      expect(viewMock.capture).not.toHaveBeenCalled();
    });
  });
});
