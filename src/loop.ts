import * as view from "./view";
import * as letter from "./letter";
import * as input from "./input";
import * as audio from "./audio";

let _init: () => void;
let _update: () => void;
const targetFps = 68;
const deltaTime = 1000 / targetFps;
let nextFrameTime = 0;
let textCacheEnableTicks = 10;
let loopFrameRequestId: number | undefined;
let isCapturing;

export async function init(
  __init: () => void,
  __update: () => void,
  _isCapturing: boolean
) {
  _init = __init;
  _update = __update;
  isCapturing = _isCapturing;
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
  if (isCapturing) {
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
