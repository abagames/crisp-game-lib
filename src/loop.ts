import * as view from "./view";
import * as letter from "./letter";
import * as input from "./input";
import * as color from "./color";
import { VectorLike } from "./vector";
import * as audio from "./audio";

/** Name for an appearance theme. */
export type ThemeName =
  | "simple"
  | "pixel"
  | "shape"
  | "shapeDark"
  | "crt"
  | "dark";
/** @ignore */
export type Theme = {
  name: ThemeName;
  isUsingPixi: boolean;
  isDarkColor: boolean;
};

export type Options = {
  viewSize?: VectorLike;
  bodyBackground?: string;
  viewBackground?: color.Color;
  isCapturing?: boolean;
  isCapturingGameCanvasOnly?: boolean;
  isSoundEnabled?: boolean;
  captureCanvasScale?: number;
  captureDurationSec?: number;
  theme?: Theme;
  colorPalette?: number[][];
};

let _init: () => void;
let _update: () => void;
const targetFps = 68;
const deltaTime = 1000 / targetFps;
let nextFrameTime = 0;
const defaultOptions: Options = {
  viewSize: { x: 100, y: 100 },
  bodyBackground: "#111",
  viewBackground: "black",
  isCapturing: false,
  isCapturingGameCanvasOnly: false,
  isSoundEnabled: true,
  captureCanvasScale: 1,
  theme: { name: "simple", isUsingPixi: false, isDarkColor: false },
  colorPalette: undefined,
};
let options: Options;
let textCacheEnableTicks = 10;
let loopFrameRequestId: number | undefined;

export async function init(
  __init: () => void,
  __update: () => void,
  _options?: Options
) {
  _init = __init;
  _update = __update;
  options = { ...defaultOptions, ..._options };
  color.init(options.theme.isDarkColor, options.colorPalette);
  view.init(
    options.viewSize,
    options.bodyBackground,
    options.viewBackground,
    options.isCapturing,
    options.isCapturingGameCanvasOnly,
    options.captureCanvasScale,
    options.captureDurationSec,
    options.theme
  );
  input.init(() => {
    audio.resume();
  });
  letter.init();
  await _init();
  update();
}

function update() {
  loopFrameRequestId = requestAnimationFrame(update);
  const now = window.performance.now();
  if (now < nextFrameTime - targetFps / 12) {
    return;
  }
  nextFrameTime += deltaTime;
  if (nextFrameTime < now || nextFrameTime > now + deltaTime * 2) {
    nextFrameTime = now + deltaTime;
  }
  audio.update();
  input.update();
  _update();
  if (options.isCapturing) {
    view.capture();
  }
  textCacheEnableTicks--;
  if (textCacheEnableTicks === 0) {
    letter.enableCache();
  }
}

export function stop() {
  if (loopFrameRequestId) {
    cancelAnimationFrame(loopFrameRequestId);
    loopFrameRequestId = undefined;
  }
}
