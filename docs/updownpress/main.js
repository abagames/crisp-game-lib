title = "UP DOWN PRESS";

description = `
[Tap]  Jump
[Hold] Speed up
`;

characters = [];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 600,
};

/** @type {{from: Vector, to: Vector, angle: number }[]} */
let roads;
let nextRoadDist;
/**
 * @type {{
 * x: number, vx: number, angle: number, size: number, color: Color,
 * speed: number, currentSpeed: number,
 * }[]}
 */
let cars;
let nextCarDist;
let scr;
/**
 * @type {{
 * pos: Vector, vy: number, vx: number,
 * angle: number, speed: number, state: "ground" | "jump" | "damaged"
 * }}
 */
let myCar;
let multiplier;
const myCarSize = 5;
const myCarSpeed = 1;

function update() {
  if (!ticks) {
    roads = [{ from: vec(0, 50), to: vec(100, 50), angle: 0 }];
    nextRoadDist = -250;
    cars = [];
    nextCarDist = 0;
    scr = vec();
    myCar = {
      pos: vec(20, 50),
      vy: 0,
      vx: 0,
      angle: 0,
      speed: 1,
      state: "ground",
    };
    multiplier = 1;
  }
  scr.set(difficulty * 0.1);
  if (myCar.pos.x > 50) {
    scr.x += (myCar.pos.x - 50) * 0.1;
  }
  const [ry, _] = calcRoad(myCar.pos.x + 50);
  if (ry < 60) {
    scr.y += (ry - 60) * 0.1;
  } else if (ry > 90) {
    scr.y += (ry - 90) * 0.1;
  }
  nextRoadDist -= scr.x;
  while (nextRoadDist < 0) {
    const lr = roads[roads.length - 1];
    const from = vec(lr.to);
    let to = vec(lr.to);
    const w = rnd(20, 60);
    to.x += w;
    if (lr.from.y - lr.to.y === 0) {
      to.y += rnds(0.4, 1.1) * w;
    }
    roads.push({ from, to, angle: from.angleTo(to) });
    nextRoadDist += w;
  }
  color("light_black");
  remove(roads, (r) => {
    r.from.sub(scr);
    r.to.sub(scr);
    line(r.from, r.to);
    return r.to.x < -50;
  });
  myCar.pos.x += myCar.speed * sqrt(difficulty) - scr.x + myCar.vx;
  myCar.vx *= 0.9;
  if (myCar.pos.x < 0) {
    play("lucky");
    end();
  }
  const [y, a] = calcRoad(myCar.pos.x);
  if (myCar.state === "jump" && myCar.pos.y > y) {
    myCar.state = "ground";
  }
  if (myCar.state === "ground") {
    myCar.pos.y = y;
    myCar.speed += myCarSize * myCar.angle * 0.02;
    myCar.angle += (a - myCar.angle) * 0.025;
    if (input.isJustPressed) {
      play("jump");
      myCar.state = "jump";
      myCar.vy = -2;
      multiplier = 1;
    }
  }
  if (myCar.state === "jump") {
    myCar.pos.y += myCar.vy * sqrt(difficulty);
    myCar.vy += input.isPressed ? 0.05 : 0.2;
    myCar.angle += (atan2(myCar.vy, myCar.speed) - myCar.angle) * 0.05;
  }
  myCar.speed +=
    (myCarSpeed * (input.isPressed ? 2.5 : 0.5) - myCar.speed) * 0.1;
  const p = vec(myCar.pos);
  p.addWithAngle(myCar.angle, myCarSize * 0.6);
  const ts = myCarSize;
  color("blue");
  box(p.x, p.y - ts / 2, ts);
  p.addWithAngle(myCar.angle, myCarSize * -1.2);
  box(p.x, p.y - ts / 2, ts);
  color("cyan");
  p.set(myCar.pos);
  p.addWithAngle(myCar.angle - PI / 2, ts);
  bar(p, myCarSize, myCarSize, myCar.angle);
  p.addWithAngle(myCar.angle - (PI / 4) * 3, ts * 0.5);
  bar(p, myCarSize / 2, myCarSize, myCar.angle);
  nextCarDist -= scr.x;
  if (nextCarDist < 0) {
    const lr = roads[roads.length - 1];
    const speed = rnd(0.3, 1 + sqrt(difficulty));
    const x = speed > 2.5 ? -5 : 205;
    cars.push({
      x,
      vx: 0,
      size: rnd(5, 8),
      speed,
      currentSpeed: 0,
      angle: 0,
      // @ts-ignore
      color: ["red", "yellow", "green", "purple"][rndi(4)],
    });
    nextCarDist += rnd(100, 120) / sqrt(difficulty);
  }
  remove(cars, (c) => {
    c.x += c.currentSpeed * sqrt(difficulty) - scr.x;
    const [y, a] = calcRoad(c.x);
    c.currentSpeed += c.size * c.angle * 0.02;
    c.currentSpeed += (c.speed - c.currentSpeed) * 0.1;
    if (y == null) {
      return true;
    }
    c.angle += (a - c.angle) * 0.025;
    const p = vec(c.x, y);
    p.addWithAngle(c.angle, c.size * 0.6);
    const ts = c.size;
    color("black");
    box(p.x, p.y - ts / 2, ts);
    p.addWithAngle(c.angle, c.size * -1.2);
    box(p.x, p.y - ts / 2, ts);
    color(c.color);
    p.set(c.x, y);
    p.addWithAngle(c.angle - PI / 2, ts);
    let cl = bar(p, c.size, c.size, c.angle).isColliding.rect;
    p.addWithAngle(c.angle - (PI / 4) * 3, ts * 0.5);
    cl = { ...cl, ...bar(p, c.size / 2, c.size, c.angle).isColliding.rect };
    const isPressing = myCar.state === "jump" && myCar.vy >= 0;
    if (isPressing && (cl.cyan || cl.blue)) {
      play("powerUp");
      addScore(multiplier, p);
      if (multiplier < 16) {
        multiplier *= 2;
      }
      particle(p);
      myCar.vy = -2;
      return true;
    }
    if (!isPressing && cl.cyan) {
      myCar.vx = -c.size - myCar.speed * 1.5;
      play("explosion");
      color("cyan");
      particle(myCar.pos, 9, 2, 0, 1);
    }
  });

  function calcRoad(x) {
    let road = [undefined, undefined];
    roads.forEach((r) => {
      if (r.from.x <= x && x < r.to.x) {
        road = [
          ((r.from.y - r.to.y) * (x - r.to.x)) / (r.from.x - r.to.x) + r.to.y,
          r.angle,
        ];
      }
    });
    return road;
  }
}
