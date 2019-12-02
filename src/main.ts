import * as loop from "./loop";
import * as view from "./view";
import { Terminal } from "./terminal";
import * as input from "./input";
import { Vector, VectorLike } from "./vector";
import { Random } from "./random";
import * as rects from "./rects";
import { init as initColor, setColor } from "./color";
declare const sss;

export { clamp, wrap, range } from "./math";
export { rect, box, bar, line } from "./rects";
export { input };
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
export let ticks = 0;
export let difficulty: number;
export let score = 0;
export let random = new Random();
export type Color =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "cyan"
  | "white"
  | "black"
  | "transparent";
export type SoundEffectType =
  | "coin"
  | "laser"
  | "explosion"
  | "powerUp"
  | "hit"
  | "jump"
  | "select"
  | "lucky";

export function end() {
  initGameOver();
}

export function color(colorName: Color) {
  setColor(colorName);
}

export function vec(x?: number | VectorLike, y?: number) {
  return new Vector(x, y);
}

export function play(type: SoundEffectType) {
  sss.play(soundEffectTypeToString[type]);
}

const soundEffectTypeToString: { [key in SoundEffectType]: string } = {
  coin: "c",
  laser: "l",
  explosion: "e",
  powerUp: "p",
  hit: "h",
  jump: "j",
  select: "s",
  lucky: "u"
};
const defaultOptions = {
  seed: 0,
  isCapturing: false,
  viewSize: { x: 100, y: 100 },
  isPlayingBgm: false
};

declare let title: string;
declare let description: string;
declare let characters: string[];
declare type Options = {
  isPlayingBgm?: boolean;
  isCapturing?: boolean;
  viewSize?: { x: number; y: number };
  seed?: number;
};
declare let options: Options;
declare function update();

type State = "title" | "inGame" | "gameOver";
let state: State;
let updateFunc = {
  title: updateTitle,
  inGame: updateInGame,
  gameOver: updateGameOver
};
let terminal: Terminal;
let hiScore = 0;
let isNoTitle = true;
let seed = 0;
let loopOptions;
let terminalSize: VectorLike;
let isPlayingBgm: boolean;

addGameScript();
window.addEventListener("load", onLoad);

function onLoad() {
  loopOptions = {
    viewSize: { x: 100, y: 100 },
    bodyBackground: "#ddd",
    viewBackground: "#eee",
    isUsingVirtualPad: false
  };
  let opts;
  if (typeof options !== "undefined" && options != null) {
    opts = { ...defaultOptions, ...options };
  } else {
    opts = defaultOptions;
  }
  seed = opts.seed;
  loopOptions.isCapturing = opts.isCapturing;
  loopOptions.viewSize = opts.viewSize;
  isPlayingBgm = opts.isPlayingBgm;
  initColor();
  loop.init(init, _update, loopOptions);
  setColor("white");
}

function init() {
  if (
    typeof description !== "undefined" &&
    description != null &&
    description.trim().length > 0
  ) {
    isNoTitle = false;
    seed += getHash(description);
  }
  if (
    typeof title !== "undefined" &&
    title != null &&
    title.trim().length > 0
  ) {
    isNoTitle = false;
    document.title = title;
  }
  sss.init(seed);
  const sz = loopOptions.viewSize;
  terminalSize = { x: Math.floor(sz.x / 6), y: Math.floor(sz.y / 6) };
  terminal = new Terminal(terminalSize);
  if (isNoTitle) {
    initInGame();
    ticks = 0;
  } else {
    initTitle();
  }
}

function _update() {
  ticks = ticks;
  difficulty = ticks / 3600 + 1;
  rects.update();
  updateFunc[state]();
  ticks++;
}

function initInGame() {
  state = "inGame";
  ticks = -1;
  const s = Math.floor(score);
  if (s > hiScore) {
    hiScore = s;
  }
  score = 0;
  if (isPlayingBgm) {
    sss.playBgm();
  }
}

function updateInGame() {
  terminal.clear();
  view.clear();
  update();
  drawScore();
  terminal.draw();
}

function initTitle() {
  state = "title";
  ticks = -1;
  terminal.clear();
  view.clear();
}

function updateTitle() {
  if (ticks === 0) {
    drawScore();
    if (typeof title !== "undefined" && title != null) {
      terminal.print(title, Math.floor(terminalSize.x - title.length) / 2, 3);
    }
    terminal.draw();
  }
  if (ticks === 30 || ticks == 40) {
    if (typeof description !== "undefined" && description != null) {
      let maxLineLength = 0;
      description.split("\n").forEach(l => {
        if (l.length > maxLineLength) {
          maxLineLength = l.length;
        }
      });
      const x = Math.floor((terminalSize.x - maxLineLength) / 2);
      description.split("\n").forEach((l, i) => {
        terminal.print(l, x, Math.floor(terminalSize.y / 2) + i);
      });
      terminal.draw();
    }
  }
  if (input.isJustPressed) {
    initInGame();
  }
}

function initGameOver() {
  state = "gameOver";
  input.clearJustPressed();
  ticks = -1;
  drawGameOver();
  if (isPlayingBgm) {
    sss.stopBgm();
  }
}

function updateGameOver() {
  if (ticks > 20 && input.isJustPressed) {
    initInGame();
  } else if (ticks === 500 && !isNoTitle) {
    initTitle();
  }
  if (ticks === 10) {
    drawGameOver();
  }
}

function drawGameOver() {
  terminal.print(
    "GAME OVER",
    Math.floor((terminalSize.x - 9) / 2),
    Math.floor(terminalSize.y / 2)
  );
  terminal.draw();
}

function drawScore() {
  terminal.print(`${Math.floor(score)}`, 0, 0);
  const hs = `HI ${hiScore}`;
  terminal.print(hs, terminalSize.x - hs.length, 0);
}

function addGameScript() {
  let gameName = window.location.search.substring(1);
  gameName = gameName.replace(/\W/g, "");
  if (gameName.length === 0) {
    return;
  }
  const script = document.createElement("script");
  script.setAttribute("src", `${gameName}/main.js`);
  document.head.appendChild(script);
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
