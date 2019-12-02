import { Vector, VectorLike } from "./vector";
declare const gcc;

export const size = new Vector();
export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

let bodyCss: string;
const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
let background = document.createElement("img");
let captureCanvas: HTMLCanvasElement;
let captureContext: CanvasRenderingContext2D;
let viewBackground = "black";

export function init(
  _size: VectorLike,
  _bodyBackground: string,
  _viewBackground: string,
  isCapturing: boolean
) {
  size.set(_size);
  viewBackground = _viewBackground;
  bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
  document.body.style.cssText = bodyCss;
  canvas = document.createElement("canvas");
  canvas.width = size.x;
  canvas.height = size.y;
  canvas.style.cssText = canvasCss;
  const cs = 95;
  const cw = size.x >= size.y ? cs : (cs / size.y) * size.x;
  const ch = size.y >= size.x ? cs : (cs / size.x) * size.y;
  canvas.style.width = `${cw}vmin`;
  canvas.style.height = `${ch}vmin`;
  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  document.body.appendChild(canvas);
  if (isCapturing) {
    captureCanvas = document.createElement("canvas");
    const cw = size.y * 2;
    captureCanvas.width = size.x > cw ? size.x : cw;
    captureCanvas.height = size.y;
    captureContext = captureCanvas.getContext("2d");
    captureContext.fillStyle = _bodyBackground;
    gcc.setOptions({ scale: 2, capturingFps: 60 });
  }
}

export function clear() {
  context.fillStyle = viewBackground;
  context.fillRect(0, 0, size.x, size.y);
}

export function saveAsBackground() {
  background.src = canvas.toDataURL();
}

export function drawBackground() {
  context.drawImage(background, 0, 0);
}

export function capture() {
  captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  captureContext.drawImage(canvas, (captureCanvas.width - canvas.width) / 2, 0);
  gcc.capture(captureCanvas);
}
