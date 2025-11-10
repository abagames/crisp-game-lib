/**
 * Test setup and utilities
 */
import { beforeEach, afterEach, vi } from 'vitest';
import FakeTimers from '@sinonjs/fake-timers';

// Global fake timers instance
let clock: FakeTimers.InstalledClock | null = null;

/**
 * Setup fake timers for deterministic testing
 */
export function setupFakeTimers() {
  beforeEach(() => {
    clock = FakeTimers.install({
      now: 0,
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'Date', 'performance', 'setTimeout', 'setInterval'],
      shouldAdvanceTime: false,
    });
  });

  afterEach(() => {
    if (clock) {
      clock.uninstall();
      clock = null;
    }
  });
}

/**
 * Get the current clock instance
 */
export function getClock(): FakeTimers.InstalledClock {
  if (!clock) {
    throw new Error('Clock not initialized. Did you call setupFakeTimers()?');
  }
  return clock;
}

/**
 * Advance fake timers by specified milliseconds
 */
export function advanceTime(ms: number) {
  const currentClock = getClock();
  currentClock.tick(ms);
}

/**
 * Advance to next animation frame
 */
export function advanceFrame() {
  const currentClock = getClock();
  // Typical frame time is 16.67ms (60fps)
  currentClock.tick(16.67);
}

/**
 * Setup mock canvas context
 */
export function createMockCanvasContext() {
  const mockContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    imageSmoothingEnabled: true,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(400),
      width: 10,
      height: 10,
    })),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    fillText: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    setTransform: vi.fn(),
  };
  return mockContext;
}

/**
 * Setup mock canvas element
 */
export function createMockCanvas() {
  const mockContext = createMockCanvasContext();
  const mockCanvas = {
    width: 100,
    height: 100,
    getContext: vi.fn(() => mockContext),
    style: {},
    getBoundingClientRect: vi.fn(() => ({
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    })),
  };
  return { canvas: mockCanvas, context: mockContext };
}

/**
 * Setup DOM mocks
 */
export function setupDomMocks() {
  beforeEach(() => {
    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const { canvas } = createMockCanvas();
        return canvas as any;
      }
      return originalCreateElement(tagName);
    });

    // Mock window.innerWidth/innerHeight
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
}

/**
 * Mock PIXI for tests that need it
 */
export function mockPixi() {
  const mockPixi = {
    Application: vi.fn().mockImplementation(() => ({
      stage: {
        addChild: vi.fn(),
        removeChild: vi.fn(),
      },
      renderer: {
        backgroundColor: 0,
        render: vi.fn(),
        resize: vi.fn(),
      },
      view: createMockCanvas().canvas,
      ticker: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    })),
    Container: vi.fn().mockImplementation(() => ({
      addChild: vi.fn(),
      removeChild: vi.fn(),
    })),
    Graphics: vi.fn().mockImplementation(() => ({
      clear: vi.fn(),
      beginFill: vi.fn(),
      drawRect: vi.fn(),
      endFill: vi.fn(),
    })),
    Sprite: vi.fn(),
    Texture: {
      from: vi.fn(),
    },
    filters: {
      BlurFilter: vi.fn(),
    },
  };

  return mockPixi;
}
