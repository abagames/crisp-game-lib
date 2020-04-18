import * as loop from "./loop";
import * as view from "./view";
import { Terminal } from "./terminal";
import * as input from "./input";
import * as keyboard from "./keyboard";
import * as pointer from "./pointer";
import { Vector, VectorLike } from "./vector";
import { Random } from "./random";
import * as collision from "./collision";
import { init as initColor, setColor, Color } from "./color";
import { defineCharacters, print, letterSize } from "./letter";
import * as replay from "./replay";
declare const sss;
declare const Terser;

export { clamp, wrap, range, times, addWithCharCode } from "./util";
export { rect, box, bar, line } from "./rect";
export { text, char } from "./letter";
export { Color };
export { input, keyboard, pointer };
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
export type SoundEffectType =
  | "coin"
  | "laser"
  | "explosion"
  | "powerUp"
  | "hit"
  | "jump"
  | "select"
  | "lucky";

export function rnd(lowOrHigh: number = 1, high?: number) {
  return random.get(lowOrHigh, high);
}

export function rndi(lowOrHigh: number = 2, high?: number) {
  return random.getInt(lowOrHigh, high);
}

export function rnds(lowOrHigh: number = 1, high?: number) {
  return random.get(lowOrHigh, high) * random.getPlusOrMinus();
}

export function end() {
  initGameOver();
}

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
  pos.x -= (str.length * letterSize) / 2;
  pos.y -= letterSize / 2;
  scoreBoards.push({
    str,
    pos,
    vy: -2,
    ticks: 30,
  });
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
  lucky: "u",
};
const defaultOptions = {
  isPlayingBgm: false,
  isCapturing: false,
  isShowingScore: true,
  isReplayEnabled: false,
  isMinifying: false,
  viewSize: { x: 100, y: 100 },
  seed: 0,
};

declare let title: string;
declare let description: string;
declare let characters: string[];
declare type Options = {
  isPlayingBgm?: boolean;
  isCapturing?: boolean;
  isShowingScore?: boolean;
  isReplayEnabled?: boolean;
  isMinifying?: boolean;
  viewSize?: { x: number; y: number };
  seed?: number;
};
declare let options: Options;
declare function update();

const seedRandom = new Random();
const random = new Random();
type State = "title" | "inGame" | "gameOver";
let state: State;
let updateFunc = {
  title: updateTitle,
  inGame: updateInGame,
  gameOver: updateGameOver,
};
let terminal: Terminal;
let hiScore = 0;
let isNoTitle = true;
let seed = 0;
let loopOptions;
let isPlayingBgm: boolean;
let isShowingScore: boolean;
let isReplayEnabled: boolean;
let terminalSize: VectorLike;
let scoreBoards: { str: string; pos: Vector; vy: number; ticks: number }[];
let isReplaying = false;
let gameScriptFile: string;

addGameScript();
window.addEventListener("load", onLoad);

function onLoad() {
  loopOptions = {
    viewSize: { x: 100, y: 100 },
    bodyBackground: "#e0e0e0",
    viewBackground: "#eeeeee",
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
  isShowingScore = opts.isShowingScore;
  isReplayEnabled = opts.isReplayEnabled;
  if (opts.isMinifying) {
    showMinifiedScript();
  }
  initColor();
  loop.init(init, _update, loopOptions);
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
    seed += getHash(title);
  }
  if (typeof characters !== "undefined" && characters != null) {
    defineCharacters(characters, "a");
  }
  sss.init(seed);
  const sz = loopOptions.viewSize;
  terminalSize = { x: Math.floor(sz.x / 6), y: Math.floor(sz.y / 6) };
  terminal = new Terminal(terminalSize);
  setColor("black");
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
  ticks++;
  if (sc !== prevSc) {
    score = sc;
  }
}

function initInGame() {
  state = "inGame";
  ticks = -1;
  const s = Math.floor(score);
  if (s > hiScore) {
    hiScore = s;
  }
  score = 0;
  scoreBoards = [];
  if (isPlayingBgm) {
    sss.playBgm();
  }
  const randomSeed = seedRandom.getInt(999999999);
  random.setSeed(randomSeed);
  if (isReplayEnabled) {
    replay.initRecord(randomSeed);
    isReplaying = false;
  }
}

function updateInGame() {
  terminal.clear();
  view.clear();
  updateScoreBoards();
  if (isReplayEnabled) {
    replay.recordInput({
      pos: vec(input.pos),
      isPressed: input.isPressed,
      isJustPressed: input.isJustPressed,
      isJustReleased: input.isJustReleased,
    });
  }
  update();
  drawScore();
  terminal.draw();
}

function initTitle() {
  state = "title";
  ticks = -1;
  terminal.clear();
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
  if (replay.isRecorded()) {
    replay.replayInput();
    inp = {
      p: input.pos,
      ip: input.isPressed,
      ijp: input.isJustPressed,
      ijr: input.isJustReleased,
    };
    view.clear();
    update();
    terminal.draw();
  }
  if (ticks === 0) {
    drawScore();
    if (typeof title !== "undefined" && title != null) {
      terminal.print(
        title,
        Math.floor(terminalSize.x - title.length) / 2,
        Math.ceil(terminalSize.y * 0.2)
      );
    }
    terminal.draw();
  }
  if (ticks === 30 || ticks == 40) {
    if (typeof description !== "undefined" && description != null) {
      let maxLineLength = 0;
      description.split("\n").forEach((l) => {
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
}

function initGameOver() {
  state = "gameOver";
  if (!isReplaying) {
    input.clearJustPressed();
  }
  ticks = -1;
  drawGameOver();
  if (isPlayingBgm) {
    sss.stopBgm();
  }
}

function updateGameOver() {
  if ((isReplaying || ticks > 20) && input.isJustPressed) {
    initInGame();
  } else if (ticks === 120 && !isNoTitle) {
    initTitle();
  }
  if (ticks === 10) {
    drawGameOver();
  }
}

function drawGameOver() {
  if (isReplaying) {
    return;
  }
  terminal.print(
    "GAME OVER",
    Math.floor((terminalSize.x - 9) / 2),
    Math.floor(terminalSize.y / 2)
  );
  terminal.draw();
}

function drawScore() {
  if (!isShowingScore) {
    return;
  }
  terminal.print(`${Math.floor(score)}`, 0, 0);
  const hs = `HI ${hiScore}`;
  terminal.print(hs, terminalSize.x - hs.length, 0);
}

function updateScoreBoards() {
  const currentFillStyle = view.context.fillStyle;
  setColor("black", false);
  scoreBoards = scoreBoards.filter((sb) => {
    print(sb.str, sb.pos.x, sb.pos.y);
    sb.pos.y += sb.vy;
    sb.vy *= 0.9;
    sb.ticks--;
    return sb.ticks > 0;
  });
  view.context.fillStyle = currentFillStyle;
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

function addGameScript() {
  let gameName = window.location.search.substring(1);
  gameName = gameName.replace(/\W/g, "");
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
      let minifiedUpdateScript = minifiedScript.substring(
        minifiedScript.indexOf(functionStartString) +
          functionStartString.length,
        minifiedScript.length - 4
      );
      minifyReplaces.forEach(([o, r]) => {
        minifiedUpdateScript = minifiedUpdateScript.split(o).join(r);
      });
      console.log(minifiedUpdateScript);
      console.log(`${minifiedUpdateScript.length} letters`);
    });
}

export let inp: { p: Vector; ip: boolean; ijp: boolean; ijr: boolean };
export let tc: number;
export let df: number;
export let sc: number;
export const tr = "transparent";
export const wh = "white";
export const rd = "red";
export const gr = "green";
export const yl = "yellow";
export const bl = "blue";
export const pr = "purple";
export const cy = "cyan";
export const lc = "black";
export const cn = "coin";
export const ls = "laser";
export const ex = "explosion";
export const pw = "powerUp";
export const ht = "hit";
export const jm = "jump";
export const sl = "select";
export const uc = "lucky";

export let minifyReplaces = [
  ["===", "=="],
  ["!==", "!="],
  ["input.pos", "inp.p"],
  ["input.isPressed", "inp.ip"],
  ["input.isJustPressed", "inp.ijp"],
  ["input.isJustReleased", "inp.ijr"],
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
