title = "BALANCE";

description = `
[Slide] Move
`;

characters = [];

options = {
  theme: "shape",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 8,
};

/** @type {{x: number, vx: number, angle: number, length: number, angleVel: number}} */
let pillar;
/** @type {{pos: Vector, vel: Vector}[]} */
let coins;
let nextCoinTicks;
let coinX;
let lx;
let wind;
const minLength = 20;

function update() {
  if (!ticks) {
    pillar = { x: 50, vx: 0, angle: 0, length: 20, angleVel: 0 };
    coins = [];
    nextCoinTicks = 0;
    coinX = rnd() < 0.5 ? 20 : 80;
    lx = 50;
    wind = 0;
  }
  color("light_black");
  rect(-50, 90, 200, 10);
  color("white");
  rect(lx, 90, 1, 10);
  const o = input.pos.x - pillar.x;
  if (abs(o) < 99) {
    pillar.vx += o * 0.005;
  }
  wind += rnds(0.01);
  wind *= 0.98;
  pillar.vx -= wind;
  pillar.vx *= 0.95;
  pillar.x += pillar.vx * difficulty;
  pillar.angleVel -= pillar.vx * 0.002;
  pillar.angleVel += pillar.angle * 0.0001 * pillar.length;
  pillar.angleVel *= 1 - 0.1 * sqrt(difficulty);
  pillar.angle += pillar.angleVel * difficulty;
  const tp = vec(pillar.x, 90).addWithAngle(
    pillar.angle - PI / 2,
    pillar.length
  );
  const scr = (50 - tp.x) * 0.2;
  lx = wrap(lx + scr, -5, 105);
  pillar.x += scr;
  tp.x += scr;
  if (pillar.length < minLength) {
    end();
  }
  color("black");
  bar(pillar.x, 90, pillar.length, 3, pillar.angle - PI / 2, 0);
  color("red");
  bar(
    pillar.x,
    90,
    clamp(pillar.length, 0, minLength),
    3,
    pillar.angle - PI / 2,
    0
  );
  color("purple");
  if (box(tp, 5).isColliding.rect.light_black) {
    play("explosion");
    pillar.length /= 2;
    pillar.angleVel *= -0.5;
    if (pillar.length >= minLength) {
      pillar.angle /= 2;
    }
  }
  nextCoinTicks--;
  if (nextCoinTicks < 0) {
    coins.push({ pos: vec(coinX, -3), vel: vec(rnds(1), 0) });
    coinX = wrap(coinX + rnds(1) + scr, -20, 120);
    nextCoinTicks = 5;
  }
  color("yellow");
  remove(coins, (c) => {
    c.vel.x += wind / 2;
    c.pos.add(c.vel);
    c.pos.x += scr;
    c.vel.y += 0.03;
    c.vel.mul(0.98);
    const cl = box(c.pos, 5).isColliding.rect;
    if (cl.black || cl.red || cl.purple) {
      play(cl.purple ? "powerUp" : "coin");
      times(cl.purple ? 3 : 1, (i) => {
        addScore(ceil(pillar.length), c.pos.x, c.pos.y - i * 6);
        if (pillar.length < 64) {
          pillar.length++;
        }
      });
      return true;
    }
    if (cl.light_black) {
      return true;
    }
  });
}
