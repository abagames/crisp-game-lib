import * as loop from "./loop";
import * as view from "./view";
import * as input from "./input";
import * as keyboard from "./keyboard";
import * as pointer from "./pointer";
import { Vector, VectorLike } from "./vector";
import { Random } from "./random";
import * as collision from "./collision";
import { Color } from "./color";
import {
  defineCharacters,
  print,
  letterSize,
  smallLetterWidth,
} from "./letter";
import * as _particle from "./particle";
import { times, remove } from "./util";
import {
  get as getButton,
  update as updateButton,
  draw as drawButton,
  Button,
} from "./button";
import * as replay from "./replay";
import { Theme, ThemeName } from "./loop";
import * as audio from "./audio";
declare const sss;
declare const Terser;
declare const cloneDeep;

export type { Vector, VectorLike, Theme, ThemeName };
export type { Color };
export type { Options };
export type { Collision } from "./collision";
export type { LetterOptions } from "./letter";
export { clamp, wrap, range, times, remove, addWithCharCode } from "./util";
export { rect, box, bar, line, arc } from "./rect";
export { text, char } from "./letter";
/** Input state from the mouse, touch screen, or keyboard. */
export { input };
/** @ignore */
export { keyboard, pointer };
/** @ignore */
export { getButton, updateButton };
export const PI = Math.PI;
export const abs = Math.abs;
export const sin = Math.sin;
export const cos = Math.cos;
export const atan2 = Math.atan2;
export const sqrt = Math.sqrt;
export const pow = Math.pow;
export const floor = Math.floor;
export const round = Math.round;
export const ceil = Math.ceil;
/** A variable incremented by one every 1/60 of a second. */
export let ticks = 0;
/** A variable that is one at the beginning of the game, two after 1 minute, and increasing by one every minute. */
export let difficulty: number;
/** Game score. */
export let score = 0;
/** Game time. */
/** @ignore */
export let time: number;
/** A variable that becomes `true` if the game is replaying. */
/** @ignore */
export let isReplaying = false;
/** Type of sound effects. */
export type SoundEffectType =
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
/**
 * Get a random float value.
 * If **high** parameter isn't specified, return a value from 0 to **lowOrHigh**.
 * @param lowOrHigh
 * @param high
 * @returns
 */
export function rnd(lowOrHigh: number = 1, high?: number) {
  return random.get(lowOrHigh, high);
}

/**
 * Get a random int value.
 * If **high** parameter isn't specified, return a value from 0 to **lowOrHigh**-1.
 * @param lowOrHigh
 * @param high
 * @returns
 */
export function rndi(lowOrHigh: number = 2, high?: number) {
  return random.getInt(lowOrHigh, high);
}

/**
 * Get a random float value that becomes negative with a one-half probability.
 * If **high** parameter isn't specified, return a value from -**lowOrHigh** to **lowOrHigh**.
 * @param lowOrHigh
 * @param high
 * @returns
 */
export function rnds(lowOrHigh: number = 1, high?: number) {
  return random.get(lowOrHigh, high) * random.getPlusOrMinus();
}

/**
 * Transition to the game-over state.
 * @param _gameOverText
 */
export function end(_gameOverText = "GAME OVER") {
  gameOverText = _gameOverText;
  if (currentOptions.isShowingTime) {
    time = undefined;
  }
  initGameOver();
}

/**
 * Transition to the game complete state.
 * @param _gameOverText
 */
/** @ignore */
export function complete(completeText = "COMPLETE") {
  gameOverText = completeText;
  initGameOver();
}

/**
 * Add a score point.
 * @param value Point to add.
 * @param x An x-coordinate or `Vector` position where added point is displayed.
 * @param y A y-coordinate where added point is displayed.
 */
export function addScore(value: number, x?: number | VectorLike, y?: number) {
  if (isReplaying) {
    return;
  }
  score += value;
  if (x == null) {
    return;
  }
  const str = `${value >= 1 ? "+" : ""}${Math.floor(value)}`;
  let pos = new Vector();
  if (typeof x === "number") {
    pos.set(x, y);
  } else {
    pos.set(x);
  }
  pos.x -=
    (str.length *
      (currentOptions.isUsingSmallText ? smallLetterWidth : letterSize)) /
    2;
  pos.y -= letterSize / 2;
  scoreBoards.push({
    str,
    pos,
    vy: -2,
    ticks: 30,
  });
}

/**
 * Set the color for drawing rectangles, particles, texts, and characters.
 * Setting the color prior to `char()` will recolor the pixel art.
 * Use color("black") to restore and use the original colors.
 * @param colorName
 */
export function color(colorNameOrColorIndex: Color | number) {
  view.setColor(colorNameOrColorIndex);
}

/**
 * Add particles.
 * @param x
 * @param y
 * @param optionsOrCount
 * angle: Angle of particles spreading \
 * angleWidth: The range of angles over which particles diffuse. If omitted, it spreads in a circular shape \
 * count: Count of particles \
 * speed: Speed of particles
 */
export function particle(
  x: number | VectorLike,
  y: number,
  optionsOrCount?:
    | number
    | {
        count?: number;
        speed?: number;
        angle?: number;
        angleWidth?: number;
        edgeColor?: Color;
      },
  speed?: number,
  angle?: number,
  angleWidth?: number
) {
  let pos = new Vector();
  if (typeof x === "number") {
    pos.set(x, y);
    add(pos, optionsOrCount, speed, angle, angleWidth);
  } else {
    pos.set(x);
    add(pos, y, optionsOrCount, speed, angle);
  }

  function add(pos, optionsOrCount, speed, angle, angleWidth) {
    if (isObject(optionsOrCount)) {
      const o: {
        count?: number;
        speed?: number;
        angle?: number;
        angleWidth?: number;
        edgeColor?: Color;
      } = optionsOrCount;
      _particle.add(pos, o.count, o.speed, o.angle, o.angleWidth, o.edgeColor);
    } else {
      _particle.add(pos, optionsOrCount, speed, angle, angleWidth);
    }
  }
}

/**
 * Return a `Vector` instance.
 * @param x
 * @param y
 * @returns
 */
export function vec(x?: number | VectorLike, y?: number): Vector {
  return new Vector(x, y);
}

/**
 * Play a sound effect.
 * @param type
 * @param options
 * @param options.seed Random seed (default = 0)
 * @param options.numberOfSounds Number of simultaneous sounds (default = 2)
 * @param options.volume Sound volume (default = 1)
 * @param options.pitch MIDI note number
 * @param options.freq Frequency (Hz)
 * @param options.note Note string (e.g. "C4", "F#3", "Ab5")
 */
export function play(
  type: SoundEffectType | string,
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
) {
  if (!isWaitingRewind && !isRewinding && currentOptions.isSoundEnabled) {
    const v = options != null && options.volume != null ? options.volume : 1;
    if (audio.audioContext != null && audio.play(type, v)) {
    } else if (options != null && typeof sss.playSoundEffect === "function") {
      sss.playSoundEffect(type, options);
    } else {
      sss.play(soundEffectTypeToString[type]);
    }
  }
}

let bgmTrack;

/**
 * Play a background music
 */
/** @ignore */
export function playBgm() {
  if (audio.audioContext != null) {
    audio.play(currentOptions.bgmName, currentOptions.bgmVolume);
  } else if (typeof sss.generateMml === "function") {
    bgmTrack = sss.playMml(sss.generateMml());
  } else {
    sss.playBgm();
  }
}

/**
 * Stop a background music
 */
/** @ignore */
export function stopBgm() {
  if (audio.audioContext != null) {
    audio.stop(currentOptions.bgmName);
  } else if (bgmTrack != null) {
    sss.stopMml(bgmTrack);
  } else {
    sss.stopBgm();
  }
}

/**
 * Save and load game frame states. Used for realizing a rewind function.
 * @param frameState
 * @returns
 */
/** @ignore */
export function frameState(frameState: any) {
  if (isWaitingRewind) {
    const rs = replay.getLastFrameState(random);
    const bs = rs.baseState;
    score = bs.score;
    ticks = bs.ticks;
    return cloneDeep(rs.gameState);
  } else if (isRewinding) {
    const rs = replay.rewind(random);
    const bs = rs.baseState;
    score = bs.score;
    ticks = bs.ticks;
    return rs.gameState;
  } else if (isReplaying) {
    const rs = replay.getFrameStateForReplay();
    return rs.gameState;
  } else if (state === "inGame") {
    const baseState = { score, ticks };
    replay.recordFrameState(frameState, baseState, random);
  }
  return frameState;
}

/**
 * Rewind the game.
 */
/** @ignore */
export function rewind() {
  if (isRewinding) {
    return;
  }
  if (!isReplaying && currentOptions.isRewindEnabled) {
    initRewind();
  } else {
    end();
  }
}

const soundEffectTypeToString: { [key in SoundEffectType]: string } = {
  coin: "c",
  laser: "l",
  explosion: "e",
  powerUp: "p",
  hit: "h",
  jump: "j",
  select: "s",
  lucky: "u",
  random: "r",
  click: "i",
  synth: "y",
  tone: "t",
};
const defaultOptions: Options = {
  isPlayingBgm: false,
  isCapturing: false,
  isCapturingGameCanvasOnly: false,
  captureCanvasScale: 1,
  captureDurationSec: 5,
  isShowingScore: true,
  isShowingTime: false,
  isReplayEnabled: false,
  isRewindEnabled: false,
  isDrawingParticleFront: false,
  isDrawingScoreFront: false,
  isUsingSmallText: true,
  isMinifying: false,
  isSoundEnabled: true,
  viewSize: { x: 100, y: 100 },
  audioSeed: 0,
  seed: 0,
  audioVolume: 1,
  theme: "simple",
  colorPalette: undefined,
  textEdgeColor: {
    score: undefined,
    floatingScore: undefined,
    title: undefined,
    description: undefined,
    gameOver: undefined,
  },
  bgmName: "bgm",
  bgmVolume: 1,
  audioTempo: 120,
};

declare let title: string;
declare let description: string;
declare let characters: string[];
declare let audioFiles: { [key: string]: string };
/** Game setting options. */
declare type Options = {
  /** Play BGM. */
  isPlayingBgm?: boolean;
  /** Capture a screen by pressing 'c' key. */
  isCapturing?: boolean;
  /** Additional setting for isCapturing, will omit the margins on two sides when enabled. */
  isCapturingGameCanvasOnly?: boolean;
  /** Additional setting for isCapturingGameCanvasOnly, set the scale of the output file, default: 1. */
  captureCanvasScale?: number;
  /** Capture duration in seconds, default: 5. */
  captureDurationSec?: number;
  /** Show a score and a hi-score, default: true. */
  isShowingScore?: boolean;
  /** Show a time. */
  /** @ignore */
  isShowingTime?: boolean;
  /** Enable replay of the previous game on the title screen. */
  isReplayEnabled?: boolean;
  /** Enable rewind. */
  /** @ignore */
  isRewindEnabled?: boolean;
  /** Display particles on the front of of the screen. */
  isDrawingParticleFront?: boolean;
  /** Display added score points on the front of the screen. */
  isDrawingScoreFront?: boolean;
  /** Use a small text for a score and a description, default: true. */
  isUsingSmallText?: boolean;
  /** Show a minified code to the console. */
  /** @ignore */
  isMinifying?: boolean;
  /** Enable BGM and sound effects, default: true. */
  isSoundEnabled?: boolean;
  /** Screen size of the game, default: {x: 100, y: 100}. */
  viewSize?: { x: number; y: number };
  /** Random number seed for BGM and sound effects generation. */
  audioSeed?: number;
  /** @deprecated Use audioSeed. */
  seed?: number;
  /** Audio volume, default: 1. */
  audioVolume?: number;
  /** Appearance theme of the game. */
  theme?: ThemeName;
  /** Custom color palette. */
  colorPalette?: number[][];
  /** Edge color of the text. */
  textEdgeColor?: {
    score?: Color;
    floatingScore?: Color;
    title?: Color;
    description?: Color;
    gameOver?: Color;
  };
  /** BGM name of audio file, default: "bgm" */
  bgmName?: string;
  /** BGM volume, default: 1  */
  bgmVolume?: number;
  /** Audio tempo, default: 120 */
  audioTempo?: number;
};
declare let options: Options;
declare function update();

const seedRandom = new Random();
const random = new Random();
type State = "title" | "inGame" | "gameOver" | "rewind";
let state: State;
let updateFunc = {
  title: updateTitle,
  inGame: updateInGame,
  gameOver: updateGameOver,
  rewind: updateRewind,
};
let hiScore = 0;
let fastestTime: number;
let isNoTitle = true;
let audioSeed = 0;
let currentOptions: Options;
let loopOptions;
let scoreBoards: { str: string; pos: Vector; vy: number; ticks: number }[];
let isWaitingRewind = false;
let isRewinding = false;
let rewindButton: Button;
let giveUpButton: Button;
let gameOverText: string;
let gameScriptFile: string;
let localStorageKey: string;

/** @ignore */
export function init(settings: {
  update: () => void;
  title?: string;
  description?: string;
  characters?: string[];
  options?: Options;
  audioFiles?: { [key: string]: string };
}) {
  const win: any = window;
  win.update = settings.update;
  win.title = settings.title;
  win.description = settings.description;
  win.characters = settings.characters;
  win.options = settings.options;
  win.audioFiles = settings.audioFiles;
  onLoad();
}

/** @ignore */
export function onLoad() {
  if (typeof options !== "undefined" && options != null) {
    currentOptions = { ...defaultOptions, ...options };
  } else {
    currentOptions = defaultOptions;
  }
  const theme = {
    name: currentOptions.theme,
    isUsingPixi: false,
    isDarkColor: false,
  };
  if (currentOptions.theme !== "simple" && currentOptions.theme !== "dark") {
    theme.isUsingPixi = true;
  }
  if (
    currentOptions.theme === "pixel" ||
    currentOptions.theme === "shapeDark" ||
    currentOptions.theme === "crt" ||
    currentOptions.theme === "dark"
  ) {
    theme.isDarkColor = true;
  }
  audioSeed = currentOptions.audioSeed + currentOptions.seed;
  if (currentOptions.isMinifying) {
    showMinifiedScript();
  }
  loopOptions = {
    viewSize: currentOptions.viewSize,
    bodyBackground: theme.isDarkColor ? "#101010" : "#e0e0e0",
    viewBackground: theme.isDarkColor ? "blue" : "white",
    theme,
    isSoundEnabled: currentOptions.isSoundEnabled,
    isCapturing: currentOptions.isCapturing,
    isCapturingGameCanvasOnly: currentOptions.isCapturingGameCanvasOnly,
    captureCanvasScale: currentOptions.captureCanvasScale,
    captureDurationSec: currentOptions.captureDurationSec,
    colorPalette: currentOptions.colorPalette,
  };
  loop.init(_init, _update, loopOptions);
}

function _init() {
  if (
    typeof description !== "undefined" &&
    description != null &&
    description.trim().length > 0
  ) {
    isNoTitle = false;
    audioSeed += getHash(description);
  }
  if (
    typeof title !== "undefined" &&
    title != null &&
    title.trim().length > 0
  ) {
    isNoTitle = false;
    document.title = title;
    audioSeed += getHash(title);
    localStorageKey = `crisp-game-${encodeURIComponent(title)}-${audioSeed}`;
    hiScore = loadHighScore();
  }
  if (typeof characters !== "undefined" && characters != null) {
    defineCharacters(characters, "a");
  }
  if (audioFiles != null) {
    audio.init();
    audio.setTempo(currentOptions.audioTempo);
    for (let audioName in audioFiles) {
      const a = audio.loadAudioFile(audioName, audioFiles[audioName]);
      if (audioName === currentOptions.bgmName) {
        a.isLooping = true;
      }
    }
  }
  if (currentOptions.isSoundEnabled) {
    sss.init(audioSeed, audio.audioContext);
    sss.setVolume(0.1 * currentOptions.audioVolume);
    sss.setTempo(currentOptions.audioTempo);
  }
  view.setColor("black");
  if (isNoTitle) {
    initInGame();
    ticks = 0;
  } else {
    initTitle();
  }
}

function _update() {
  df = difficulty = ticks / 3600 + 1;
  tc = ticks;
  const prevScore = score;
  const prevTime = time;
  sc = score;
  const prevSc = sc;
  inp = {
    p: input.pos,
    ip: input.isPressed,
    ijp: input.isJustPressed,
    ijr: input.isJustReleased,
  };
  collision.clear();
  updateFunc[state]();
  if (view.theme.isUsingPixi) {
    view.endFill();
    if (view.theme.name === "crt") {
      view.updateCrtFilter();
    }
  }
  ticks++;
  if (isReplaying) {
    score = prevScore;
    time = prevTime;
  } else if (sc !== prevSc) {
    score = sc;
  }
}

function initInGame() {
  state = "inGame";
  ticks = -1;
  _particle.init();
  const s = Math.floor(score);
  if (s > hiScore) {
    hiScore = s;
  }
  if (currentOptions.isShowingTime && time != null) {
    if (fastestTime == null || fastestTime > time) {
      fastestTime = time;
    }
  }
  score = 0;
  time = 0;
  scoreBoards = [];
  if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
    playBgm();
  }
  const randomSeed = seedRandom.getInt(999999999);
  random.setSeed(randomSeed);
  if (currentOptions.isReplayEnabled || currentOptions.isRewindEnabled) {
    replay.initRecord(randomSeed);
    replay.initFrameStates();
    isReplaying = false;
  }
}

function updateInGame() {
  view.clear();
  if (!currentOptions.isDrawingParticleFront) {
    _particle.update();
  }
  if (!currentOptions.isDrawingScoreFront) {
    updateScoreBoards();
  }
  if (currentOptions.isReplayEnabled || currentOptions.isRewindEnabled) {
    replay.recordInput({
      pos: vec(input.pos),
      isPressed: input.isPressed,
      isJustPressed: input.isJustPressed,
      isJustReleased: input.isJustReleased,
    });
  }
  if (typeof update === "function") {
    update();
  }
  if (currentOptions.isDrawingParticleFront) {
    _particle.update();
  }
  if (currentOptions.isDrawingScoreFront) {
    updateScoreBoards();
  }
  drawScoreOrTime();
  if (currentOptions.isShowingTime && time != null) {
    time++;
  }
}

function initTitle() {
  state = "title";
  ticks = -1;
  _particle.init();
  view.clear();
  if (replay.isRecorded()) {
    replay.initReplay(random);
    isReplaying = true;
  }
}

function updateTitle() {
  if (input.isJustPressed) {
    initInGame();
    return;
  }
  view.clear();
  if (currentOptions.isReplayEnabled && replay.isRecorded()) {
    replay.replayInput();
    inp = {
      p: input.pos,
      ip: input.isPressed,
      ijp: input.isJustPressed,
      ijr: input.isJustReleased,
    };
    if (!currentOptions.isDrawingParticleFront) {
      _particle.update();
    }
    update();
    if (currentOptions.isDrawingParticleFront) {
      _particle.update();
    }
  }
  drawScoreOrTime();
  if (typeof title !== "undefined" && title != null) {
    let maxLineLength = 0;
    title.split("\n").forEach((l) => {
      if (l.length > maxLineLength) {
        maxLineLength = l.length;
      }
    });
    const x = Math.floor((view.size.x - maxLineLength * letterSize) / 2);
    title.split("\n").forEach((l, i) => {
      print(l, x, Math.floor(view.size.y * 0.25) + i * letterSize, {
        edgeColor: currentOptions.textEdgeColor.title,
      });
    });
  }
  if (typeof description !== "undefined" && description != null) {
    let maxLineLength = 0;
    description.split("\n").forEach((l) => {
      if (l.length > maxLineLength) {
        maxLineLength = l.length;
      }
    });
    const lw = currentOptions.isUsingSmallText ? smallLetterWidth : letterSize;
    const x = Math.floor((view.size.x - maxLineLength * lw) / 2);
    description.split("\n").forEach((l, i) => {
      print(l, x, Math.floor(view.size.y / 2) + i * letterSize, {
        isSmallText: currentOptions.isUsingSmallText,
        edgeColor: currentOptions.textEdgeColor.description,
      });
    });
  }
}

function initGameOver() {
  state = "gameOver";
  if (!isReplaying) {
    input.clearJustPressed();
  }
  ticks = -1;
  drawGameOver();
  if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
    stopBgm();
  }
  const s = Math.floor(score);
  if (s > hiScore) {
    saveHighScore(s);
  }
}

function updateGameOver() {
  if (ticks === 0 && !view.theme.isUsingPixi) {
    drawGameOver();
  }
  if ((isReplaying || ticks > 20) && input.isJustPressed) {
    initInGame();
  } else if (
    ticks === (currentOptions.isReplayEnabled ? 120 : 300) &&
    !isNoTitle
  ) {
    initTitle();
  }
}

function drawGameOver() {
  if (isReplaying) {
    return;
  }
  print(
    gameOverText,
    Math.floor((view.size.x - gameOverText.length * letterSize) / 2),
    Math.floor(view.size.y / 2),
    { edgeColor: currentOptions.textEdgeColor.gameOver }
  );
}

function initRewind() {
  state = "rewind";
  isWaitingRewind = true;
  rewindButton = getButton({
    pos: { x: view.size.x - 39, y: 11 },
    size: { x: 36, y: 7 },
    text: "Rewind",
    isSmallText: currentOptions.isUsingSmallText,
  });
  giveUpButton = getButton({
    pos: { x: view.size.x - 39, y: view.size.y - 19 },
    size: { x: 36, y: 7 },
    text: "GiveUp",
    isSmallText: currentOptions.isUsingSmallText,
  });
  if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
    stopBgm();
  }
  if (view.theme.isUsingPixi) {
    drawButton(rewindButton);
    drawButton(giveUpButton);
  }
}

function updateRewind() {
  view.clear();
  update();
  drawScoreOrTime();
  replay.restoreInput();
  if (isRewinding) {
    drawButton(rewindButton);
    if (replay.isFrameStateEmpty() || !input.isPressed) {
      stopRewind();
    }
  } else {
    updateButton(rewindButton);
    updateButton(giveUpButton);
    if (rewindButton.isPressed) {
      isRewinding = true;
      isWaitingRewind = false;
    }
  }
  if (giveUpButton.isPressed) {
    isWaitingRewind = isRewinding = false;
    end();
  }
  if (currentOptions.isShowingTime && time != null) {
    time++;
  }
}

function stopRewind() {
  isRewinding = false;
  state = "inGame";
  _particle.init();
  if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
    playBgm();
  }
}

function drawScoreOrTime() {
  if (currentOptions.isShowingTime) {
    drawTime(time, 3, 3);
    drawTime(
      fastestTime,
      view.size.x -
        7 * (currentOptions.isUsingSmallText ? smallLetterWidth : letterSize),
      3
    );
  } else if (currentOptions.isShowingScore) {
    print(`${Math.floor(score)}`, 3, 3, {
      isSmallText: currentOptions.isUsingSmallText,
      edgeColor: currentOptions.textEdgeColor.score,
    });
    const hs = `HI ${hiScore}`;
    print(
      hs,
      view.size.x -
        hs.length *
          (currentOptions.isUsingSmallText ? smallLetterWidth : letterSize),
      3,
      {
        isSmallText: currentOptions.isUsingSmallText,
        edgeColor: currentOptions.textEdgeColor.score,
      }
    );
  }
}

function drawTime(time: number, x: number, y: number) {
  if (time == null) {
    return;
  }
  let t = Math.floor((time * 100) / 50);
  if (t >= 10 * 60 * 100) {
    t = 10 * 60 * 100 - 1;
  }
  const ts =
    getPaddedNumber(Math.floor(t / 6000), 1) +
    "'" +
    getPaddedNumber(Math.floor((t % 6000) / 100), 2) +
    '"' +
    getPaddedNumber(Math.floor(t % 100), 2);
  print(ts, x, y, {
    isSmallText: currentOptions.isUsingSmallText,
    edgeColor: currentOptions.textEdgeColor.score,
  });
}

function getPaddedNumber(v: number, digit: number) {
  return ("0000" + v).slice(-digit);
}

function updateScoreBoards() {
  view.saveCurrentColor();
  view.setColor("black");
  scoreBoards = scoreBoards.filter((sb) => {
    print(sb.str, sb.pos.x, sb.pos.y, {
      isSmallText: currentOptions.isUsingSmallText,
      edgeColor: currentOptions.textEdgeColor.floatingScore,
    });
    sb.pos.y += sb.vy;
    sb.vy *= 0.9;
    sb.ticks--;
    return sb.ticks > 0;
  });
  view.loadCurrentColor();
}

function getHash(v: string) {
  let hash = 0;
  for (let i = 0; i < v.length; i++) {
    const chr = v.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

function saveHighScore(highScore: number) {
  if (localStorageKey == null) {
    return;
  }
  try {
    const gameState = { highScore };
    localStorage.setItem(localStorageKey, JSON.stringify(gameState));
  } catch (error) {
    console.warn("Unable to save high score:", error);
  }
}

function loadHighScore() {
  try {
    const gameStateString = localStorage.getItem(localStorageKey);
    if (gameStateString) {
      const gameState = JSON.parse(gameStateString);
      return gameState.highScore;
    }
  } catch (error) {
    console.warn("Unable to load high score:", error);
  }
  return 0;
}

function isObject(arg) {
  return arg != null && arg.constructor === Object;
}

/** @ignore */
export function addGameScript() {
  let gameName = window.location.search.substring(1);
  gameName = gameName.replace(/[^A-Za-z0-9_-]/g, "");
  if (gameName.length === 0) {
    return;
  }
  const script = document.createElement("script");
  gameScriptFile = `${gameName}/main.js`;
  script.setAttribute("src", gameScriptFile);
  document.head.appendChild(script);
}

function showMinifiedScript() {
  fetch(gameScriptFile)
    .then((res) => res.text())
    .then((t) => {
      const minifiedScript: string = Terser.minify(t + "update();", {
        toplevel: true,
      }).code;
      const functionStartString = "function(){";
      const fi = minifiedScript.indexOf(functionStartString);
      const optionsString = "options={";
      const oi = minifiedScript.indexOf(optionsString);
      let minifiedUpdateScript = minifiedScript;
      if (fi >= 0) {
        minifiedUpdateScript = minifiedScript.substring(
          minifiedScript.indexOf(functionStartString) +
            functionStartString.length,
          minifiedScript.length - 4
        );
      } else if (oi >= 0) {
        let bc = 1;
        let ui;
        for (
          let i = oi + optionsString.length;
          i < minifiedScript.length;
          i++
        ) {
          const c = minifiedScript.charAt(i);
          if (c === "{") {
            bc++;
          } else if (c === "}") {
            bc--;
            if (bc === 0) {
              ui = i + 2;
              break;
            }
          }
        }
        if (bc === 0) {
          minifiedUpdateScript = minifiedScript.substring(ui);
        }
      }
      minifyReplaces.forEach(([o, r]) => {
        minifiedUpdateScript = minifiedUpdateScript.split(o).join(r);
      });
      console.log(minifiedUpdateScript);
      console.log(`${minifiedUpdateScript.length} letters`);
    });
}

/** @ignore */
export let inp: { p: Vector; ip: boolean; ijp: boolean; ijr: boolean };
/** @ignore */
export function clr(...args) {
  return color.apply(this, args);
}
/** @ignore */
export function ply(...args) {
  return play.apply(this, args);
}
/** @ignore */
export function tms(...args) {
  return times.apply(this, args);
}
/** @ignore */
export function rmv(...args) {
  return remove.apply(this.args);
}
/** @ignore */
export let tc: number;
/** @ignore */
export let df: number;
/** @ignore */
export let sc: number;
/** @ignore */
export const tr = "transparent";
/** @ignore */
export const wh = "white";
/** @ignore */
export const rd = "red";
/** @ignore */
export const gr = "green";
/** @ignore */
export const yl = "yellow";
/** @ignore */
export const bl = "blue";
/** @ignore */
export const pr = "purple";
/** @ignore */
export const cy = "cyan";
/** @ignore */
export const lc = "black";
/** @ignore */
export const cn = "coin";
/** @ignore */
export const ls = "laser";
/** @ignore */
export const ex = "explosion";
/** @ignore */
export const pw = "powerUp";
/** @ignore */
export const ht = "hit";
/** @ignore */
export const jm = "jump";
/** @ignore */
export const sl = "select";
/** @ignore */
export const uc = "lucky";

/** @ignore */
export let minifyReplaces = [
  ["===", "=="],
  ["!==", "!="],
  ["input.pos", "inp.p"],
  ["input.isPressed", "inp.ip"],
  ["input.isJustPressed", "inp.ijp"],
  ["input.isJustReleased", "inp.ijr"],
  ["color(", "clr("],
  ["play(", "ply("],
  ["times(", "tms("],
  ["remove(", "rmv("],
  ["ticks", "tc"],
  ["difficulty", "df"],
  ["score", "sc"],
  [".isColliding.rect.transparent", ".tr"],
  [".isColliding.rect.white", ".wh"],
  [".isColliding.rect.red", ".rd"],
  [".isColliding.rect.green", ".gr"],
  [".isColliding.rect.yellow", ".yl"],
  [".isColliding.rect.blue", ".bl"],
  [".isColliding.rect.purple", ".pr"],
  [".isColliding.rect.cyan", ".cy"],
  [".isColliding.rect.black", ".lc"],
  ['"transparent"', "tr"],
  ['"white"', "wh"],
  ['"red"', "rd"],
  ['"green"', "gr"],
  ['"yellow"', "yl"],
  ['"blue"', "bl"],
  ['"purple"', "pr"],
  ['"cyan"', "cy"],
  ['"black"', "lc"],
  ['"coin"', "cn"],
  ['"laser"', "ls"],
  ['"explosion"', "ex"],
  ['"powerUp"', "pw"],
  ['"hit"', "ht"],
  ['"jump"', "jm"],
  ['"select"', "sl"],
  ['"lucky"', "uc"],
];
