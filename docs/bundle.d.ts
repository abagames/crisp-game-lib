declare let title: string;
declare let description: string;
declare let characters: string[];
declare type Options = {
  isPlayingBgm?: boolean;
  isCapturing?: boolean;
  isShowingScore?: boolean;
  viewSize?: { x: number; y: number };
  seed?: number;
};
declare let options: Options;
declare function update();

declare let ticks: number;
// difficulty (Starts from 1, increments by a minute)
declare let difficulty: number;
// score
declare let score: number;

// Add score
declare function addScore(value: number);
declare function addScore(value: number, x: number, y: number);
declare function addScore(value: number, pos: VectorLike);

// End game
declare function end(): void;

// color
declare type Color =
  | "transparent"
  | "white"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "purple"
  | "cyan"
  | "black"
  | "light_red"
  | "light_green"
  | "light_yellow"
  | "light_blue"
  | "light_purple"
  | "light_cyan"
  | "light_black";
declare function color(colorName: Color);

// Draw functions return a collision info.
type Collision = {
  isColliding: {
    rect?: {
      transparent?: boolean;
      white?: boolean;
      red?: boolean;
      green?: boolean;
      yellow?: boolean;
      blue?: boolean;
      purple?: boolean;
      cyan?: boolean;
      black?: boolean;
      light_red?: boolean;
      light_green?: boolean;
      light_yellow?: boolean;
      light_blue?: boolean;
      light_purple?: boolean;
      light_cyan?: boolean;
      light_black?: boolean;
    };
    text?: { [k: string]: boolean };
    char?: { [k: string]: boolean };
  };
};

// Draw rectangle
declare function rect(
  x: number,
  y: number,
  width: number,
  height: number
): Collision;
declare function rect(x: number, y: number, size: VectorLike): Collision;
declare function rect(
  pos: VectorLike,
  width: number,
  height: number
): Collision;
declare function rect(pos: VectorLike, size: VectorLike): Collision;

// Draw box (center-aligned rect)
declare function box(
  x: number,
  y: number,
  width: number,
  height: number
): Collision;
declare function box(x: number, y: number, size: VectorLike): Collision;
declare function box(pos: VectorLike, width: number, height: number): Collision;
declare function box(pos: VectorLike, size: VectorLike): Collision;

// Draw bar (angled rect)
declare function bar(
  x: number,
  y: number,
  length: number,
  thickness: number,
  rotate: number,
  centerPosRatio?: number
): Collision;
declare function bar(
  pos: VectorLike,
  length: number,
  thickness: number,
  rotate: number,
  centerPosRatio?: number
): Collision;

// Draw line
declare function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness?: number
): Collision;
declare function line(
  x1: number,
  y1: number,
  p2: VectorLike,
  thickness?: number
): Collision;
declare function line(
  p1: VectorLike,
  x2: number,
  y2: number,
  thickness?: number
): Collision;
declare function line(
  p1: VectorLike,
  p2: VectorLike,
  thickness?: number
): Collision;

// Draw letters.
declare type LetterOptions = {
  color?: Color;
  backgroundColor?: Color;
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
};

declare function text(
  str: string,
  x: number,
  y: number,
  options?: LetterOptions
): Collision;

declare function text(
  str: string,
  pos: VectorLike,
  options?: LetterOptions
): Collision;

declare function char(
  str: string,
  x: number,
  y: number,
  options?: LetterOptions
): Collision;

declare function char(
  str: string,
  pos: VectorLike,
  options?: LetterOptions
): Collision;

// Return Vector
declare function vec(x?: number | VectorLike, y?: number): Vector;

// Return random number
declare function rnd(lowOrHigh?: number, high?: number);
// Return random integer
declare function rndi(lowOrHigh?: number, high?: number);
// Return plus of minus random number
declare function rnds(lowOrHigh?: number, high?: number);

// Input (mouse, touch, keyboard)
declare interface Input {
  pos: Vector;
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
}
declare let input: Input;

// Play sound
declare type SoundEffectType =
  | "coin"
  | "laser"
  | "explosion"
  | "powerUp"
  | "hit"
  | "jump"
  | "select"
  | "lucky";
declare function play(type: SoundEffectType);

declare const PI: number;
declare function abs(v: number): number;
declare function sin(v: number): number;
declare function cos(v: number): number;
declare function atan2(y: number, x: number): number;
declare function pow(b: number, e: number): number;
declare function sqrt(v: number): number;
declare function floor(v: number): number;
declare function round(v: number): number;
declare function ceil(v: number): number;
declare function clamp(v: number, low?: number, high?: number): number;
declare function wrap(v: number, low: number, high: number): number;
declare function range(v: number): number[];
declare function addWithCharCode(char: string, offset: number): string;

declare interface Vector {
  x: number;
  y: number;
  constructor(x?: number | VectorLike, y?: number);
  set(x?: number | VectorLike, y?: number): this;
  add(x?: number | VectorLike, y?: number): this;
  sub(x?: number | VectorLike, y?: number): this;
  mul(v: number): this;
  div(v: number): this;
  clamp(xLow: number, xHigh: number, yLow: number, yHigh: number): this;
  wrap(xLow: number, xHigh: number, yLow: number, yHigh: number): this;
  addWithAngle(angle: number, length: number): this;
  swapXy(): this;
  normalize(): this;
  rotate(angle: number): this;
  getAngle(to?: VectorLike): number;
  distanceTo(to: VectorLike): number;
  isInRect(x: number, y: number, width: number, height: number): boolean;
  equals(other: VectorLike): boolean;
  floor(): this;
  round(): this;
  ceil(): this;
  length: number;
}

declare interface VectorLike {
  x: number;
  y: number;
}
