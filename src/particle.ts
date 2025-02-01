import { Color } from "./color";
import { Random } from "./random";
import { clamp } from "./util";
import { Vector } from "./vector";
import {
  fillRect,
  setColor,
  currentColor,
  saveCurrentColor,
  loadCurrentColor,
} from "./view";

type Particle = {
  pos: Vector;
  vel: Vector;
  color: Color | number;
  edgeColor: Color | number;
  ticks: number;
};

let particles: Particle[];
const random = new Random();

export function init() {
  particles = [];
}

export function add(
  pos: Vector,
  count = 16,
  speed = 1,
  angle = 0,
  angleWidth = Math.PI * 2,
  edgeColor: Color | number = undefined
) {
  if (count < 1) {
    if (random.get() > count) {
      return;
    }
    count = 1;
  }
  for (let i = 0; i < count; i++) {
    const a = angle + random.get(angleWidth) - angleWidth / 2;
    const p: Particle = {
      pos: new Vector(pos),
      vel: new Vector(speed * random.get(0.5, 1), 0).rotate(a),
      color: currentColor,
      ticks: clamp(random.get(10, 20) * Math.sqrt(Math.abs(speed)), 10, 60),
      edgeColor,
    };
    particles.push(p);
  }
}

export function update() {
  saveCurrentColor();
  particles = particles.filter((p) => {
    p.ticks--;
    if (p.ticks < 0) {
      return false;
    }
    p.pos.add(p.vel);
    p.vel.mul(0.98);
    const x = Math.floor(p.pos.x);
    const y = Math.floor(p.pos.y);
    if (p.edgeColor != null) {
      setColor(p.edgeColor);
      fillRect(x - 1, y - 1, 3, 3);
    }
    setColor(p.color);
    fillRect(x, y, 1, 1);
    return true;
  });
  loadCurrentColor();
}
