# LLM Game Development Guide for crisp-game-lib

A comprehensive guide for Large Language Models to assist developers in creating browser-based mini-games using crisp-game-lib.

## Table of Contents

1. [Overview & Introduction](#overview--introduction)
2. [Quick Start Guide](#quick-start-guide)
3. [Core API Reference](#core-api-reference)
4. [Game Structure Patterns](#game-structure-patterns)
5. [Game Examples](#game-examples)
6. [Performance, Mobile and Best Practices](#performance-mobile-and-best-practices)
7. [Advanced Topics](#advanced-topics)

---

## Overview & Introduction

### What is crisp-game-lib?

crisp-game-lib is a JavaScript library specifically designed for creating browser-based mini-games quickly and easily. It's particularly well-suited for LLM-assisted development because of its:

- **Functional API design** - Most functions are standalone, making code generation straightforward
- **Integrated collision detection** - Collision detection is built into drawing operations
- **Simple game loop structure** - Games use a single `update()` function called 60 times per second
- **Global state management** - Uses simple global variables instead of complex state objects
- **Minimal boilerplate** - Games can be created with just a few essential functions

### Why Perfect for LLM Development?

1. **Predictable Structure** - Every game follows the same basic pattern
2. **Functional Approach** - No complex object-oriented patterns to manage
3. **Clear API** - Function names and parameters are intuitive and consistent
4. **Immediate Results** - Visual feedback is instant, making debugging easier
5. **Mobile-First** - Built-in support for touch controls and responsive design

---

## Quick Start Guide

### Development Setup

Choose your preferred development approach:

#### Local Development

```bash
# Clone and setup
git clone https://github.com/abagames/crisp-game-lib.git
cd crisp-game-lib && npm install

# Create new game
cp -r docs/_template docs/my-game
```

**HTML Template:**

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>My Crisp Game</title>
    <meta
      name="viewport"
      content="width=device-width, height=device-height, user-scalable=no, initial-scale=1, maximum-scale=1"
    />
    <!-- Load 'algo-chip' if options.isSoundEnabled is true -->
    <script src="https://unpkg.com/algo-chip@1.0.2/packages/core/dist/algo-chip.umd.js"></script>
    <script src="https://unpkg.com/algo-chip@1.0.2/packages/util/dist/algo-chip-util.umd.js"></script>
    <!-- Load 'gif-capture-canvas' if you plan to enable options.isCapturing -->
    <script src="https://unpkg.com/gif-capture-canvas@1.1.0/build/index.js"></script>
    <!-- Load 'pixi' when using shape/shapeDark/pixel/crt themes -->
    <script src="https://unpkg.com/pixi.js@5.3.0/dist/pixi.min.js"></script>
    <script src="https://unpkg.com/pixi-filters@3.1.1/dist/pixi-filters.js"></script>

    <script src="https://unpkg.com/crisp-game-lib@latest/docs/bundle.js"></script>
    <script src="./main.js"></script>
    <script>
      window.addEventListener("load", onLoad);
    </script>
  </head>
  <body style="background: #ddd"></body>
</html>
```

**JavaScript Game Structure:**

```javascript
// main.js
title = "MY GAME";
description = `[Control instructions]`;
characters = [];
options = { viewSize: { x: 100, y: 100 } }; // Default screen size (customizable)

function update() {
  if (!ticks) {
    // Initialize game state
  }
  // Game logic here
}
```

#### Modern Bundler Setup (Vite/Webpack)

```bash
npm install crisp-game-lib
```

**HTML Template:**

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>My Crisp Game</title>
    <meta
      name="viewport"
      content="width=device-width, height=device-height, user-scalable=no, initial-scale=1, maximum-scale=1"
    />
    <!-- Load 'algo-chip' if options.isSoundEnabled is true -->
    <script src="https://unpkg.com/algo-chip@1.0.2/packages/core/dist/algo-chip.umd.js"></script>
    <script src="https://unpkg.com/algo-chip@1.0.2/packages/util/dist/algo-chip-util.umd.js"></script>
    <!-- Load 'gif-capture-canvas' if you plan to enable options.isCapturing -->
    <script src="https://unpkg.com/gif-capture-canvas@1.1.0/build/index.js"></script>
    <!-- Load 'pixi' when using shape/shapeDark/pixel/crt themes -->
    <script src="https://unpkg.com/pixi.js@5.3.0/dist/pixi.min.js"></script>
    <script src="https://unpkg.com/pixi-filters@3.1.1/dist/pixi-filters.js"></script>

    <script type="module" src="./main.js"></script>
  </head>
  <body style="background: #ddd"></body>
</html>
```

**JavaScript Game Structure:**

```javascript
// main.js (supports TypeScript as main.ts)
import "crisp-game-lib";

const title = "MY GAME";
const description = `[Control instructions]`;
const characters = [];
const options = { viewSize: { x: 100, y: 100 } }; // Default screen size (customizable)

function update() {
  if (!ticks) {
    // Initialize game state
  }
  // Game logic here
}

init({ update, title, description, characters, options });
```

**Key difference**: Bundler setup uses `const` variables and `init()` function.

### Quick Start Example

See the [Game Examples](#game-examples) section for complete playable examples including One-Button Jumper and Top-Down Shooter.

---

## Core API Reference

### Drawing Functions

All drawing functions return collision detection results and support color-based collision detection.

```javascript
// Basic shapes
rect(x, y, width, height); // Rectangle from top-left corner
box(position, width, height); // Box from center point
line(startPos, endPos, thickness); // Line between points
bar(position, length, thickness, angle); // Rotatable bar
arc(position, radius, thickness, startAngle, endAngle); // Circle/arc
```

#### Text and Characters

```javascript
// Text rendering (normal: 6x6, small: 4x6 pixels per character)
text("Foo", x, y);
text(`Foo ${bar}`, 10, 10, { isSmallText: true });

// Custom pixel art characters
char("a", 50, 50); // From characters array
addWithCharCode("a", 1); // Returns "b" (next character)
char(addWithCharCode("a", floor(ticks / 30) % 2), player.pos); // Animation
```

### Colors and Input

```javascript
// Colors (affects collision detection)
color("red"); // Built-in: red, green, blue, yellow, purple, cyan, black, white
color("light_red"); // Light variants: light_red, light_green, light_blue, light_yellow, light_purple, light_cyan, light_black
color("transparent"); // Invisible but still detects collisions

// Important: White color is ALWAYS invisible because it matches the background:
// - Light themes (simple, shape): white renders as white on white background
// - Dark themes (dark, shapeDark, pixel, crt): white renders as black on black background
// Use light_ colors or other contrasting colors for reliable visibility across all themes
```

```javascript
// Unified input
input.pos; // Mouse/touch position
input.isPressed; // While held
input.isJustPressed; // Single frame press

// Keyboard
keyboard.code["Space"].isJustPressed; // Space key
keyboard.code["ArrowUp"].isPressed; // Arrow keys
keyboard.code["KeyW"].isPressed; // W/A/S/D movement
keyboard.code["Digit1"].isJustPressed; // Number keys
```

### Audio and Math

```javascript
// Sound effects
play("coin"); // Built-in: coin, powerUp, hit, jump, select, lucky
play("hit", { seed: 5, volume: 0.5, pitch: 60 }); // Options

// Vector creation and operations
vec(x, y); // Create vector
pos.set(x, y); // Set coordinates
pos.add(velocity);
pos.sub(velocity); // Add/subtract vectors or numbers
pos.mul(2);
pos.div(2); // Multiply/divide by scalar

// Particle effects
particle(pos, { count: 10, speed: 2, angle: 0, angleWidth: PI }); // Object format
particle(pos, count, speed, angle, angleWidth); // Legacy format

// Vector utility methods
pos.addWithAngle(angle, length); // Move in direction
pos.clamp(xLow, xHigh, yLow, yHigh); // Constrain to bounds
pos.wrap(xLow, xHigh, yLow, yHigh); // Screen wrapping
pos.normalize(); // Convert to unit vector
pos.rotate(angle); // Rotate by angle
pos.swapXy(); // Swap x and y coordinates

// Vector calculations
pos.angleTo(target); // Angle to another point
pos.distanceTo(target); // Distance to another point
pos.isInRect(x, y, w, h); // Check if inside rectangle
pos.equals(other); // Compare vectors
pos.length;
pos.angle; // Get magnitude and angle

// Vector rounding
pos.floor();
pos.round();
pos.ceil(); // Round coordinates

// Utility functions
times(count, func); // Repeat function count times: times(5, i => enemies.push({}))
range(count); // Generate array [0,1,2...count-1]: range(3) = [0,1,2]
clamp(value, low, high); // Constrain value to range: clamp(x, 0, 200)
wrap(value, low, high); // Wrap value around bounds: wrap(x, 0, 200)
remove(array, condition); // Remove elements where condition returns true

// Random numbers and math
rnd();
rnd(max);
rndi(max); // Random numbers
PI, abs, sin, cos, atan2, sqrt, min, max; // Math shortcuts

// Game state
ticks;
score;
difficulty; // Auto-managed globals
addScore(points, pos);
end(); // Game control

// IMPORTANT: Score is automatically displayed by the library
// Do NOT manually draw score with text() - it's handled automatically
// The score appears in the top-left corner by default

// Character animation utility
addWithCharCode(char, offset); // Get character at offset from base
// Example: addWithCharCode("a", 0) = "a", addWithCharCode("a", 1) = "b"
```

### Game Loop Utilities

```javascript
// times() - Essential for creating multiple objects
times(5, (i) => {
  enemies.push({ pos: vec(200, i * 20), velocity: vec(-1, 0) });
});

// range() - Generate number sequences
range(3).forEach((i) => {
  bullets.push({ pos: vec(player.pos.x + i * 5, player.pos.y) });
});

// Practical patterns
times(difficulty, () => spawnEnemy()); // Scale with difficulty
range(gridSize).forEach((x) => {
  range(gridSize).forEach((y) => {
    if (grid[x][y]) drawBlock(x * 10, y * 10);
  });
});

// remove() - Clean up arrays efficiently
remove(enemies, (enemy) => {
  enemy.pos.add(enemy.velocity);
  return enemy.pos.x < -10; // Remove off-screen enemies
});
```

### Collision Detection

**Critical Rule**: Objects can only detect shapes drawn BEFORE them.

```javascript
// Correct order: Draw targets first, then detectors
color("red");
enemies.forEach((enemy) => box(enemy.pos, 10)); // Draw enemies FIRST

color("blue");
if (box(player.pos, 8).isColliding.rect.red) {
  // Player detects enemies
  end();
}

// Color-based collision categories
color("transparent"); // Invisible collision area
if (box(player.pos, 20).isColliding.rect.red) {
  // Larger hit detection without visual clutter
}
```

---

## Game Structure Patterns

### Standard Game Template

#### Basic Game Template

```javascript
// For ES modules (bundler): add import "crisp-game-lib"; at top and use const
// For local development: use let/var and global variables

title = "GAME NAME"; // const title for bundlers

description = `[Control description]`;

characters = []; // Optional pixel art definitions

options = {
  viewSize: { x: 100, y: 100 }, // Customize screen size
  theme: "simple",
  // Other options: isPlayingBgm, isReplayEnabled, seed
};

let player, enemies, bullets;

function update() {
  if (!ticks) {
    // Initialize game state
    player = { pos: vec(50, 50) };
    enemies = [];
    bullets = [];
  }

  // Input handling
  if (input.isJustPressed) {
    // Handle input
  }

  // Game logic: update objects, check collisions, handle scoring

  // Drawing: background, objects, UI
  // NOTE: Score is automatically displayed - do NOT draw it manually

  // Game over conditions
  if (gameOverCondition) {
    end();
  }
}

// For bundlers: add init({ update, title, description, characters, options });
```

### Advanced Patterns

```javascript
// Multi-key input handling
function getMovementInput() {
  let direction = vec(0, 0);
  if (keyboard.code["KeyW"].isPressed) direction.y -= 1;
  if (keyboard.code["KeyS"].isPressed) direction.y += 1;
  if (keyboard.code["KeyA"].isPressed) direction.x -= 1;
  if (keyboard.code["KeyD"].isPressed) direction.x += 1;
  return direction.normalize();
}

// Common patterns
times(3, (i) => box(50 + i * 60, 50, 10)); // Draw multiple objects
range(difficulty).forEach((i) => enemies.push({ pos: vec(200, rnd(100)) })); // Scale with difficulty

// Vector movement
player.pos.addWithAngle(player.angle, speed); // Move forward
player.pos.clamp(10, 190, 10, 90); // Keep on screen
asteroid.pos.wrap(0, 200, 0, 100); // Screen wrapping
```

```javascript
// Additional patterns
player.pos.add(velocity); // Movement
velocity.y += 0.1; // Gravity
if (ticks % 60 === 0) enemies.push({ pos: vec(200, rnd(100)) }); // Spawn enemies

// Health bar with arc
function drawHealthBar(pos, current, max) {
  color("red");
  arc(pos.x, pos.y, 15, 2, -PI / 2, -PI / 2 + (current / max) * PI * 2);
}
```

---

## Game Examples

### One-Button Jumper

Perfect for mobile devices and simple controls.

```javascript
title = "JUMP HERO";

description = `
[Tap] Jump
`;

let player, obstacles, ground;

function update() {
  if (!ticks) {
    player = { pos: vec(30, 80), vy: 0, onGround: false };
    obstacles = [];
    ground = 85;
  }

  // Spawn obstacles
  if (ticks % 120 === 0) {
    obstacles.push({ pos: vec(120, ground - 10), width: 8, isPassed: false });
  }

  // Player physics
  if (input.isPressed && player.onGround) {
    player.vy = -4;
    play("jump");
  }

  player.vy += 0.15; // Gravity
  player.pos.y += player.vy;

  // Ground collision
  if (player.pos.y >= ground - 4) {
    player.pos.y = ground - 4;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // Update obstacles
  remove(obstacles, (obs) => {
    obs.pos.x -= difficulty * 0.5;

    // Draw obstacle
    color("red");
    box(obs.pos, obs.width, 20);

    // Score when passed
    if (obs.pos.x < player.pos.x && !obs.isPassed) {
      addScore(10);
      obs.isPassed = true;
      play("coin");
    }

    return obs.pos.x <= -20; // Remove if off-screen
  });

  // Draw player and check collision with obstacles
  color("blue");
  if (box(player.pos, 8).isColliding.rect.red) {
    end();
  }

  // Draw ground
  color("green");
  rect(0, ground, 100, 100 - ground);
}
```

### Top-Down Shooter

Classic arcade shooter pattern.

```javascript
title = "SPACE BLAST";

description = `
[Mouse / Slide] Move
`;

options = { viewSize: { x: 200, y: 150 } }; // Custom size for shooter example

let player, enemies, bullets;

function update() {
  if (!ticks) {
    player = { pos: vec(100, 120) };
    enemies = [];
    bullets = [];
  }

  // Player movement
  player.pos = vec(input.pos.x, input.pos.y);
  player.pos.clamp(8, 192, 8, 142);

  // Auto-shoot
  if (ticks % 8 === 0) {
    bullets.push({
      pos: vec(player.pos.x, player.pos.y - 10),
      vy: -4,
    });
    play("select");
  }

  // Spawn enemies
  if (ticks % 45 === 0) {
    enemies.push({
      pos: vec(rnd(180) + 10, -10),
      vy: rnd(1, 3),
    });
  }

  // Draw player first (so enemies can detect collision with it)
  color("blue");
  let playerCollision = box(player.pos, 10);

  // Update bullets
  remove(bullets, (bullet) => {
    bullet.pos.y += bullet.vy;

    color("yellow");
    box(bullet.pos, 3);

    return bullet.pos.y <= -5; // Remove if off-screen
  });

  // Update enemies
  remove(enemies, (enemy) => {
    enemy.pos.y += enemy.vy;

    color("red");
    let enemyHit = box(enemy.pos, 12);

    // Check bullet collision
    if (enemyHit.isColliding.rect.yellow) {
      addScore(100, enemy.pos);
      particle(enemy.pos, { count: 10, speed: 2, angle: PI });
      play("powerUp");
      return true; // Remove enemy
    }

    // Check player collision (player was drawn first)
    if (enemyHit.isColliding.rect.blue) {
      end();
    }

    return enemy.pos.y >= 160; // Remove if off-screen
  });
}
```

---

## Performance, Mobile and Best Practices

### Mobile-Optimized Controls

```javascript
// One-button (best for mobile)
if (input.isPressed) {
  /* single action */
}

// Slide controls
player.pos.x = input.pos.x;

// Tap zones
if (input.isJustPressed) {
  if (input.pos.x < 50) {
    /* left action */
  } else {
    /* right action */
  }
}
```

### Performance and Best Practices

```javascript
// Theme selection for performance and appearance
// Common values: "simple", "shape", "dark", "shapeDark", "pixel", "crt"
options = {
  theme: "simple", // Default choice; change to any value above
  viewSize: { x: 200, y: 100 }, // Customize screen size
};

// CRITICAL: Drawing order for collision detection
// Objects must be drawn BEFORE checking collision with them
// ❌ WRONG: This will NOT work
color("purple");
if (box(enemy.pos, 5).isColliding.rect.yellow) {
} // yellow not drawn yet!
color("yellow");
box(explosion.pos, 10); // Drawn after enemy check

// ✅ CORRECT: Draw first, then check collision
color("yellow");
box(explosion.pos, 10); // Draw explosion FIRST
color("purple");
if (box(enemy.pos, 5).isColliding.rect.yellow) {
} // Now collision works!

// Efficient patterns
color("red");
enemies.forEach((enemy) => box(enemy.pos, 10)); // Draw all enemies first
color("blue");
if (box(player.pos, 8).isColliding.rect.red) {
  /* handle collision */
}

// ✅ PREFERRED: Use object format for particle()
particle(enemy.pos, { count: 5, speed: 2, angle: PI });

// ❌ AVOID: Legacy format (harder to read)
particle(enemy.pos, 5, 2, PI, PI);

// Initialize in first frame, clean up off-screen objects
if (!ticks) {
  player = { pos: vec(50, 50) };
  enemies = [];
}
remove(enemies, (enemy) => enemy.pos.x <= -10);
```

---

## Advanced Topics

### Custom Characters and Animations

```javascript
characters = [
  `
llll
l  l
l  l
llll
`,
  `
 ll
llll
llll
 ll
`,
];

// Basic usage
char("a", 50, 50); // Draw first character

// Animation with addWithCharCode()
char(addWithCharCode("a", floor(ticks / 30) % 2), player.pos); // 2-frame animation
char(addWithCharCode("a", enemy.type), enemy.pos); // Different variants
```

### External Audio Files

```javascript
// Define external audio files
audioFiles = {
  bgm: "path/to/background_music.mp3",
  explosion: "path/to/explosion.wav",
};

// Use in game
play("explosion"); // Play custom sound
```

### Advanced Options

```javascript
options = {
  viewSize: { x: 100, y: 100 }, // Screen size (default 100x100)
  theme: "simple", // Visual theme
  isPlayingBgm: true, // Background music
  isReplayEnabled: true, // Replay system
  // Other options:
  // audioSeed, isDrawingScoreFront, isDrawingParticleFront, isShowingScore
};
```

This comprehensive guide provides LLMs with all the necessary information to assist developers in creating engaging browser-based games using crisp-game-lib. The functional API design and consistent patterns make it ideal for AI-assisted development workflows.
