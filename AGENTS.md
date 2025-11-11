# crisp-game-lib Developer Guide for AI Coding Agents

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

crisp-game-lib is a JavaScript library for creating browser-based mini-games quickly and easily. It provides a simple API for drawing, collision detection, input handling, and sound effects. The library is designed for rapid prototyping of classic arcade-style games.

## Development Commands

### Building and Development

- `npm run watch_lib` - Build the library with Rollup in watch mode
- `npm run watch_games` - Start development server for games on localhost:4000
- `npm run generate_reference` - Generate API documentation with TypeDoc
- `npm run test` - Run automated tests (Vitest)
- `npm run test:watch` - Run tests in watch mode

### Game Development Workflow

1. Copy `docs/_template` directory to `docs/[game-name]`
2. Edit `docs/[game-name]/main.js` to implement your game
3. Run `npm run watch_games` and open `http://localhost:4000?[game-name]`

## Architecture

### Core Modules (src/)

- `main.ts` - Main entry point, exports all public APIs, game loop coordination
- `loop.ts` - Main game loop, rendering engine integration, theme management
- `view.ts` - Canvas rendering, color management, drawing primitives
- `input.ts` - Mouse/touch/keyboard input handling with unified API
- `collision.ts` - Collision detection system based on drawing history
- `audio.ts` - Audio context management for sound effects and music
- `random.ts` - Deterministic random number generation
- `particle.ts` - Particle system for visual effects
- `letter.ts` - Text rendering and character definitions
- `vector.ts` - 2D vector math utilities

### Build System

- Rollup bundles TypeScript source into `docs/bundle.js` as IIFE
- `tsconfig.json` for main compilation, `tsconfig-rollup.json` for bundling
- Output includes TypeScript definitions at `docs/bundle.d.ts`
- When adding or modifying exported functions/variables in `src/main.ts`, you must also update the corresponding type definitions in `docs/bundle.d.ts` to maintain TypeScript compatibility

### Game Structure

Games are structured as:

- `title` (string) - Game title
- `description` (string) - Game description
- `characters` (array) - Pixel art character definitions
- `options` (object) - Game configuration (screen size, theme, etc.)
- `update()` (function) - Main game loop called 60 times per second
- `audioFiles` (object) - Optional external audio file mappings

### Key Design Patterns

- Global game state via exported variables (`ticks`, `difficulty`, `score`)
- Functional API with drawing commands that return collision results
- Collision detection integrated into drawing operations
- Deterministic randomness for replay functionality
- Input abstraction supporting mouse, touch, and keyboard

### Documentation Structure

- API reference generated at `docs/ref_document/`
- Sample games in individual `docs/` subdirectories
- Each game has `main.js` and `jsconfig.json` for IDE support

### Testing Strategy

The project uses automated tests to complement manual visual testing:

- **Test Framework**: Vitest with happy-dom, @sinonjs/fake-timers, and pixelmatch
- **Coverage**: 70 tests covering core infrastructure (~1.3s execution time)
- **Test Focus**:
  - Loop control (`src/loop.ts`) - frame timing logic, initialization order
  - Input handling (`src/input.ts`, `src/button.ts`) - pointer/keyboard state, button behavior
  - Replay system (`src/replay.ts`) - state recording and restoration
  - Collision detection (`src/collision.ts`) - hitbox generation, color shorthand propagation
  - Score system (`src/main.ts:addScore`) - score updates, replay guard behavior, text centering
- **Purpose**: Detect regressions in shared infrastructure when updating browsers, dependencies, or themes

#### Test Helper Functions

To enable testing of critical internal code paths, test-only helper functions are available in `src/main.ts`:

- **`__testSetReplaying(value: boolean)`** - Sets the `isReplaying` state for testing replay guard behavior
- **`__testInitOptions(options: Options)`** - Initializes `currentOptions` for testing option-dependent behavior

These functions are:

- Guarded by `process.env.NODE_ENV === "test"` and have no impact on production code
- Named with `__test` prefix to clearly indicate test-only usage
- Exported in both `src/main.ts` and `docs/bundle.d.ts`

**Usage Example:**

```typescript
import {
  __testSetReplaying,
  __testInitOptions,
  addScore,
  score,
} from "../src/main";

// Test replay guard behavior
__testSetReplaying(true);
const scoreBefore = score;
addScore(100);
expect(score).toBe(scoreBefore); // Score unchanged during replay

// Test option-dependent behavior
__testInitOptions({ isUsingSmallText: false });
addScore(50, 100, 100); // Triggers centering logic with normal text size
```

## Important Implementation Notes

### Collision System

Collision detection is based on drawing history - shapes drawn with `color("transparent")` still participate in collision detection even though invisible.

### Performance Considerations

- Use `simple` or `dark` themes for better mobile performance
- Avoid excessive `bar()`, `line()`, `arc()` calls as they impact collision detection
- WebGL themes (`pixel`, `shape`, `shapeDark`, `crt`) may reduce performance on mobile

### Audio System

- Sound seeds generated from `title` + `description` strings
- External audio files supported via `audioFiles` object
- Background music can be generated or loaded from files

### Mobile Game Design

Recommended control schemes for mobile:

- One-button games
- Left/right slide controls only
- Tap-specific locations on screen
