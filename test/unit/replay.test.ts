/**
 * Unit tests for src/replay.ts
 *
 * Tests:
 * 1. State restoration through initRecord → recordInput → rewind → restoreInput
 * 2. getLastFrameState returns random seed and input snapshot
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('../../src/input', () => ({
  set: vi.fn(),
  pos: { x: 0, y: 0 },
  isPressed: false,
  isJustPressed: false,
  isJustReleased: false,
}));

// Import after mocks are defined
import * as replay from '../../src/replay';
import { Random } from '../../src/random';
import { Vector } from '../../src/vector';

// Mock global cloneDeep function
global.cloneDeep = (obj: any) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Vector) {
    return new Vector(obj.x, obj.y);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => global.cloneDeep(item));
  }
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = global.cloneDeep(obj[key]);
    }
  }
  return cloned;
};

describe('replay', () => {
  let random: Random;

  beforeEach(() => {
    vi.clearAllMocks();
    random = new Random();
  });

  describe('record and replay', () => {
    it('should initialize record with random seed', () => {
      replay.initRecord(12345);

      expect(replay.isRecorded()).toBe(true);
    });

    it('should record input', () => {
      replay.initRecord(12345);

      const input1 = {
        pos: new Vector(10, 20),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      const input2 = {
        pos: new Vector(15, 25),
        isPressed: true,
        isJustPressed: false,
        isJustReleased: false,
      };

      replay.recordInput(input1);
      replay.recordInput(input2);

      expect(replay.isRecorded()).toBe(true);
    });

    it('should replay input in correct order', async () => {
      const inputModule = await import('../../src/input');

      replay.initRecord(12345);

      const input1 = {
        pos: new Vector(10, 20),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      const input2 = {
        pos: new Vector(15, 25),
        isPressed: false,
        isJustPressed: false,
        isJustReleased: true,
      };

      replay.recordInput(input1);
      replay.recordInput(input2);

      // Initialize replay
      replay.initReplay(random);

      // First replay
      replay.replayInput();
      expect(inputModule.set).toHaveBeenCalledWith(input1);

      // Second replay
      replay.replayInput();
      expect(inputModule.set).toHaveBeenCalledWith(input2);
    });

    it('should not replay beyond recorded inputs', async () => {
      const inputModule = await import('../../src/input');

      replay.initRecord(12345);

      const input1 = {
        pos: new Vector(10, 20),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      replay.recordInput(input1);
      replay.initReplay(random);

      replay.replayInput();
      const callCount = vi.mocked(inputModule.set).mock.calls.length;

      // Try to replay beyond recorded inputs
      replay.replayInput();
      expect(vi.mocked(inputModule.set).mock.calls.length).toBe(callCount);
    });

    it('should restore random seed on replay', () => {
      const testSeed = 54321;
      replay.initRecord(testSeed);

      const random1 = new Random();
      random1.setSeed(99999);

      replay.initReplay(random1);

      // Random should be reset to the recorded seed
      const random2 = new Random();
      random2.setSeed(testSeed);

      // Both randoms should generate the same sequence now
      expect(random1.get()).toBe(random2.get());
    });
  });

  describe('frame states', () => {
    it('should initialize frame states', () => {
      replay.initFrameStates();

      expect(replay.isFrameStateEmpty()).toBe(true);
    });

    it('should record frame state', () => {
      replay.initFrameStates();

      const gameState = { player: { x: 10, y: 20 } };
      const baseState = { ticks: 100, score: 500 };

      random.setSeed(12345);
      replay.recordFrameState(gameState, baseState, random);

      expect(replay.isFrameStateEmpty()).toBe(false);
    });

    it('should rewind frame state and restore input', async () => {
      const inputModule = await import('../../src/input');

      replay.initRecord(12345);
      replay.initFrameStates();

      const input1 = {
        pos: new Vector(10, 20),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      replay.recordInput(input1);

      const gameState = { player: { x: 10, y: 20 } };
      const baseState = { ticks: 100, score: 500 };

      random.setSeed(54321);
      const randomStateBefore = random.getState();

      replay.recordFrameState(gameState, baseState, random);

      // Set current input to something different
      (inputModule as any).pos = new Vector(99, 99);
      (inputModule as any).isPressed = false;

      // Rewind
      const frameState = replay.rewind(random);

      expect(frameState.gameState).toEqual(gameState);
      expect(frameState.baseState).toEqual(baseState);
      expect(frameState.randomState).toEqual(randomStateBefore);

      // Input should be set to the recorded input
      expect(inputModule.set).toHaveBeenCalledWith(input1);

      // Restore input should restore the state before rewind
      replay.restoreInput();
      expect(vi.mocked(inputModule.set).mock.calls.length).toBe(2);
    });

    it('should get last frame state without popping', async () => {
      const inputModule = await import('../../src/input');

      replay.initRecord(12345);
      replay.initFrameStates();

      const input1 = {
        pos: new Vector(10, 20),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      replay.recordInput(input1);

      const gameState = { player: { x: 10, y: 20 } };
      const baseState = { ticks: 100, score: 500 };

      random.setSeed(54321);
      const randomStateBefore = random.getState();

      replay.recordFrameState(gameState, baseState, random);

      // Get last frame state
      const frameState = replay.getLastFrameState(random);

      expect(frameState.gameState).toEqual(gameState);
      expect(frameState.baseState).toEqual(baseState);
      expect(frameState.randomState).toEqual(randomStateBefore);

      // Frame state should still be in the array
      expect(replay.isFrameStateEmpty()).toBe(false);

      // Restore input
      replay.restoreInput();
      expect(inputModule.set).toHaveBeenCalled();
    });

    it('should get frame state for replay at correct index', () => {
      replay.initRecord(12345);
      replay.initFrameStates();

      const gameState1 = { player: { x: 10, y: 20 } };
      const baseState1 = { ticks: 100, score: 500 };
      replay.recordFrameState(gameState1, baseState1, random);

      const gameState2 = { player: { x: 20, y: 30 } };
      const baseState2 = { ticks: 101, score: 510 };
      replay.recordFrameState(gameState2, baseState2, random);

      const input1 = {
        pos: new Vector(10, 20),
        isPressed: true,
        isJustPressed: true,
        isJustReleased: false,
      };

      const input2 = {
        pos: new Vector(15, 25),
        isPressed: false,
        isJustPressed: false,
        isJustReleased: true,
      };

      replay.recordInput(input1);
      replay.recordInput(input2);

      replay.initReplay(random);
      replay.replayInput();

      const frameState = replay.getFrameStateForReplay();
      expect(frameState.gameState).toEqual(gameState1);

      replay.replayInput();
      const frameState2 = replay.getFrameStateForReplay();
      expect(frameState2.gameState).toEqual(gameState2);
    });
  });
});
