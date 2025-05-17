import { textPatterns } from "./textPattern";
import { smallTextPatterns } from "./textPatternSmall";
import {
  fillRect,
  setColor,
  currentColor,
  saveCurrentColor,
  loadCurrentColor,
  theme,
  beginFillColor,
  endFill,
  context,
  graphics,
} from "./view";
import {
  Color,
  colorChars,
  colors,
  colorToStyle,
  colorToNumber,
} from "./color";
import { Vector, VectorLike } from "./vector";
import { HitBox, hitBoxes, checkHitBoxes, Collision } from "./collision";
import { wrap } from "./util";
declare const PIXI;

/**
 * Options for drawing text and characters.
 */
export type LetterOptions = {
  color?: Color | number;
  backgroundColor?: Color | number;
  /** A value from 0 to 3 that defines the direction of character rotation. */
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
  isSmallText?: boolean;
  edgeColor?: Color | number;
};

/**
 * Draw a text.
 * @param str
 * @param x
 * @param y
 * @param options
 * @returns Information about objects that collided during drawing.
 */
export function text(
  str: string,
  x: number | VectorLike,
  y?: number | LetterOptions,
  options?: LetterOptions
) {
  return letters(false, str, x, y, options);
}

/**
 * Draw a pixel art.
 *
 * You can define pixel arts (6x6 dots) of characters with `characters` array.
 * Each letter represents a pixel color
 * ( *l: black, r: red, g: green, b: blue, y: yellow, p: purple, c: cyan,
 *  L: light_black, R: light_red, G: light_green, B: light_blue, Y: light_yellow,
 *  P: light_purple, C: light_cyan* ).
 * ```js
 * characters = [
 * `
 *  r rr
 * rrrrrr
 *  grr
 *  grr
 * rrrrrr
 * r rr
 * `,
 * ```
 * Pixel arts are assigned from 'a'. `char("a", 0, 0)` draws the character
 * defined by the first element of the `characters` array.
 *
 * `characters` array can also specify external image files as corresponding pixel art.
 * ```js
 * characters = [
 * "./jugglingchain/images/background.png",
 * "./jugglingchain/images/ball.png",
 * "./jugglingchain/images/arrow.png",
 * ]
 * ```
 *
 * @param str
 * @param x
 * @param y
 * @param options
 * @returns Information about objects that collided during drawing.
 */
export function char(
  str: string,
  x: number,
  y: number,
  options?: LetterOptions
) {
  return letters(true, str, x, y, options);
}

export function letters(
  isCharacter: boolean,
  str: string,
  x: number | VectorLike,
  y?: number | LetterOptions,
  options?: LetterOptions
) {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return print(str, x, y, {
        isCharacter,
        isCheckingCollision: true,
        color: currentColor,
        ...options,
      });
    } else {
      throw "invalid params";
    }
  } else {
    return print(str, x.x, x.y, {
      isCharacter,
      isCheckingCollision: true,
      color: currentColor,
      ...(y as LetterOptions),
    });
  }
}

const dotCount = 6;
const smallLetterDotCount = 4;
const dotSize = 1;
export const letterSize = dotCount * dotSize;
export const smallLetterWidth = smallLetterDotCount * dotSize;

export type LetterImage = {
  image: HTMLImageElement | HTMLCanvasElement;
  texture?; //: PIXI.Texture;
  hitBox: HitBox;
  size: Vector;
};

let textImages: LetterImage[];
let smallTextImages: LetterImage[];
let characterImages: LetterImage[];
let cachedImages: { [key: string]: LetterImage };
let isCacheEnabled = false;
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;
let scaledLetterCanvas: HTMLCanvasElement;
let scaledLetterContext: CanvasRenderingContext2D;

export type Options = {
  color?: Color | number;
  backgroundColor?: Color | number;
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
  isSmallText?: boolean;
  edgeColor?: Color | number;
  isCharacter?: boolean;
  isCheckingCollision?: boolean;
};

export const defaultOptions: Options = {
  color: "black",
  backgroundColor: "transparent",
  rotation: 0,
  mirror: { x: 1, y: 1 },
  scale: { x: 1, y: 1 },
  isSmallText: false,
  edgeColor: undefined,
  isCharacter: false,
  isCheckingCollision: false,
};

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  scaledLetterCanvas = document.createElement("canvas");
  scaledLetterContext = scaledLetterCanvas.getContext("2d");
  textImages = textPatterns.map((lp, i) =>
    createLetterImage(lp, String.fromCharCode(0x21 + i), false)
  );
  smallTextImages = smallTextPatterns.map((lp, i) =>
    createLetterImage(lp, String.fromCharCode(0x21 + i), false)
  );
  characterImages = textPatterns.map((lp, i) =>
    createLetterImage(lp, String.fromCharCode(0x21 + i), true)
  );
  cachedImages = {};
}

export function defineCharacters(pattern: string[], startLetter: string) {
  const index = startLetter.charCodeAt(0) - 0x21;
  pattern.forEach((lp, i) => {
    characterImages[index + i] = createLetterImage(
      lp,
      String.fromCharCode(0x21 + index + i),
      true
    );
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
): Collision {
  const options = mergeDefaultOptions(_options);
  let str = _str;
  let px = x;
  let py = y;
  let bx;
  let collision: Collision = { isColliding: { rect: {}, text: {}, char: {} } };
  const lw = options.isSmallText ? smallLetterWidth : letterSize;
  for (let i = 0; i < str.length; i++) {
    if (i === 0) {
      const cca = str.charCodeAt(0);
      if (cca < 0x21 || cca > 0x7e) {
        px = Math.floor(px - (letterSize / 2) * options.scale.x);
        py = Math.floor(py - (letterSize / 2) * options.scale.y);
      } else {
        const cc = cca - 0x21;
        const li = options.isCharacter
          ? characterImages[cc]
          : options.isSmallText
          ? smallTextImages[cc]
          : textImages[cc];
        px = Math.floor(px - (li.size.x / 2) * options.scale.x);
        py = Math.floor(py - (li.size.y / 2) * options.scale.y);
      }
      bx = px;
    }
    const c = str[i];
    if (c === "\n") {
      px = bx;
      py += letterSize * options.scale.y;
      continue;
    }
    const charCollision = printChar(c, px, py, options);
    if (options.isCheckingCollision) {
      collision = {
        isColliding: {
          rect: {
            ...collision.isColliding.rect,
            ...charCollision.isColliding.rect,
          },
          text: {
            ...collision.isColliding.text,
            ...charCollision.isColliding.text,
          },
          char: {
            ...collision.isColliding.char,
            ...charCollision.isColliding.char,
          },
        },
      };
    }
    px += lw * options.scale.x;
  }
  return collision;
}

export function printChar(
  c: string,
  x: number,
  y: number,
  _options: Options
): Collision {
  const cca = c.charCodeAt(0);
  if (cca < 0x20 || cca > 0x7e) {
    return { isColliding: { rect: {}, text: {}, char: {} } };
  }
  const options = mergeDefaultOptions(_options);
  if (options.backgroundColor !== "transparent") {
    const lw = options.isSmallText ? smallLetterWidth : letterSize;
    const xp = options.isSmallText ? 2 : 1;
    saveCurrentColor();
    setColor(options.backgroundColor);
    fillRect(x + xp, y, lw * options.scale.x, letterSize * options.scale.y);
    loadCurrentColor();
  }
  if (cca <= 0x20) {
    return { isColliding: { rect: {}, text: {}, char: {} } };
  }
  const cc = cca - 0x21;
  const li = options.isCharacter
    ? characterImages[cc]
    : options.isSmallText
    ? smallTextImages[cc]
    : textImages[cc];
  const rotation = wrap(options.rotation, 0, 4);
  if (
    options.color === "black" &&
    rotation === 0 &&
    options.mirror.x === 1 &&
    options.mirror.y === 1 &&
    options.edgeColor == null &&
    (!theme.isUsingPixi || (options.scale.x === 1 && options.scale.y === 1))
  ) {
    return drawAndTestLetterImage(
      li,
      x,
      y,
      options.scale as VectorLike,
      options.isCheckingCollision,
      true
    );
  }
  const cacheIndex = JSON.stringify({ c, options });
  const ci = cachedImages[cacheIndex];
  if (ci != null) {
    return drawAndTestLetterImage(
      ci,
      x,
      y,
      options.scale as VectorLike,
      options.isCheckingCollision,
      options.color !== "transparent"
    );
  }
  let isUsingScaled = false;
  const size = new Vector(letterSize, letterSize);
  let canvas: HTMLCanvasElement = letterCanvas;
  let context: CanvasRenderingContext2D = letterContext;
  if (li.size.x > letterSize || li.size.y > letterSize) {
    if (rotation === 0 || rotation === 2) {
      size.set(li.size.x, li.size.y);
    } else {
      const ms = Math.max(li.size.x, li.size.y);
      size.set(ms, ms);
    }
    canvas = document.createElement("canvas");
    canvas.width = size.x;
    canvas.height = size.y;
    context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
  }
  if (theme.isUsingPixi && (options.scale.x !== 1 || options.scale.y !== 1)) {
    scaledLetterCanvas.width = size.x * options.scale.x;
    scaledLetterCanvas.height = size.y * options.scale.y;
    scaledLetterContext.imageSmoothingEnabled = false;
    scaledLetterContext.scale(options.scale.x, options.scale.y);
    createLetterContext(scaledLetterContext, rotation, options, li.image, size);
    isUsingScaled = true;
  }
  context.clearRect(0, 0, size.x, size.y);
  createLetterContext(context, rotation, options, li.image, size);
  const hitBox = getHitBox(context, size, c, options.isCharacter);
  if (options.edgeColor != null) {
    canvas = addEdge(context, size, options.edgeColor);
    size.x += 2;
    size.y += 2;
  }
  let texture; //: PIXI.Texture;
  if (isCacheEnabled || theme.isUsingPixi) {
    const cachedImage = document.createElement("img");
    cachedImage.src = canvas.toDataURL();
    if (theme.isUsingPixi) {
      const textureImage = document.createElement("img");
      textureImage.src = (
        isUsingScaled ? scaledLetterCanvas : canvas
      ).toDataURL();
      texture = PIXI.Texture.from(textureImage);
    }
    if (isCacheEnabled) {
      cachedImages[cacheIndex] = {
        image: cachedImage,
        texture,
        hitBox,
        size,
      };
    }
  }
  return drawAndTestLetterImage(
    { image: canvas, texture, hitBox, size },
    x,
    y,
    options.scale as VectorLike,
    options.isCheckingCollision,
    options.color !== "transparent"
  );
}

function addEdge(
  context: CanvasRenderingContext2D,
  size: VectorLike,
  color: Color | number
) {
  const newWidth = size.x + 2;
  const newHeight = size.y + 2;
  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = newWidth;
  edgeCanvas.height = newHeight;
  const edgeContext = edgeCanvas.getContext("2d");
  edgeContext.imageSmoothingEnabled = false;

  edgeContext.drawImage(context.canvas, 1, 1);
  const imageData = edgeContext.getImageData(0, 0, newWidth, newHeight);
  const data = imageData.data;
  edgeContext.fillStyle = colorToStyle(color);
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const idx = (y * newWidth + x) * 4;
      if (data[idx + 3] === 0) {
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < newWidth && ny >= 0 && ny < newHeight) {
            const neighborIdx = (ny * newWidth + nx) * 4;
            if (data[neighborIdx + 3] > 0) {
              edgeContext.fillRect(x, y, 1, 1);
              break;
            }
          }
        }
      }
    }
  }
  return edgeCanvas;
}

function createLetterContext(
  context: CanvasRenderingContext2D,
  rotation,
  options,
  image: HTMLImageElement | HTMLCanvasElement,
  size: Vector
) {
  if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
    context.drawImage(image, 0, 0);
  } else {
    context.save();
    context.translate(size.x / 2, size.y / 2);
    context.rotate((Math.PI / 2) * rotation);
    if (options.mirror.x === -1 || options.mirror.y === -1) {
      context.scale(options.mirror.x, options.mirror.y);
    }
    context.drawImage(image, -size.x / 2, -size.y / 2);
    context.restore();
  }
  if (options.color !== "black") {
    context.globalCompositeOperation = "source-in";
    context.fillStyle = colorToStyle(
      options.color === "transparent" ? "black" : options.color
    );
    context.fillRect(0, 0, size.x, size.y);
    context.globalCompositeOperation = "source-over";
  }
}

function drawAndTestLetterImage(
  li: LetterImage,
  x: number,
  y: number,
  scale: VectorLike,
  isCheckCollision: boolean,
  isDrawing: boolean
) {
  if (isDrawing) {
    if (scale.x === 1 && scale.y === 1) {
      drawLetterImage(li, x, y);
    } else {
      drawLetterImage(li, x, y, li.size.x * scale.x, li.size.y * scale.y);
    }
  }
  if (!isCheckCollision) {
    return;
  }
  const hitBox = {
    pos: { x: x + li.hitBox.pos.x * scale.x, y: y + li.hitBox.pos.y * scale.y },
    size: {
      x: li.hitBox.size.x * scale.x,
      y: li.hitBox.size.y * scale.y,
    },
    collision: li.hitBox.collision,
  };
  const collision = checkHitBoxes(hitBox);
  if (isDrawing) {
    hitBoxes.push(hitBox);
  }
  return collision;
}

function drawLetterImage(
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
      width == null ? li.size.x : width,
      height == null ? li.size.y : height
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

function createLetterImage(
  pattern: string,
  c: string,
  isCharacter: boolean
): LetterImage {
  if (pattern.indexOf(".") >= 0 || pattern.indexOf("data:image/") == 0) {
    return createLetterImageFromFile(pattern, c);
  }
  let p = pattern.split("\n");
  p = p.slice(1, p.length - 1);
  let pw = 0;
  p.forEach((l) => {
    pw = Math.max(l.length, pw);
  });
  const xPadding = Math.max(Math.ceil((dotCount - pw) / 2), 0);
  const ph = p.length;
  const yPadding = Math.max(Math.ceil((dotCount - ph) / 2), 0);
  const size = new Vector(
    Math.max(dotCount, pw) * dotSize,
    Math.max(dotCount, ph) * dotSize
  );
  let canvas: HTMLCanvasElement = letterCanvas;
  let context: CanvasRenderingContext2D = letterContext;
  if (size.x > letterSize || size.y > letterSize) {
    canvas = document.createElement("canvas");
    canvas.width = size.x;
    canvas.height = size.y;
    context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
  }
  context.clearRect(0, 0, size.x, size.y);
  p.forEach((l, y) => {
    for (let x = 0; x < pw; x++) {
      const c = l.charAt(x);
      let ci = colorChars.indexOf(c);
      if (c !== "" && ci >= 1) {
        context.fillStyle = colorToStyle(colors[ci]);
        context.fillRect(
          (x + xPadding) * dotSize,
          (y + yPadding) * dotSize,
          dotSize,
          dotSize
        );
      }
    }
  });
  const image = document.createElement("img");
  image.src = canvas.toDataURL();
  const hitBox = getHitBox(context, size, c, isCharacter);
  if (theme.isUsingPixi) {
    return { image, texture: PIXI.Texture.from(image), size, hitBox };
  }
  return { image, size, hitBox };
}

function createLetterImageFromFile(pattern: string, c: string) {
  const image = document.createElement("img");
  image.src = pattern;
  const size = new Vector();
  const hitBox = {
    pos: new Vector(),
    size: new Vector(),
    collision: { isColliding: { char: {}, text: {} } },
  };
  let result;
  if (theme.isUsingPixi) {
    result = {
      image,
      texture: PIXI.Texture.from(image),
      size: new Vector(),
      hitBox,
    };
  } else {
    result = { image, size, hitBox };
  }
  image.onload = () => {
    result.size.set(image.width * dotSize, image.height * dotSize);
    const canvas = document.createElement("canvas");
    canvas.width = result.size.x;
    canvas.height = result.size.y;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, result.size.x, result.size.y);
    const canvasImage = document.createElement("img");
    canvasImage.src = canvas.toDataURL();
    result.image = canvasImage;
    result.hitBox = getHitBox(context, result.size, c, true);
    if (theme.isUsingPixi) {
      result.texture = PIXI.Texture.from(canvasImage);
    }
  };
  return result;
}

function getHitBox(
  context: CanvasRenderingContext2D,
  size: VectorLike,
  c: string,
  isCharacter: boolean
) {
  const b: HitBox = {
    pos: new Vector(letterSize, letterSize),
    size: new Vector(),
    collision: { isColliding: { char: {}, text: {} } },
  };
  if (isCharacter) {
    b.collision.isColliding.char[c] = true;
  } else {
    b.collision.isColliding.text[c] = true;
  }
  const d = context.getImageData(0, 0, size.x, size.y).data;
  let i = 0;
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      if (d[i + 3] > 0) {
        if (x < b.pos.x) {
          b.pos.x = x;
        }
        if (y < b.pos.y) {
          b.pos.y = y;
        }
      }
      i += 4;
    }
  }
  i = 0;
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      if (d[i + 3] > 0) {
        if (x > b.pos.x + b.size.x - 1) {
          b.size.x = x - b.pos.x + 1;
        }
        if (y > b.pos.y + b.size.y - 1) {
          b.size.y = y - b.pos.y + 1;
        }
      }
      i += 4;
    }
  }
  return b;
}

function mergeDefaultOptions(_options: Options) {
  let options: Options = { ...defaultOptions, ..._options };
  if (_options.scale != null) {
    options.scale = { ...defaultOptions.scale, ..._options.scale };
  }
  if (_options.mirror != null) {
    options.mirror = { ...defaultOptions.mirror, ..._options.mirror };
  }
  return options;
}
