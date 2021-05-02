title = "THRUST LR";

description = `
[Slide] Thrust
`;

characters = [];

options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 80,
};

/** @type {{pos: Vector, vx: number, size: number}[]} */
let rects;
let nextRectDist;
/** @type {{x: number, vx: number}} */
let ship;
const shipY = 85;

function update() {
  if (!ticks) {
    rects = [];
    nextRectDist = 0;
    ship = { x: 50, vx: 0 };
    addRect(60);
    addRect(40);
    addRect(20);
  }
  const scr = difficulty * 0.2;
  nextRectDist -= scr;
  if (nextRectDist < 0) {
    const size = addRect();
    nextRectDist = rnd(10, size);
  }
  const tx = -(clamp(input.pos.x, 0, 100) - 50);
  remove(rects, (r) => {
    r.pos.y += scr;
    if (r.pos.y - r.size < shipY && r.pos.y + r.size > shipY) {
      let d = r.pos.x - ship.x;
      if (d * tx < 0) {
        r.vx -=
          (((tx / (abs(d) - (r.size - abs(r.pos.y - shipY)))) * 0.2) / r.size) *
          difficulty;
      }
      r.vx *= 0.98;
    }
    r.pos.x += r.vx;
    if (r.pos.x < -r.size || r.pos.x > 99 + r.size) {
      play("powerUp");
      addScore(floor(r.size), r.pos.x < 50 ? 10 : 90, clamp(r.pos.y, 0, 95));
      return true;
    }
    line(r.pos.x + r.size, r.pos.y, r.pos.x, r.pos.y + r.size);
    line(r.pos.x, r.pos.y + r.size, r.pos.x - r.size, r.pos.y);
    line(r.pos.x - r.size, r.pos.y, r.pos.x, r.pos.y - r.size);
    line(r.pos.x, r.pos.y - r.size, r.pos.x + r.size, r.pos.y);
    return r.pos.y - r.size * 2 > 99;
  });
  color("light_black");
  rect(50, 93, 1, 7);
  rect(50, 95, -tx, 3);
  color("black");
  ship.vx += tx * 0.001 * sqrt(difficulty);
  ship.x = clamp(ship.x + ship.vx, 4, 96);
  if ((ship.x < 5 && ship.vx < 0) || (ship.x > 95 && ship.vx > 0)) {
    ship.vx *= -0.7;
  }
  ship.vx *= 0.95;
  particle(ship.x, shipY, abs(tx) * 0.05, -tx * 0.05, 0, 0.5);
  const c1 = line(ship.x - 1, shipY - 2, ship.x - 2, shipY + 2, 2).isColliding
    .rect.black;
  const c2 = line(ship.x + 1, shipY - 2, ship.x + 2, shipY + 2, 2).isColliding
    .rect.black;
  if (c1 || c2) {
    play("explosion");
    end();
  }

  function addRect(y = 0) {
    const t = rnd() < 0.3;
    const size = t ? rnd(7, 12) : rnd(20, 30);
    const x = t ? rnd(10, 90) : 50 + rnds(40, 60);
    rects.push({ pos: vec(x, y - size), vx: 0, size });
    return size;
  }
}
