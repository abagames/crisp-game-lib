import * as PIXI from "pixi.js";
import { Vector, VectorLike } from "./vector";
import { Theme } from "./main";
import { colorToNumber, colorToStyle } from "./color";
import { LetterImage, letterSize } from "./letter";
import { getGridFilter } from "./filters";
declare const gcc;

export const size = new Vector();
export let canvas: HTMLCanvasElement;
let canvasSize = new Vector();
let context: CanvasRenderingContext2D;
let graphics: PIXI.Graphics;
const graphicsScale = 5;

let background = document.createElement("img");
let captureCanvas: HTMLCanvasElement;
let captureContext: CanvasRenderingContext2D;
let calculatedCanvasScale = 1;
let viewBackground: Color = "black";

export let currentColor: Color;
let savedCurrentColor: Color;
let isFilling = false;

export let theme: Theme;
let crtFilter;

export function init(
  _size: VectorLike,
  _bodyBackground: string,
  _viewBackground: Color,
  isCapturing: boolean,
  isCapturingGameCanvasOnly: boolean,
  captureCanvasScale: number,
  _theme: Theme
) {
  size.set(_size);
  theme = _theme;
  viewBackground = _viewBackground;
  const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
  const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
`;
  const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
  document.body.style.cssText = bodyCss;
  canvasSize.set(size);
  if (theme.isUsingPixi) {
    canvasSize.mul(graphicsScale);
    const app = new PIXI.Application({
      width: canvasSize.x,
      height: canvasSize.y,
    });
    canvas = app.view;
    graphics = new PIXI.Graphics();
    graphics.scale.x = graphics.scale.y = graphicsScale;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    app.stage.addChild(graphics);
    graphics.filters = [];
    if (theme.name === "crt") {
      graphics.filters.push(
        (crtFilter = new (PIXI.filters as any).CRTFilter({
          vignettingAlpha: 0.7,
        }))
      );
    }
    if (theme.name === "pixel") {
      graphics.filters.push(getGridFilter(canvasSize.x, canvasSize.y));
    }
    if (theme.name === "pixel" || theme.name === "shapeDark") {
      const bloomFilter = new (PIXI.filters as any).AdvancedBloomFilter({
        threshold: 0.1,
        bloomScale: theme.name === "pixel" ? 1.5 : 1,
        brightness: theme.name === "pixel" ? 1.5 : 1,
        blur: 8,
      });
      graphics.filters.push(bloomFilter);
    }
    graphics.lineStyle(0);
    canvas.style.cssText = canvasCss;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = canvasSize.x;
    canvas.height = canvasSize.y;
    context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    canvas.style.cssText = canvasCss + crispCss;
  }
  document.body.appendChild(canvas);
  const setSize = () => {
    const cs = 0.95;
    const wr = innerWidth / innerHeight;
    const cr = canvasSize.x / canvasSize.y;
    const flgWh = wr < cr;
    const cw = flgWh ? cs * innerWidth : cs * innerHeight * cr;
    const ch = !flgWh ? cs * innerHeight : (cs * innerWidth) / cr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
  };
  window.addEventListener("resize", setSize);
  setSize();
  if (isCapturing) {
    captureCanvas = document.createElement("canvas");
    let optionCaptureScale;
    if (isCapturingGameCanvasOnly) {
      captureCanvas.width = canvasSize.x;
      captureCanvas.height = canvasSize.y;
      optionCaptureScale = captureCanvasScale;
    } else {
      if (canvasSize.x <= canvasSize.y * 2) {
        captureCanvas.width = canvasSize.y * 2;
        captureCanvas.height = canvasSize.y;
      } else {
        captureCanvas.width = canvasSize.x;
        captureCanvas.height = canvasSize.x / 2;
      }
      if (captureCanvas.width > 400) {
        calculatedCanvasScale = 400 / captureCanvas.width;
        captureCanvas.width = 400;
        captureCanvas.height *= calculatedCanvasScale;
      }
      optionCaptureScale = Math.round(400 / captureCanvas.width);
    }
    captureContext = captureCanvas.getContext("2d");
    captureContext.fillStyle = _bodyBackground;
    gcc.setOptions({
      scale: optionCaptureScale,
      capturingFps: 60,
      isSmoothingEnabled: false,
    });
  }
}

export function clear() {
  if (theme.isUsingPixi) {
    graphics.clear();
    isFilling = false;
    beginFillColor(colorToNumber(viewBackground, theme.isDarkColor ? 0.15 : 1));
    graphics.drawRect(0, 0, size.x, size.y);
    endFill();
    isFilling = false;
    return;
  }
  context.fillStyle = colorToStyle(
    viewBackground,
    theme.isDarkColor ? 0.15 : 1
  );
  context.fillRect(0, 0, size.x, size.y);
  context.fillStyle = colorToStyle(currentColor);
}

export function setColor(colorName: Color) {
  if (colorName === currentColor) {
    if (theme.isUsingPixi && !isFilling) {
      beginFillColor(colorToNumber(currentColor));
    }
    return;
  }
  currentColor = colorName;
  if (theme.isUsingPixi) {
    if (isFilling) {
      graphics.endFill();
    }
    beginFillColor(colorToNumber(currentColor));
    return;
  }
  context.fillStyle = colorToStyle(colorName);
}

function beginFillColor(color: number) {
  endFill();
  graphics.beginFill(color);
  isFilling = true;
}

export function endFill() {
  if (isFilling) {
    graphics.endFill();
    isFilling = false;
  }
}

export function saveCurrentColor() {
  savedCurrentColor = currentColor;
}

export function loadCurrentColor() {
  setColor(savedCurrentColor);
}

export function fillRect(x: number, y: number, width: number, height: number) {
  if (theme.isUsingPixi) {
    if (theme.name === "shape" || theme.name === "shapeDark") {
      graphics.drawRoundedRect(x, y, width, height, 2);
    } else {
      graphics.drawRect(x, y, width, height);
    }
    return;
  }
  context.fillRect(x, y, width, height);
}

export function drawLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number
) {
  const cn = colorToNumber(currentColor);
  beginFillColor(cn);
  graphics.drawCircle(x1, y1, thickness * 0.5);
  graphics.drawCircle(x2, y2, thickness * 0.5);
  endFill();
  graphics.lineStyle(thickness, cn);
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);
  graphics.lineStyle(0);
}

export function drawLetterImage(
  li: LetterImage,
  x: number,
  y: number,
  width?: number,
  height?: number
) {
  if (theme.isUsingPixi) {
    endFill();
    graphics.beginTextureFill({
      texture: li.texture,
      matrix: new PIXI.Matrix().translate(x, y),
    });
    graphics.drawRect(
      x,
      y,
      width == null ? letterSize : width,
      height == null ? letterSize : height
    );
    beginFillColor(colorToNumber(currentColor));
    return;
  }
  if (width == null) {
    context.drawImage(li.image, x, y);
  } else {
    context.drawImage(li.image, x, y, width, height);
  }
}

export function updateCrtFilter() {
  crtFilter.time += 0.2;
}

export function saveAsBackground() {
  background.src = canvas.toDataURL();
}

export function drawBackground() {
  context.drawImage(background, 0, 0);
}

export function capture() {
  captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  if (calculatedCanvasScale === 1) {
    captureContext.drawImage(
      canvas,
      (captureCanvas.width - canvas.width) / 2,
      (captureCanvas.height - canvas.height) / 2
    );
  } else {
    const w = canvas.width * calculatedCanvasScale;
    const h = canvas.height * calculatedCanvasScale;
    captureContext.drawImage(
      canvas,
      (captureCanvas.width - w) / 2,
      (captureCanvas.height - h) / 2,
      w,
      h
    );
  }
  gcc.capture(captureCanvas);
}
