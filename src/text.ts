import { letterPatterns } from "./letterPattern";
import { context } from "./view";
import { range } from "./math";
import { Color, setColor, colorChars, rgbObjects } from "./color";

const dotCount = 6;
const dotSize = 1;
export const letterSize = dotCount * dotSize;
let textImages: HTMLImageElement[];
let characterImages: HTMLImageElement[];
let cachedImages: { [key: string]: HTMLImageElement };
let isCacheEnabled = false;
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;

export type Options = {
  color?: Color;
  backgroundColor?: Color;
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
  isCharacter?: boolean;
};

export const defaultOptions: Options = {
  color: "black",
  backgroundColor: "transparent",
  rotation: 0,
  mirror: { x: 1, y: 1 },
  scale: { x: 1, y: 1 },
  isCharacter: false
};

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  textImages = letterPatterns.map(lp => createLetterImages(lp));
  characterImages = range(64).map(() => undefined);
  cachedImages = {};
}

export function defineSymbols(pattern: string[], startChar: string) {
  const index = startChar.charCodeAt(0) - 0x21;
  pattern.forEach((p, i) => {
    characterImages[index + i] = createLetterImages(p);
  });
}

export function enableCache() {
  isCacheEnabled = true;
}

export function print(
  _str: string,
  x: number,
  y: number,
  _options: Options = {}
) {
  const options: Options = { ...defaultOptions, ..._options };
  const bx = Math.floor(x);
  let str = _str;
  let px = bx;
  let py = Math.floor(y);
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "\n") {
      px = bx;
      py += letterSize * options.scale.y;
      continue;
    }
    printChar(c, px, py, options);
    px += letterSize * options.scale.x;
  }
}

export function printChar(c: string, x: number, y: number, _options: Options) {
  const cca = c.charCodeAt(0);
  if (cca < 0x20 || cca > 0x7e) {
    return;
  }
  const options: Options = { ...defaultOptions, ..._options };
  const scaledSize = {
    x: letterSize * options.scale.x,
    y: letterSize * options.scale.y
  };
  if (options.backgroundColor !== "transparent") {
    setColor(options.backgroundColor, false);
    context.fillRect(x, y, scaledSize.x, scaledSize.y);
  }
  if (cca == 0x20 || options.color === "transparent") {
    return;
  }
  const cc = cca - 0x21;
  const img = options.isCharacter ? characterImages[cc] : textImages[cc];
  const rotation = wrap(options.rotation, 0, 4);
  if (
    options.color === "black" &&
    rotation === 0 &&
    options.mirror.x === 1 &&
    options.mirror.y === 1
  ) {
    if (options.scale.x === 1 && options.scale.y === 1) {
      context.drawImage(img, x, y);
    } else {
      context.drawImage(img, x, y, scaledSize.x, scaledSize.y);
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
  if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
    letterContext.drawImage(img, 0, 0);
  } else {
    letterContext.save();
    letterContext.translate(letterSize / 2, letterSize / 2);
    letterContext.rotate((Math.PI / 2) * rotation);
    if (options.mirror.x === -1 || options.mirror.y === -1) {
      letterContext.scale(options.mirror.x, options.mirror.y);
    }
    letterContext.drawImage(img, -letterSize / 2, -letterSize / 2);
    letterContext.restore();
  }
  if (options.color !== "black") {
    letterContext.globalCompositeOperation = "source-in";
    setColor(options.color, true, letterContext);
    letterContext.fillRect(0, 0, letterSize, letterSize);
    letterContext.globalCompositeOperation = "source-over";
  }
  context.drawImage(letterCanvas, x, y, scaledSize.x, scaledSize.y);
  if (isCacheEnabled) {
    const cachedImage = document.createElement("img");
    cachedImage.src = letterCanvas.toDataURL();
    cachedImages[cacheIndex] = cachedImage;
  }
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
