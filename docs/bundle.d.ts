declare let title: string;
declare let description: string;
declare let characters: string[];
declare let audioFiles: { [key: string]: string };
declare type ThemeName =
  | "simple"
  | "pixel"
  | "shape"
  | "shapeDark"
  | "crt"
  | "dark";
declare type Options = {
  isPlayingBgm?: boolean;
  isCapturing?: boolean;
  isCapturingGameCanvasOnly?: boolean;
  captureCanvasScale?: number;
  captureDurationSec?: number;
  isShowingScore?: boolean;
  isShowingTime?: boolean;
  isReplayEnabled?: boolean;
  isRewindEnabled?: boolean;
  isDrawingParticleFront?: boolean;
  isDrawingScoreFront?: boolean;
  isUsingSmallText?: boolean;
  isMinifying?: boolean;
  isSoundEnabled?: boolean;
  viewSize?: { x: number; y: number };
  audioSeed?: number;
  seed?: number;
  audioVolume?: number;
  theme?: ThemeName;
  colorPalette?: number[][];
  textEdgeColor?: {
    score?: Color | number;
    floatingScore?: Color | number;
    title?: Color | number;
    description?: Color | number;
    gameOver?: Color | number;
  };
  bgmName?: string;
  bgmVolume?: number;
  audioTempo?: number;
  isRecording?: boolean;
};
declare let options: Options;
declare function update(): void;

declare let ticks: number;
// difficulty (Starts from 1, increments by a minute)
declare let difficulty: number;
// score
declare let score: number;
declare let time: number;
declare let isReplaying: boolean;

// Add score
declare function addScore(value: number): void;
declare function addScore(value: number, x: number, y: number): void;
declare function addScore(value: number, pos: VectorLike): void;

// End game
declare function end(gameOverText?: string): void;
declare function complete(completeText?: string): void;

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
declare function color(colorNameOrColorIndex: Color | number): void;

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
  height?: number
): Collision;
declare function rect(x: number, y: number, size: VectorLike): Collision;
declare function rect(
  pos: VectorLike,
  width: number,
  height?: number
): Collision;
declare function rect(pos: VectorLike, size: VectorLike): Collision;

// Draw box (center-aligned rect)
declare function box(
  x: number,
  y: number,
  width: number,
  height?: number
): Collision;
declare function box(x: number, y: number, size: VectorLike): Collision;
declare function box(
  pos: VectorLike,
  width: number,
  height?: number
): Collision;
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

// Draw arc
declare function arc(
  centerX: number,
  centerY: number,
  radius: number,
  thickness?: number,
  angleFrom?: number,
  angleTo?: number
): Collision;
declare function arc(
  centerPos: VectorLike,
  radius: number,
  thickness?: number,
  angleFrom?: number,
  angleTo?: number
): Collision;

// Draw letters
declare type LetterOptions = {
  color?: Color | number;
  backgroundColor?: Color | number;
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
  isSmallText?: boolean;
  edgeColor?: Color | number;
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

// Add particles
declare function particle(
  x: number,
  y: number,
  options?: {
    count?: number;
    speed?: number;
    angle?: number;
    angleWidth?: number;
    edgeColor?: Color | number;
  }
): void;
declare function particle(
  pos: VectorLike,
  options?: {
    count?: number;
    speed?: number;
    angle?: number;
    angleWidth?: number;
    edgeColor?: Color | number;
  }
): void;
declare function particle(
  x: number,
  y: number,
  count?: number,
  speed?: number,
  angle?: number,
  angleWidth?: number
): void;
declare function particle(
  pos: VectorLike,
  count?: number,
  speed?: number,
  angle?: number,
  angleWidth?: number
): void;

// Record/Restore a frame state for replaying and rewinding
declare function frameState(state: any): any;

// Rewind a game
declare function rewind(): void;

// Return Vector
declare function vec(x?: number | VectorLike, y?: number): Vector;

// Return random number
declare function rnd(lowOrHigh?: number, high?: number): number;
// Return random integer
declare function rndi(lowOrHigh?: number, high?: number): number;
// Return plus of minus random number
declare function rnds(lowOrHigh?: number, high?: number): number;

// Input (mouse, touch, keyboard)
declare type Input = {
  pos: Vector;
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
};
declare let input: Input;

declare type KeyboardCode =
  | "Escape"
  | "Digit0"
  | "Digit1"
  | "Digit2"
  | "Digit3"
  | "Digit4"
  | "Digit5"
  | "Digit6"
  | "Digit7"
  | "Digit8"
  | "Digit9"
  | "Minus"
  | "Equal"
  | "Backspace"
  | "Tab"
  | "KeyQ"
  | "KeyW"
  | "KeyE"
  | "KeyR"
  | "KeyT"
  | "KeyY"
  | "KeyU"
  | "KeyI"
  | "KeyO"
  | "KeyP"
  | "BracketLeft"
  | "BracketRight"
  | "Enter"
  | "ControlLeft"
  | "KeyA"
  | "KeyS"
  | "KeyD"
  | "KeyF"
  | "KeyG"
  | "KeyH"
  | "KeyJ"
  | "KeyK"
  | "KeyL"
  | "Semicolon"
  | "Quote"
  | "Backquote"
  | "ShiftLeft"
  | "Backslash"
  | "KeyZ"
  | "KeyX"
  | "KeyC"
  | "KeyV"
  | "KeyB"
  | "KeyN"
  | "KeyM"
  | "Comma"
  | "Period"
  | "Slash"
  | "ShiftRight"
  | "NumpadMultiply"
  | "AltLeft"
  | "Space"
  | "CapsLock"
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "Pause"
  | "ScrollLock"
  | "Numpad7"
  | "Numpad8"
  | "Numpad9"
  | "NumpadSubtract"
  | "Numpad4"
  | "Numpad5"
  | "Numpad6"
  | "NumpadAdd"
  | "Numpad1"
  | "Numpad2"
  | "Numpad3"
  | "Numpad0"
  | "NumpadDecimal"
  | "IntlBackslash"
  | "F11"
  | "F12"
  | "F13"
  | "F14"
  | "F15"
  | "F16"
  | "F17"
  | "F18"
  | "F19"
  | "F20"
  | "F21"
  | "F22"
  | "F23"
  | "F24"
  | "IntlYen"
  | "Undo"
  | "Paste"
  | "MediaTrackPrevious"
  | "Cut"
  | "Copy"
  | "MediaTrackNext"
  | "NumpadEnter"
  | "ControlRight"
  | "LaunchMail"
  | "AudioVolumeMute"
  | "MediaPlayPause"
  | "MediaStop"
  | "Eject"
  | "AudioVolumeDown"
  | "AudioVolumeUp"
  | "BrowserHome"
  | "NumpadDivide"
  | "PrintScreen"
  | "AltRight"
  | "Help"
  | "NumLock"
  | "Pause"
  | "Home"
  | "ArrowUp"
  | "PageUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "End"
  | "ArrowDown"
  | "PageDown"
  | "Insert"
  | "Delete"
  | "OSLeft"
  | "OSRight"
  | "ContextMenu"
  | "BrowserSearch"
  | "BrowserFavorites"
  | "BrowserRefresh"
  | "BrowserStop"
  | "BrowserForward"
  | "BrowserBack";

declare type KeyboardCodeState = {
  [key in KeyboardCode]: {
    isPressed: boolean;
    isJustPressed: boolean;
    isJustReleased: boolean;
  };
};

declare type Keyboard = {
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
  code: KeyboardCodeState;
};

declare let keyboard: Keyboard;

declare type Pointer = {
  pos: Vector;
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
};

declare let pointer: Pointer;

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
declare function min(...values: number[]): number;
declare function max(...values: number[]): number;
declare function clamp(v: number, low?: number, high?: number): number;
declare function wrap(v: number, low: number, high: number): number;
declare function range(v: number): number[];
declare function times<T>(count: number, func: (index: number) => T): T[];
declare function remove<T>(
  array: T[],
  func: (v: T, index?: number) => any
): T[];
declare function addWithCharCode(char: string, offset: number): string;

declare interface Vector {
  x: number;
  y: number;
  constructor(x?: number | VectorLike, y?: number): Vector;
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
  angleTo(x?: number | VectorLike, y?: number): number;
  distanceTo(x?: number | VectorLike, y?: number): number;
  isInRect(x: number, y: number, width: number, height: number): boolean;
  equals(other: VectorLike): boolean;
  floor(): this;
  round(): this;
  ceil(): this;
  length: number;
  angle: number;
}

declare interface VectorLike {
  x: number;
  y: number;
}

// Play sound
declare type SoundEffectType =
  | "coin"
  | "laser"
  | "explosion"
  | "powerUp"
  | "hit"
  | "jump"
  | "select"
  | "lucky"
  | "random"
  | "click"
  | "synth"
  | "tone";
declare function play(
  type: SoundEffectType | string,
  options?: {
    seed?: number;
    numberOfSounds?: number;
    volume?: number;
    pitch?: number;
    freq?: number;
    note?: string;
  }
): void;
declare function playBgm(): void;
declare function stopBgm(): void;
declare function startRecording(): void;
declare function stopRecording(): void;

// sounds-some-sounds interface
// https://github.com/abagames/sounds-some-sounds
declare module sss {
  // Play sound effect
  function playSoundEffect(
    // The list of SoundEffectType is as follows:
    // "coin", "laser", "explosion", "powerUp", "hit", "jump", "select",
    // "random"("lucky"), "click", "synth", "tone"
    type: SoundEffectType,
    options?: {
      // Random seed (default = 0)
      seed?: number;
      // Number of simultaneous sounds (default = 2)
      numberOfSounds?: number;
      // Sound volume (default = 1)
      volume?: number;
      // To set the pitch of the sound, set one of the following 3 parameters
      pitch?: number; // MIDI note number
      freq?: number; // Frequency (Hz)
      note?: string; // Note string (e.g. "C4", "F#3", "Ab5")
    }
  ): SoundEffect;
  // Play music described in MML
  function playMml(
    mmlStrings: string[],
    options?: {
      // Sound volume (default = 1)
      volume?: number;
      // Playback speed (default = 1)
      speed?: number;
      // Looping at the end of the music (default = true)
      isLooping?: boolean;
    }
  ): Track;
  // Stop MML music
  function stopMml(track?: Track): void;
  // Generate mml strings
  function generateMml(options?: {
    // Random seed (default = 0)
    seed?: number;
    // Generated music length (16 notes = 1 bar) (default = 32)
    noteLength?: number;
    // Number of simultaneous parts (default = 4)
    partCount?: number;
    // Probability of drum part generation (default = 0.5)
    drumPartRatio?: number;
  }): string[];
  // Initialize the library
  function init(
    // Used to generate sound effects and MMLs
    baseRandomSeed?: number,
    // When reusing an existing AudioContext
    audioContext?: AudioContext
  ): void;
  // The startAudio function needs to be called from within
  // the user operation event handler to enable audio playback in the browser
  function startAudio(): void;
  // The update function needs to be called every
  // certain amount of time (typically 60 times per second)
  function update(): void;
  // Set the tempo of the music
  function setTempo(tempo?: number): void;
  // Set the quantize timing of sound effects by the length of the note
  function setQuantize(noteLength?: number): void;
  // Set a master volume
  function setVolume(volume?: number): void;
  // Reset all states
  function reset(): void;
  // Set a random seed number
  function setSeed(baseRandomSeed?: number): void;

  type SoundEffectType =
    | "coin"
    | "laser"
    | "explosion"
    | "powerUp"
    | "hit"
    | "jump"
    | "select"
    | "lucky"
    | "random"
    | "click"
    | "synth"
    | "tone";

  type SoundEffect = {
    type: SoundEffectType;
    params;
    volume: number;
    buffers: AudioBuffer[];
    bufferSourceNodes: AudioBufferSourceNode[];
    gainNode: GainNode;
    isPlaying: boolean;
    playedTime: number;
    isDrum?: boolean;
    seed?: number;
  };

  type Note = {
    pitch: number;
    quantizedStartStep: number;
    quantizedEndStep: number;
  };

  type Part = {
    mml: string;
    sequence: { notes: Note[] };
    soundEffect: SoundEffect;
    noteIndex: number;
    endStep: number;
    visualizer?;
  };

  type Track = {
    parts: Part[];
    notesStepsCount: number;
    notesStepsIndex: number;
    noteInterval: number;
    nextNotesTime: number;
    speedRatio: number;
    isPlaying: boolean;
    isLooping: boolean;
  };
}

// Button
declare type Button = {
  pos: VectorLike;
  size: VectorLike;
  text: string;
  isToggle: boolean;
  onClick: () => void;
  isPressed: boolean;
  isSelected: boolean;
  isHovered: boolean;
  toggleGroup: Button[];
};

declare function getButton({
  pos,
  size,
  text,
  isToggle,
  onClick,
  isSmallText,
}: {
  pos: VectorLike;
  size: VectorLike;
  text: string;
  isToggle?: boolean;
  onClick?: () => void;
  isSmallText?: boolean;
}): Button;

declare function updateButton(button: Button): void;

declare function init(settings: {
  update: () => void;
  title?: string;
  description?: string;
  characters?: string[];
  options?: Options;
  audioFiles?: { [key: string]: string };
});
