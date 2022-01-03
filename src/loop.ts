import * as view from "./view";
import * as letter from "./letter";
import * as input from "./input";
import * as color from "./color";
import { VectorLike } from "./vector";
import { Theme } from "./main";
declare const sss;

export type Options = {
  viewSize?: VectorLike;
  bodyBackground?: string;
  viewBackground?: Color;
  isUsingVirtualPad?: boolean;
  isFourWaysStick?: boolean;
  isCapturing?: boolean;
  isCapturingGameCanvasOnly?: boolean;
  captureCanvasScale?: number;
  theme?: Theme;
};

let _init: () => void;
let _update: () => void;
const targetFps = 68;
const deltaTime = 1000 / targetFps;
let nextFrameTime = 0;
const defaultOptions: Options = {
  viewSize: { x: 126, y: 126 },
  bodyBackground: "#111",
  viewBackground: "black",
  isUsingVirtualPad: true,
  isFourWaysStick: false,
  isCapturing: false,
  isCapturingGameCanvasOnly: false,
  captureCanvasScale: 1,
  theme: { name: "simple", isUsingPixi: false, isDarkColor: false },
};
let options: Options;
let textCacheEnableTicks = 10;

export function init(
  __init: () => void,
  __update: () => void,
  _options?: Options
) {
  _init = __init;
  _update = __update;
  options = { ...defaultOptions, ..._options };
  color.init(options.theme.isDarkColor);
  view.init(
    options.viewSize,
    options.bodyBackground,
    options.viewBackground,
    options.isCapturing,
    options.isCapturingGameCanvasOnly,
    options.captureCanvasScale,
    options.theme
  );
  input.init();
  letter.init();
  _init();
  update();
}

function update() {
  requestAnimationFrame(update);
  const now = window.performance.now();
  if (now < nextFrameTime - targetFps / 12) {
    return;
  }
  nextFrameTime += deltaTime;
  if (nextFrameTime < now || nextFrameTime > now + deltaTime * 2) {
    nextFrameTime = now + deltaTime;
  }
  sss.update();
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
