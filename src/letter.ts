import { textPatterns } from "./textPattern";
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
  color?: Color;
  backgroundColor?: Color;
  /** A value from 0 to 3 that defines the direction of character rotation. */
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
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
const dotSize = 1;
export const letterSize = dotCount * dotSize;

export type LetterImage = {
  image: HTMLImageElement | HTMLCanvasElement;
  texture?; //: PIXI.Texture;
  hitBox: HitBox;
};

let textImages: LetterImage[];
let characterImages: LetterImage[];
let cachedImages: { [key: string]: LetterImage };
let isCacheEnabled = false;
let letterCanvas: HTMLCanvasElement;
let letterContext: CanvasRenderingContext2D;
let scaledLetterCanvas: HTMLCanvasElement;
let scaledLetterContext: CanvasRenderingContext2D;

export type Options = {
  color?: Color;
  backgroundColor?: Color;
  rotation?: number;
  mirror?: { x?: 1 | -1; y?: 1 | -1 };
  scale?: { x?: number; y?: number };
  isCharacter?: boolean;
  isCheckingCollision?: boolean;
};

export const defaultOptions: Options = {
  color: "black",
  backgroundColor: "transparent",
  rotation: 0,
  mirror: { x: 1, y: 1 },
  scale: { x: 1, y: 1 },
  isCharacter: false,
  isCheckingCollision: false,
};

export function init() {
  letterCanvas = document.createElement("canvas");
  letterCanvas.width = letterCanvas.height = letterSize;
  letterContext = letterCanvas.getContext("2d");
  scaledLetterCanvas = document.createElement("canvas");
  scaledLetterContext = scaledLetterCanvas.getContext("2d");
  textImages = textPatterns.map((lp, i) => {
    return {
      ...createLetterImages(lp),
      hitBox: getHitBox(String.fromCharCode(0x21 + i), false),
    };
  });
  characterImages = textPatterns.map((lp, i) => {
    return {
      ...createLetterImages(lp),
      hitBox: getHitBox(String.fromCharCode(0x21 + i), true),
    };
  });
  cachedImages = {};
}

export function defineCharacters(pattern: string[], startLetter: string) {
  const index = startLetter.charCodeAt(0) - 0x21;
  pattern.forEach((lp, i) => {
    characterImages[index + i] = {
      ...createLetterImages(lp),
      hitBox: getHitBox(String.fromCharCode(0x21 + index + i), true),
    };
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
  x -= (letterSize / 2) * options.scale.x;
  y -= (letterSize / 2) * options.scale.y;
  const bx = Math.floor(x);
  let str = _str;
  let px = bx;
  let py = Math.floor(y);
  let collision: Collision = { isColliding: { rect: {}, text: {}, char: {} } };
  for (let i = 0; i < str.length; i++) {
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
    px += letterSize * options.scale.x;
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
    saveCurrentColor();
    setColor(options.backgroundColor);
    fillRect(x, y, letterSize * options.scale.x, letterSize * options.scale.y);
    loadCurrentColor();
  }
  if (cca <= 0x20) {
    return { isColliding: { rect: {}, text: {}, char: {} } };
  }
  const cc = cca - 0x21;
  const li = options.isCharacter ? characterImages[cc] : textImages[cc];
  const rotation = wrap(options.rotation, 0, 4);
  if (
    options.color === "black" &&
    rotation === 0 &&
    options.mirror.x === 1 &&
    options.mirror.y === 1 &&
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
  if (theme.isUsingPixi && (options.scale.x !== 1 || options.scale.y !== 1)) {
    scaledLetterCanvas.width = letterSize * options.scale.x;
    scaledLetterCanvas.height = letterSize * options.scale.y;
    scaledLetterContext.imageSmoothingEnabled = false;
    scaledLetterContext.scale(options.scale.x, options.scale.y);
    createLatterContext(scaledLetterContext, rotation, options, li);
    isUsingScaled = true;
  }
  letterContext.clearRect(0, 0, letterSize, letterSize);
  createLatterContext(letterContext, rotation, options, li);
  const hitBox = getHitBox(c, options.isCharacter);
  let texture; //: PIXI.Texture;
  if (isCacheEnabled || theme.isUsingPixi) {
    const cachedImage = document.createElement("img");
    cachedImage.src = letterCanvas.toDataURL();
    if (theme.isUsingPixi) {
      const textureImage = document.createElement("img");
      textureImage.src = (
        isUsingScaled ? scaledLetterCanvas : letterCanvas
      ).toDataURL();
      texture = PIXI.Texture.from(textureImage);
    }
    if (isCacheEnabled) {
      cachedImages[cacheIndex] = {
        image: cachedImage,
        texture,
        hitBox,
      };
    }
  }
  return drawAndTestLetterImage(
    { image: letterCanvas, texture, hitBox },
    x,
    y,
    options.scale as VectorLike,
    options.isCheckingCollision,
    options.color !== "transparent"
  );
}

function createLatterContext(
  context: CanvasRenderingContext2D,
  rotation,
  options,
  li
) {
  if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
    context.drawImage(li.image, 0, 0);
  } else {
    context.save();
    context.translate(letterSize / 2, letterSize / 2);
    context.rotate((Math.PI / 2) * rotation);
    if (options.mirror.x === -1 || options.mirror.y === -1) {
      context.scale(options.mirror.x, options.mirror.y);
    }
    context.drawImage(li.image, -letterSize / 2, -letterSize / 2);
    context.restore();
  }
  if (options.color !== "black") {
    context.globalCompositeOperation = "source-in";
    context.fillStyle = colorToStyle(
      options.color === "transparent" ? "black" : options.color
    );
    context.fillRect(0, 0, letterSize, letterSize);
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
      drawLetterImage(li, x, y, letterSize * scale.x, letterSize * scale.y);
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
  p.forEach((l) => {
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
        letterContext.fillStyle = colorToStyle(colors[ci]);
        letterContext.fillRect(
          (x + xPadding) * dotSize,
          (y + yPadding) * dotSize,
          dotSize,
          dotSize
        );
      }
    }
  });
  const image = document.createElement("img");
  image.src = letterCanvas.toDataURL();
  if (theme.isUsingPixi) {
    return { image, texture: PIXI.Texture.from(image) };
  }
  return { image };
}

function getHitBox(c: string, isCharacter: boolean) {
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
  const d = letterContext.getImageData(0, 0, letterSize, letterSize).data;
  let i = 0;
  for (let y = 0; y < letterSize; y++) {
    for (let x = 0; x < letterSize; x++) {
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
  for (let y = 0; y < letterSize; y++) {
    for (let x = 0; x < letterSize; x++) {
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
