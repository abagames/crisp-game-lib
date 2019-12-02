import { letterPatterns } from "./letterPattern";
import { context } from "./view";
import { range } from "./math";
import { rgbObjects, colorChars, ColorChar } from "./color";

const dotCount = 6;
const dotSize = 1;
export const letterSize = dotCount * dotSize;
export const rotationChars = "kljhnmbvopiu9087";
let letterImages: HTMLImageElement[];
let symbolImages: HTMLImageElement[];
let cachedImages: { [key: string]: HTMLImageElement };
let isCacheEnabled = false;
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;

export type Options = {
  color?: string;
  colorPattern?: string;
  backgroundColor?: string;
  backgroundColorPattern?: string;
  rotation?: string;
  rotationPattern?: string;
  symbol?: string;
  symbolPattern?: string;
  charAndColorPattern?: string;
  scale?: number;
  alpha?: number;
};

export type CharOptions = {
  color?: ColorChar;
  backgroundColor?: ColorChar;
  angleIndex?: number;
  isMirrorX?: boolean;
  isMirrorY?: boolean;
  isSymbol?: boolean;
  scale?: number;
  alpha?: number;
};

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  letterImages = letterPatterns.map(lp => createLetterImages(lp));
  symbolImages = range(64).map(() => undefined);
  cachedImages = {};
}

export function defineSymbols(pattern: string[], startChar: string) {
  const index = startChar.charCodeAt(0) - 0x21;
  pattern.forEach((p, i) => {
    symbolImages[index + i] = createLetterImages(p);
  });
}

export function enableCache() {
  isCacheEnabled = true;
}

export function print(
  _str: string,
  x: number,
  y: number,
  options: Options = {}
) {
  const bx = Math.floor(x);
  let colorLines =
    options.colorPattern != null ? options.colorPattern.split("\n") : undefined;
  const backgroundColorLines =
    options.backgroundColorPattern != null
      ? options.backgroundColorPattern.split("\n")
      : undefined;
  const rotationLines =
    options.rotationPattern != null
      ? options.rotationPattern.split("\n")
      : undefined;
  const symbolLines =
    options.symbolPattern != null
      ? options.symbolPattern.split("\n")
      : undefined;
  const scale = options.scale == null ? 1 : options.scale;
  const alpha = options.alpha == null ? 1 : options.alpha;
  let str = _str;
  if (options.charAndColorPattern != null) {
    const [_lines, _colorLines] = getColorLines(options.charAndColorPattern);
    str = _lines.join("\n");
    colorLines = _colorLines;
  }
  let px = bx;
  let py = Math.floor(y);
  let lx = 0;
  let ly = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "\n") {
      px = bx;
      py += letterSize * scale;
      lx = 0;
      ly++;
      continue;
    }
    printChar(c, px, py, {
      ...getCharOption(
        options.color != null
          ? options.color
          : getCharFromLines(colorLines, lx, ly),
        options.backgroundColor != null
          ? options.backgroundColor
          : getCharFromLines(backgroundColorLines, lx, ly),
        options.rotation != null
          ? options.rotation
          : getCharFromLines(rotationLines, lx, ly),
        options.symbol != null
          ? options.symbol
          : getCharFromLines(symbolLines, lx, ly)
      ),
      ...{ scale, alpha }
    });
    px += letterSize * scale;
    lx++;
  }
}

export function getColorLines(str: string) {
  const _cc = str.split("\n");
  const cc = _cc.slice(1, _cc.length - 1);
  const lines = [];
  const colorLines = [];
  let isNormalLine = true;
  for (const l of cc) {
    if (isNormalLine) {
      lines.push(l);
      isNormalLine = false;
      continue;
    }
    if (isColorLine(l)) {
      colorLines.push(l);
      isNormalLine = true;
    } else {
      lines.push(l);
      colorLines.push("");
    }
  }
  return [lines, colorLines];
}

export function isColorLine(line: string) {
  return (
    line.trim().length > 0 &&
    line.replace(new RegExp(`[\\s${colorChars}]`, "g"), "").length === 0
  );
}

export function getCharFromLines(lines: string[], x: number, y: number) {
  if (lines == null) {
    return undefined;
  }
  if (y >= lines.length) {
    return undefined;
  }
  const c = lines[y].charAt(x);
  return c === "" || c === " " ? undefined : c;
}

export function getCharOption(
  cg?: string,
  bg?: string,
  rg?: string,
  sg?: string
) {
  let options: CharOptions = {
    color: "l",
    backgroundColor: "t",
    angleIndex: 0,
    isMirrorX: false,
    isMirrorY: false,
    isSymbol: false
  };
  if (cg != null && isColorChars(cg)) {
    options.color = cg;
  }
  if (bg != null && isColorChars(bg)) {
    options.backgroundColor = bg;
  }
  if (rg != null) {
    const ri = rotationChars.indexOf(rg);
    if (ri >= 0) {
      options.angleIndex = ri % 4;
      options.isMirrorX = (ri & 4) > 0;
      options.isMirrorY = (ri & 8) > 0;
    }
  }
  if (sg === "s") {
    options.isSymbol = true;
  }
  return options;
}

export function printChar(
  c: string,
  x: number,
  y: number,
  options: CharOptions
) {
  const cca = c.charCodeAt(0);
  if (cca < 0x20 || cca > 0x7e) {
    return;
  }
  const scaledSize = letterSize * options.scale;
  if (options.backgroundColor !== "t") {
    const rgb = rgbObjects[colorChars.indexOf(options.backgroundColor)];
    context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${Math.floor(
      options.alpha * 255
    )})`;
    context.fillRect(x, y, scaledSize, scaledSize);
  }
  if (cca == 0x20 || options.color === "t") {
    return;
  }
  const cc = cca - 0x21;
  const img = options.isSymbol ? symbolImages[cc] : letterImages[cc];
  if (
    options.color === "w" &&
    options.angleIndex % 4 === 0 &&
    !options.isMirrorX &&
    !options.isMirrorY &&
    options.alpha === 1
  ) {
    if (options.scale === 1) {
      context.drawImage(img, x, y);
    } else {
      context.drawImage(img, x, y, scaledSize, scaledSize);
    }
    return;
  }
  const cacheIndex = JSON.stringify({ c, options });
  const ci = cachedImages[cacheIndex];
  if (ci != null) {
    context.drawImage(ci, x, y);
    return;
  }
  letterContext.clearRect(0, 0, letterSize, letterSize);
  letterContext.globalAlpha = options.alpha;
  if (
    options.angleIndex % 4 === 0 &&
    !options.isMirrorX &&
    !options.isMirrorY
  ) {
    letterContext.drawImage(img, 0, 0);
  } else {
    letterContext.save();
    letterContext.translate(letterSize / 2, letterSize / 2);
    letterContext.rotate((Math.PI / 2) * options.angleIndex);
    if (options.isMirrorX || options.isMirrorY) {
      letterContext.scale(
        options.isMirrorX ? -1 : 1,
        options.isMirrorY ? -1 : 1
      );
    }
    letterContext.drawImage(img, -letterSize / 2, -letterSize / 2);
    letterContext.restore();
  }
  if (options.color !== "w") {
    letterContext.globalCompositeOperation = "source-in";
    const rgb = rgbObjects[colorChars.indexOf(options.color)];
    letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    letterContext.fillRect(0, 0, letterSize, letterSize);
    letterContext.globalCompositeOperation = "source-over";
  }
  context.drawImage(letterCanvas, x, y, scaledSize, scaledSize);
  if (isCacheEnabled) {
    const cachedImage = document.createElement("img");
    cachedImage.src = letterCanvas.toDataURL();
    cachedImages[cacheIndex] = cachedImage;
  }
}

function isColorChars(c: string): c is ColorChar {
  return colorChars.indexOf(c) >= 0;
}

function createLetterImages(
  pattern: string,
  isSkippingFirstAndLastLine = true
) {
  letterContext.clearRect(0, 0, letterSize, letterSize);
  let p = pattern.split("\n");
  if (isSkippingFirstAndLastLine) {
    p = p.slice(1, p.length - 1);
  }
  let pw = 0;
  p.forEach(l => {
    pw = Math.max(l.length, pw);
  });
  const xPadding = Math.max(Math.ceil((dotCount - pw) / 2), 0);
  const ph = p.length;
  const yPadding = Math.max(Math.ceil((dotCount - ph) / 2), 0);
  p.forEach((l, y) => {
    if (y + yPadding >= dotCount) {
      return;
    }
    for (let x = 0; x < dotCount - xPadding; x++) {
      const c = l.charAt(x);
      let ci = colorChars.indexOf(c);
      if (c !== "" && ci >= 1) {
        const rgb = rgbObjects[ci];
        letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        letterContext.fillRect(
          (x + xPadding) * dotSize,
          (y + yPadding) * dotSize,
          dotSize,
          dotSize
        );
      }
    }
  });
  const img = document.createElement("img");
  img.src = letterCanvas.toDataURL();
  return img;
}
