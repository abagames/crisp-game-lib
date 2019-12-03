import * as view from "./view";
import { currentColor, Color } from "./color";
import { Vector } from "./vector";

type Rect = { pos: VectorLike; size: VectorLike; color: Color };
let rects: Rect[];
let tmpRects: Rect[];

type Collision = {
  rect?: {
    transparent?: boolean;
    black?: boolean;
    red?: boolean;
    blue?: boolean;
    green?: boolean;
    purple?: boolean;
    cyan?: boolean;
    white?: boolean;
    dark_red?: boolean;
    dark_blue?: boolean;
    dark_green?: boolean;
    dark_purple?: boolean;
    dark_cyan?: boolean;
    dark_white?: boolean;
  };
};

export function update() {
  rects = [];
  tmpRects = [];
}

export function rect(
  x: number | VectorLike,
  y: number | VectorLike,
  width?: number | VectorLike,
  height?: number
) {
  return drawRect(false, x, y, width, height);
}

export function box(
  x: number | VectorLike,
  y: number | VectorLike,
  width?: number | VectorLike,
  height?: number
) {
  return drawRect(true, x, y, width, height);
}

export function bar(
  x: number | VectorLike,
  y: number,
  length: number,
  thickness: number,
  rotate = 0.5,
  centerPosRatio = 0.5
) {
  if (typeof x !== "number") {
    centerPosRatio = rotate;
    rotate = thickness;
    thickness = length;
    length = y;
    y = x.y;
    x = x.x;
  }
  const l = new Vector(length).rotate(rotate);
  const p = new Vector(x - l.x * centerPosRatio, y - l.y * centerPosRatio);
  return drawLine(p, l, thickness);
}

export function line(
  x1: number | VectorLike,
  y1: number | VectorLike,
  x2: number | VectorLike = 3,
  y2: number = 3,
  thickness: number = 3
) {
  const p = new Vector();
  const p2 = new Vector();
  if (typeof x1 === "number") {
    if (typeof y1 === "number") {
      if (typeof x2 === "number") {
        p.set(x1, y1);
        p2.set(x2, y2);
      } else {
        p.set(x1, y1);
        p2.set(x2);
        thickness = y1;
      }
    } else {
      throw "invalid params";
    }
  } else {
    if (typeof y1 === "number") {
      if (typeof x2 === "number") {
        p.set(x1);
        p2.set(y1, x2);
        thickness = y2;
      } else {
        throw "invalid params";
      }
    } else {
      if (typeof x2 === "number") {
        p.set(x1);
        p2.set(y1);
        thickness = x2;
      } else {
        throw "invalid params";
      }
    }
  }
  return drawLine(p, p2.sub(p), thickness);
}

function drawRect(
  isAlignCenter: boolean,
  x: number | VectorLike,
  y: number | VectorLike,
  width?: number | VectorLike,
  height?: number
) {
  if (typeof x === "number") {
    if (typeof y === "number") {
      if (typeof width === "number") {
        return addRect(isAlignCenter, x, y, width, height);
      } else {
        return addRect(isAlignCenter, x, y, width.x, width.y);
      }
    } else {
      throw "invalid params";
    }
  } else {
    if (typeof y === "number") {
      if (typeof width === "number") {
        return addRect(isAlignCenter, x.x, x.y, y, width);
      } else {
        throw "invalid params";
      }
    } else {
      return addRect(isAlignCenter, x.x, x.y, y.x, y.y);
    }
  }
}

function drawLine(p: Vector, l: Vector, thickness: number) {
  const t = Math.floor(clamp(thickness, 3, 10));
  const lx = Math.abs(l.x);
  const ly = Math.abs(l.y);
  const rn = clamp(Math.ceil(lx > ly ? lx / t : ly / t) + 1, 3, 99);
  l.div(rn - 1);
  let collision: Collision = { rect: {} };
  for (let i = 0; i < rn; i++) {
    collision = Object.assign(
      collision,
      addRect(true, p.x, p.y, thickness, thickness, true)
    );
    p.add(l);
  }
  concatTmpRects();
  return collision;
}

function addRect(
  isAlignCenter: boolean,
  x: number,
  y: number,
  width: number,
  height: number,
  isAddingToTmp = false
) {
  let pos = isAlignCenter
    ? { x: Math.floor(x - width / 2), y: Math.floor(y - height / 2) }
    : { x: Math.floor(x), y: Math.floor(y) };
  const size = { x: Math.floor(width), y: Math.floor(height) };
  let rect = { pos, size, color: currentColor };
  const collision = checkRects(rect);
  if (currentColor !== "transparent") {
    (isAddingToTmp ? tmpRects : rects).push(rect);
    view.context.fillRect(pos.x, pos.y, size.x, size.y);
  }
  return collision;
}

function concatTmpRects() {
  rects = rects.concat(tmpRects);
  tmpRects = [];
}

function checkRects(rect: Rect) {
  const collision: Collision = { rect: {} };
  rects.forEach(r => {
    if (testCollision(rect, r)) {
      collision.rect[r.color] = true;
    }
  });
  return collision;
}

function testCollision(r1: Rect, r2: Rect) {
  const ox = r2.pos.x - r1.pos.x;
  const oy = r2.pos.y - r1.pos.y;
  return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
}
