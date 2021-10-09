import { clamp, isInRange, wrap } from "./util";

export interface VectorLike {
  x: number;
  y: number;
}

function isVectorLike(v: any): v is VectorLike {
  return v.x != null && v.y != null;
}

export class Vector {
  x = 0;
  y = 0;

  constructor(x?: number | VectorLike, y?: number) {
    this.set(x, y);
  }

  set(x: number | VectorLike = 0, y: number = 0) {
    if (isVectorLike(x)) {
      this.x = x.x;
      this.y = x.y;
      return this;
    }
    this.x = x;
    this.y = y;
    return this;
  }

  add(x: number | VectorLike, y?: number) {
    if (isVectorLike(x)) {
      this.x += x.x;
      this.y += x.y;
      return this;
    }
    this.x += x;
    this.y += y;
    return this;
  }

  sub(x: number | VectorLike, y?: number) {
    if (isVectorLike(x)) {
      this.x -= x.x;
      this.y -= x.y;
      return this;
    }
    this.x -= x;
    this.y -= y;
    return this;
  }

  mul(v: number) {
    this.x *= v;
    this.y *= v;
    return this;
  }

  div(v: number) {
    this.x /= v;
    this.y /= v;
    return this;
  }

  clamp(xLow: number, xHigh: number, yLow: number, yHigh: number) {
    this.x = clamp(this.x, xLow, xHigh);
    this.y = clamp(this.y, yLow, yHigh);
    return this;
  }

  wrap(xLow: number, xHigh: number, yLow: number, yHigh: number) {
    this.x = wrap(this.x, xLow, xHigh);
    this.y = wrap(this.y, yLow, yHigh);
    return this;
  }

  addWithAngle(angle: number, length: number) {
    this.x += Math.cos(angle) * length;
    this.y += Math.sin(angle) * length;
    return this;
  }

  swapXy() {
    const t = this.x;
    this.x = this.y;
    this.y = t;
    return this;
  }

  normalize() {
    this.div(this.length);
    return this;
  }

  rotate(angle: number) {
    if (angle === 0) {
      return this;
    }
    const tx = this.x;
    this.x = tx * Math.cos(angle) - this.y * Math.sin(angle);
    this.y = tx * Math.sin(angle) + this.y * Math.cos(angle);
    return this;
  }

  angleTo(x: number | VectorLike, y?: number) {
    if (isVectorLike(x)) {
      return Math.atan2(x.y - this.y, x.x - this.x);
    } else {
      return Math.atan2(y - this.y, x - this.x);
    }
  }

  distanceTo(x: number | VectorLike, y?: number) {
    let ox: number;
    let oy: number;
    if (isVectorLike(x)) {
      ox = x.x - this.x;
      oy = x.y - this.y;
    } else {
      ox = x - this.x;
      oy = y - this.y;
    }
    return Math.sqrt(ox * ox + oy * oy);
  }

  isInRect(x: number, y: number, width: number, height: number) {
    return isInRange(this.x, x, x + width) && isInRange(this.y, y, y + height);
  }

  equals(other: VectorLike) {
    return this.x === other.x && this.y === other.y;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get angle() {
    return Math.atan2(this.y, this.x);
  }
}
