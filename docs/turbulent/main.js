title = "TURBULENT";

description = `
[Tap] Jump
`;

characters = [];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 300,
};

/** @type {{height: number, angle: number, va: number, x: number}[]} */
let waves;
/** @type {Vector[]} */
let points;
/** @type {{x: number, vx: number}[]} */
let mines;
let nextMineDist;
/**
 * @type {{pos: Vector, pp: Vector, vel: Vector, angle: number,
 * state: "float" | "jump"
 * }}
 */
let ship;
let jumpX;

function update() {
  if (!ticks) {
    waves = times(7, (i) => {
      return {
        height: rnd(10, 30),
        angle: (i % 2) * PI + rnds(PI / 4),
        va: rnd(0.01, 0.02),
        x: i * 20 - 20,
      };
    });
    points = times(25, (i) => vec());
    mines = [];
    nextMineDist = 0;
    ship = {
      pos: vec(40, 60),
      pp: vec(40, 60),
      vel: vec(),
      angle: 0,
      state: "float",
    };
  }
  let scr = 0.1 * difficulty;
  if (ship.pos.x > 50) {
    scr += (ship.pos.x - 50) * 0.1;
  }
  waves.forEach((w, i) => {
    w.x -= scr;
    if (w.x < -20) {
      w.x += 140;
      w.height = rnd(10, 30);
      w.angle = rnd(PI * 2);
      w.va = rnd(0.01, 0.02 * sqrt(difficulty));
    }
    w.angle += w.va;
    points[i * 4].set(w.x, 60 + sin(w.angle) * w.height);
  });
  color("blue");
  points.forEach((p, i) => {
    const im = i % 4;
    if (im !== 0) {
      let pp = points[floor(i / 4) * 4];
      let np = points[(floor(i / 4) + 1) * 4];
      const r = [0.2, 0.5, 0.8][im - 1];
      p.set(pp.x + 5 * im, pp.y * (1 - r) + np.y * r);
    }
    let pp = points[wrap(i - 1, 0, points.length)];
    if (pp.x < p.x) {
      line(pp, p);
    }
  });
  nextMineDist -= scr;
  if (nextMineDist < 0) {
    mines.push({ x: 103, vx: 0 });
    nextMineDist = rnd(100, 120) / sqrt(difficulty);
  }
  color("red");
  remove(mines, (m) => {
    m.x -= scr;
    const [pp, np] = getPoints(m.x);
    if (np == null) {
      return true;
    }
    const oy = np.y - pp.y;
    m.vx += oy * 0.001;
    m.vx *= 0.9;
    m.x += m.vx * sqrt(difficulty);
    const r = (m.x - pp.x) / (np.x - pp.x);
    text("*", m.x, pp.y + oy * r - 5);
    return m.x < -3;
  });
  let sa;
  if (ship.state === "float") {
    const [pp, np] = getPoints(ship.pos.x);
    if (np != null) {
      const oy = np.y - pp.y;
      ship.vel.x += oy * 0.002;
      ship.vel.x *= 0.925;
      ship.vel.x += 0.025;
      ship.pos.x += ship.vel.x;
      const r = (ship.pos.x - pp.x) / (np.x - pp.x);
      ship.pos.y = pp.y + oy * r;
      sa = pp.angleTo(np);
    }
    if (input.isJustPressed) {
      play("jump");
      jumpX = ship.pos.x;
      ship.vel.x = (ship.pos.x - ship.pp.x) * 2;
      ship.vel.y = (ship.pos.y - ship.pp.y) * 5;
      ship.vel.addWithAngle(sa - PI / 2, 1);
      if (ship.vel.y > -1) {
        ship.vel.y = -1;
      }
      ship.pos.add(ship.vel);
      ship.state = "jump";
    }
  } else {
    jumpX -= scr;
    ship.vel.x += 0.005;
    ship.vel.y += input.isPressed ? 0.02 : 0.1;
    ship.vel.mul(0.98);
    ship.pos.add(ship.vel);
    sa = ship.vel.angle;
  }
  ship.pos.x -= scr;
  ship.pos.clamp(5, 95, 5, 95);
  ship.pp.set(ship.pos);
  ship.angle += wrap(sa - ship.angle, -PI, PI) * 0.1;
  sa = ship.angle;
  const p = vec(ship.pos);
  p.addWithAngle(sa - PI * 0.5, 2);
  color("red");
  bar(p, 3, 2, sa);
  p.addWithAngle(sa - PI * 0.4, 2);
  color("black");
  bar(p, 4, 2, sa);
  p.addWithAngle(sa - PI * 0.6, 2);
  const c = bar(p, 1, 2, sa).isColliding;
  if (ship.state === "jump" && c.rect.blue) {
    const d = ship.pos.x - jumpX;
    play("hit");
    if (d > 0) {
      play("powerUp");
      addScore(ceil(sqrt(d * d)), ship.pos);
    }
    ship.state = "float";
    ship.vel.x *= 0.5;
  }
  if (c.text["*"]) {
    play("explosion");
    end();
  }

  function getPoints(x) {
    let pp;
    let np;
    for (let i = 0; i < points.length; i++) {
      pp = points[wrap(i - 1, 0, points.length)];
      np = points[i];
      if (pp.x > np.x) {
        continue;
      }
      if (pp.x <= x && x < np.x) {
        return [pp, np];
      }
    }
    return [undefined, undefined];
  }
}
