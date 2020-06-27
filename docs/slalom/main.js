title = "SLALOM";

description = `
[Hold] Turn
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 14,
  theme: "pixel",
};

let walls;
let wallSide;
let wallAppDist;
let scrolling;
let pos;
let vel;
let angle;
let minDist;
let targetWall;
let rocks;
let rockAppDist;

function update() {
  if (!ticks) {
    walls = [];
    wallSide = 1;
    wallAppDist = 0;
    scrolling = 0;
    pos = vec(90, 90);
    angle = (-PI / 4) * 3;
    vel = vec(1).rotate(angle);
    minDist = 99;
    targetWall = undefined;
    rocks = [];
    rockAppDist = 0;
  }
  rockAppDist -= scrolling;
  if (rockAppDist < 0) {
    const x = rnd() < 0.5 ? rndi(-5, 5) : rndi(95, 105);
    rocks.push({ p: vec(x, -9), s: vec(rndi(9, 19), rndi(5, 9) * 2) });
    rockAppDist += 10;
  }
  color("purple");
  rocks = rocks.filter((r) => {
    r.p.y += scrolling;
    box(r.p, r.s);
    return r.p.y < 109;
  });
  wallAppDist -= scrolling;
  if (wallAppDist < 0) {
    play("select");
    walls.push({ y: -5, side: wallSide, length: rndi(40, 60) });
    wallSide *= -1;
    wallAppDist += rndi(80, 90);
  }
  color("red");
  let tw = undefined;
  walls = walls.filter((w) => {
    w.y += scrolling;
    box(w.side === 1 ? 99 - w.length / 2 : w.length / 2, w.y, w.length, 4);
    if (tw == null && w.y < pos.y + 9) {
      tw = w;
    }
    return w.y < 105;
  });
  if (tw !== targetWall) {
    targetWall = tw;
    const s = floor(100 / (sqrt(minDist) + 1)) - 15;
    if (s > 0) {
      play("coin");
      addScore(s, pos);
    }
    minDist = 99;
  }
  color("black");
  if (input.isPressed) {
    angle += (targetWall || { side: 0 }).side * 0.07 * difficulty;
    particle(pos, 1, vel.length, angle + PI, 0.2);
  }
  vel.mul(1 - 0.02 / difficulty).add(vec(0.03).rotate(angle));
  pos.add(vel);
  scrolling = 0;
  if (pos.y < 88) {
    scrolling += (88 - pos.y) * 0.5;
  }
  pos.y += scrolling;
  bar(vec(pos).add(vec(2, 2).rotate(angle)), 1, 2, angle);
  bar(vec(pos).add(vec(-2, 2).rotate(angle)), 1, 2, angle);
  bar(vec(pos).add(vec(2, -2).rotate(angle)), 1, 2, angle);
  bar(vec(pos).add(vec(-2, -2).rotate(angle)), 1, 2, angle);
  color("blue");
  const pc = bar(pos, 4, 3, angle).isColliding.rect;
  if (pc.red || pc.purple || !pos.isInRect(0, 0, 99, 99)) {
    play("explosion");
    end();
  }
  const w = targetWall || { y: 0, length: 0, side: 1 };
  const wp = vec(w.side === 1 ? 99 - w.length : w.length, w.y);
  const d = wp.distanceTo(pos);
  if (d < minDist) {
    minDist = d;
  }
}
