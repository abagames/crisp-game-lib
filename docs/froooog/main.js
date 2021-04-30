title = "FROOOOG";

description = `
[Hold]    Bend
[Release] Jump
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 101,
};

/**
 * @type {{
 * y: number, vx: number, width: number, color: Color,
 * interval: number, ticks: number
 * }[]}
 */
let lanes;
let nextEmptyLaneCount;
/** @type {{pos: Vector, vx: number, width: number, color: Color}[]} */
let cars;
let nextLaneY;
/**
 * @type {{
 * y: number, py: number, targetY: number, isSafe: boolean
 * state: "stop" | "bend" | "jump"
 * }}
 */
let frog;

function update() {
  if (!ticks) {
    lanes = [];
    cars = [];
    nextLaneY = 90;
    nextEmptyLaneCount = 0;
    times(3, () => addLane(true));
    times(7, () => addLane());
    times(99, () => updateLanes());
    frog = { y: 95, py: 0, targetY: 0, state: "stop", isSafe: true };
  }
  let scr = difficulty * 0.02;
  if (frog.y < 90) {
    scr += (90 - frog.y) * 0.1;
  }
  if (frog.y > 103) {
    play("explosion");
    end();
  }
  lanes.forEach((l) => {
    l.y += scr;
  });
  cars.forEach((c) => {
    c.pos.y += scr;
  });
  nextLaneY += scr;
  if (nextLaneY > -50) {
    addLane();
  }
  frog.y += scr;
  frog.py += scr;
  frog.targetY += scr;
  updateLanes();
  if (frog.state === "stop") {
    drawFrog();
    if (input.isPressed) {
      play("select");
      frog.state = "bend";
      frog.targetY = frog.y - 3;
    }
  }
  if (frog.state === "bend") {
    frog.targetY -= sqrt(difficulty) * 0.7;
    color("light_black");
    rect(49, frog.targetY, 1, frog.y - frog.targetY);
    drawFrog();
    let ty = frog.targetY;
    for (let i = 0; i < lanes.length; i++) {
      const l = lanes[i];
      if (l.y > frog.targetY) {
        ty = l.y - 5;
      }
    }
    color("light_black");
    box(50, ty, 3, 5);
    if (input.isJustReleased || frog.targetY < 9) {
      play("powerUp");
      frog.state = "jump";
      frog.targetY = ty;
      frog.py = frog.y;
    }
  }
  if (frog.state === "jump") {
    frog.y -= sqrt(difficulty) * 1.5;
    const scale =
      sin(((frog.y - frog.targetY) / (frog.py - frog.targetY)) * PI) + 1;
    drawFrog(scale);
    if (frog.y < frog.targetY) {
      play("hit");
      color("transparent");
      frog.y = frog.targetY;
      const isf = box(50, frog.y, 1).isColliding.rect.light_green;
      const lc = isf || frog.isSafe ? 0 : ceil((frog.py - frog.y - 1) / 10);
      addScore(lc * lc, 50, frog.y);
      frog.state = "stop";
      frog.isSafe = isf;
    }
  }

  function drawFrog(scale = 1) {
    const y = frog.y;
    color("green");
    const c = box(50, y, 3 * scale, 5 * scale).isColliding.rect;
    if (scale === 1 && (c.red || c.yellow || c.purple || c.blue || c.cyan)) {
      play("explosion");
      end();
    }
    const ox = 2 * scale;
    const oy = 2 * scale * scale;
    const w = 2 * scale;
    const h = 3 * scale;
    box(50 - ox, y - oy, w, h);
    box(49 + ox, y - oy, w, h);
    box(50 - ox, y + oy, w, h);
    box(49 + ox, y + oy, w, h);
  }

  function updateLanes() {
    remove(lanes, (l) => {
      if (l.ticks > 999) {
        color("light_green");
        box(50, l.y + 5, 100, 9);
      } else {
        color("light_black");
        box(50, l.y, 100, 1);
      }
      l.ticks--;
      if (l.ticks < 0) {
        cars.push({
          pos: vec(l.vx < 0 ? 99 + l.width / 2 : -l.width / 2, l.y + 5),
          vx: l.vx,
          width: l.width,
          color: l.color,
        });
        l.ticks = l.interval * rnd(0.9, 1.6);
      }
      return l.y > 99;
    });
    remove(cars, (c) => {
      c.pos.x += c.vx;
      color(c.color);
      box(c.pos, c.width, 7);
      return c.pos.x < -c.width || c.pos.x > 99 + c.width || c.pos.y > 103;
    });
  }

  function addLane(isEmpty = false) {
    nextEmptyLaneCount--;
    const vr = sqrt(difficulty) + 0.1;
    const vx = (rnd(vr) * rnd(vr) * rnd(vr) + 1) * 0.3 * (rnd() < 0.5 ? -1 : 1);
    const width = rndi(9, 19);
    const interval = width + rnd(40, 90) / abs(vx);
    lanes.push({
      y: nextLaneY,
      vx,
      width,
      // @ts-ignore
      color: ["red", "purple", "yellow", "blue", "cyan"][rndi(5)],
      interval,
      ticks: nextEmptyLaneCount < 0 || isEmpty ? 9999999 : rnd(interval / 2),
    });
    nextLaneY -= 10;
    if (nextEmptyLaneCount < 0) {
      nextEmptyLaneCount = rndi(9, 16);
    }
  }
}
