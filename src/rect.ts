import * as view from "./view";
import { currentColor } from "./color";
import { clamp } from "./util";
import { Vector, VectorLike } from "./vector";
import {
  HitBox,
  hitBoxes,
  tmpHitBoxes,
  checkHitBoxes,
  concatTmpHitBoxes,
  Collision
} from "./collision";

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
  let collision: Collision = { isColliding: { rect: {} } };
  for (let i = 0; i < rn; i++) {
    collision = Object.assign(
      collision,
      addRect(true, p.x, p.y, thickness, thickness, true)
    );
    p.add(l);
  }
  concatTmpHitBoxes();
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
  const box: HitBox = { pos, size, collision: { isColliding: { rect: {} } } };
  box.collision.isColliding.rect[currentColor] = true;
  const collision = checkHitBoxes(box);
  if (currentColor !== "transparent") {
    (isAddingToTmp ? tmpHitBoxes : hitBoxes).push(box);
    view.context.fillRect(pos.x, pos.y, size.x, size.y);
  }
  return collision;
}
