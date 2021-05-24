title = "SKY FLOOR";

description = `
[Slide] Move
`;

characters = [];

options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingParticleFront: true,
  isDrawingScoreFront: true,
  seed: 100,
};

/** @type {{pos: Vector, size: Vector}[]} */
let floors;
let nextFloorDist;
/** @type {{pos: Vector, speed: number, angle: number, ticks: number}[]} */
let fans;
/** @type {Vector[]} */
let coins;
/** @type {{pos: Vector, vel: Vector, radius: number, isOut: boolean}} */
let ball;
/** @type {{pos: Vector, width: number, angle: number }[]} */
let lines;
let nextLineDist;
/** @type {Vector} */
let scr;
let multiplier;
const ballRadius = 2;

function update() {
  if (!ticks) {
    floors = [{ pos: vec(50, 50), size: vec(80, 150) }];
    fans = [];
    coins = [];
    nextFloorDist = 0;
    ball = { pos: vec(50, 90), vel: vec(), radius: ballRadius, isOut: false };
    lines = [];
    nextLineDist = 0;
    scr = vec();
    multiplier = 1;
  }
  scr.set();
  if (ball.pos.x < 45) {
    scr.x += (45 - ball.pos.x) * 0.1;
  } else if (ball.pos.x > 55) {
    scr.x += (55 - ball.pos.x) * 0.1;
  }
  if (ball.pos.y < 80) {
    scr.y += (80 - ball.pos.y) * 0.1;
  }
  nextLineDist -= scr.y * 0.2;
  if (nextLineDist < 0) {
    lines.push({
      pos: vec(rnd(99), -20),
      width: rnd(5, 20),
      angle: rnd() < 0.1 ? rnd(PI * 2) : (rndi(2) * PI) / 2,
    });
    nextLineDist += rnd(5, 10);
  }
  color("light_yellow");
  remove(lines, (l) => {
    l.pos.x += scr.x * 0.2;
    l.pos.y += scr.y * 0.2;
    bar(l.pos, l.width, 1, l.angle);
    return l.pos.y > 110;
  });
  nextFloorDist -= scr.y;
  if (nextFloorDist < 0) {
    const lf = floors[floors.length - 1];
    let x, w;
    for (let i = 0; i < 9; i++) {
      x = rnd(99);
      w = rnd(30, 80);
      if (abs(x - lf.pos.x) < (w + lf.size.x) / 2) {
        break;
      } else {
        x = lf.pos.x;
        w = lf.size.x;
      }
    }
    const h = rnd(30, 99);
    floors.push({ pos: vec(x, -h / 2 - 20), size: vec(w, h) });
    times(rndi(ceil(h / 30)), () => {
      const wy = rndi(2) * 2 - 1;
      fans.push({
        pos: vec(x + rnd(w * 0.6, w * 0.7) * wy, -h / 2 - 20 + rnds(h * 0.4)),
        speed: rnd(1, 2),
        angle: (wy === -1 ? 0 : PI) + rnds(PI / 8),
        ticks: 0,
      });
    });
    const cc = rndi(ceil(h / 10));
    let cy = rnds(h * 0.5) - (cc * 10) / 2;
    const cx = x + rnds(w * 0.2);
    times(cc, () => {
      if (cy > -h * 0.3 && cy < h * 0.3) {
        coins.push(vec(cx, cy - h / 2 - 20));
      }
      cy += 10;
    });
    nextFloorDist = rnd(h * 0.6, h * 0.8);
  }
  color("light_blue");
  remove(floors, (f) => {
    f.pos.add(scr);
    box(f.pos, f.size);
    return f.pos.y - f.size.y / 2 > 99;
  });
  color("black");
  remove(fans, (f) => {
    f.ticks += f.speed * f.speed;
    f.pos.add(scr);
    const oa = abs(wrap(f.pos.angleTo(ball.pos) - f.angle, -PI, PI));
    const d = f.pos.distanceTo(ball.pos) + 1;
    const fr = ((f.speed * clamp(PI / 4 - oa, 0, PI / 4)) / d) * 3;
    ball.vel.addWithAngle(f.angle, fr);
    box(vec(f.pos).addWithAngle(f.angle + PI, 5), 3);
    const c = bar(f.pos, cos(f.ticks * 0.1) * 9, 3, f.angle + PI / 2)
      .isColliding.rect;
    if (f.pos.y < -9 && (c.light_blue || c.black)) {
      return true;
    }
    particle(f.pos, f.speed * 0.2, f.speed * f.speed, f.angle, PI / 4);
    return f.pos.y > 105;
  });
  const o = input.pos.x - ball.pos.x;
  ball.vel.x += o * o * 0.0001 * (o < 0 ? -1 : 1);
  ball.vel.y -= 0.1;
  ball.vel.mul(0.95);
  ball.vel.y *= 1 - clamp(0.03 * sqrt(abs(o)), 0, 0.5);
  ball.pos.x += ball.vel.x * sqrt(difficulty);
  ball.pos.y += ball.vel.y * sqrt(difficulty);
  ball.pos.add(scr);
  ball.pos.y -= difficulty * 0.1;
  color("red");
  if (arc(ball.pos, ball.radius, 3).isColliding.rect.light_blue) {
    ball.isOut = false;
    ball.radius += (ballRadius - ball.radius) * 0.1;
  } else {
    play("hit");
    if (!ball.isOut) {
      ball.vel.x /= 2;
      ball.isOut = true;
    }
    ball.radius *= 0.925;
    if (ball.radius < 0.1) {
      play("explosion");
      end();
    }
  }
  color("blue");
  arc(ball.pos, 0.1, 3);
  color("yellow");
  remove(coins, (c) => {
    c.add(scr);
    if (box(c, 8).isColliding.rect.red) {
      play("coin");
      addScore(multiplier, c);
      particle(c);
      multiplier++;
      return true;
    }
    if (c.y > 105) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
}
