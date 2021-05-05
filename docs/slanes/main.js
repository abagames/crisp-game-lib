title = "S LANES";

description = `
[Hold]
 Shot & Forward
`;

characters = [
  `
rllbb
lllccb
LlyL b
`,
  `
  r rr
rrRrRR
  grr
  grr
rrRrRR
  r rr
`,
  `
 LLLL
LyyyyL
LyyyyL
LyyyyL
LyyyyL
 LLLL
`,
  `
l Llll
l Llll
`,
];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/** @type {{pos: Vector, vx: number, laneIndex: number}[]} */
let enemies;
let nextEnemyTicks;
/** @type {{pos: Vector, laneIndex: number}[]} */
let coins;
/** @type {{pos: Vector, vx: number}[]} */
let shots;
/**
 * @type {{
 * pos: Vector, laneIndex: number, targetY: number,
 * laneTicks: number, shotTicks: number
 * }}
 */
let ship;
let laneSpeeds;
let multiplier;
const laneWidth = 20;
const laneCount = 4;
const shipX = 3;

function update() {
  if (!ticks) {
    enemies = [];
    nextEnemyTicks = 0;
    coins = [];
    shots = [];
    ship = {
      pos: vec(shipX, calcY(0)),
      laneIndex: 0,
      targetY: calcY(0),
      laneTicks: 0,
      shotTicks: 0,
    };
    laneSpeeds = times(laneCount, () => 1);
    multiplier = 1;
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    play("select");
    const laneIndex = rndi(laneCount);
    enemies.push({
      pos: vec(103, calcY(laneIndex)),
      vx: -rnd(1, sqrt(difficulty)) * 0.2,
      laneIndex,
    });
    nextEnemyTicks = rnd(60, 90) / difficulty;
  }
  color("black");
  if (input.isPressed) {
    if (input.isJustPressed) {
      ship.pos.x = shipX;
    } else {
      ship.pos.x = clamp(ship.pos.x + sqrt(difficulty) * 0.3, 0, 50);
    }
    ship.pos.y = ship.targetY = calcY(ship.laneIndex);
    ship.shotTicks--;
    if (ship.shotTicks < 0) {
      play("laser");
      shots.push({
        pos: vec(ship.pos.x, wrap(ship.pos.y, 0, 100)),
        vx: difficulty * 2,
      });
      ship.shotTicks = ship.laneTicks = 20 / sqrt(difficulty);
    }
  } else {
    play("hit");
    ship.laneTicks--;
    if (ship.laneTicks < 0) {
      ship.laneIndex = wrap(ship.laneIndex + 1, 0, laneCount);
      ship.targetY = calcY(ship.laneIndex) + (ship.laneIndex === 0 ? 100 : 0);
      ship.pos.y = wrap(ship.pos.y, 0, 100);
      ship.laneTicks = 20 / sqrt(difficulty);
    }
    ship.pos.x += (shipX - ship.pos.x) * 0.3;
    ship.pos.y += (ship.targetY - ship.pos.y) * 0.3;
  }
  char("a", ship.pos.x, wrap(ship.pos.y, 0, 100));
  color("light_purple");
  times(laneCount, (i) => {
    laneSpeeds[i] += (0.9 - laneSpeeds[i]) * 0.02;
    text(times(ceil(laneSpeeds[i]), () => "<").join(""), 9, calcY(i));
  });
  color("black");
  const cvx = -difficulty * 0.2;
  remove(coins, (c) => {
    c.pos.x += cvx;
    if (char("c", c.pos).isColliding.char.a) {
      play("coin");
      addScore(multiplier, c.pos);
      multiplier++;
      return true;
    }
    if (c.pos.x < -3) {
      play("explosion");
      laneSpeeds[c.laneIndex]++;
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  shots.forEach((s) => {
    s.pos.x += s.vx;
    char("d", s.pos);
  });
  color("black");
  remove(enemies, (e) => {
    e.pos.x += e.vx * laneSpeeds[e.laneIndex];
    if (char("b", e.pos).isColliding.char.d) {
      play("powerUp");
      particle(e.pos);
      coins.push({ pos: e.pos, laneIndex: e.laneIndex });
      return true;
    }
    if (e.pos.x < 9) {
      play("lucky");
      color("red");
      text("X", 3, e.pos.y);
      end();
      color("black");
    }
  });
  color("transparent");
  remove(shots, (s) => {
    return s.pos.x > 103 || char("d", s.pos).isColliding.char.b;
  });

  function calcY(i) {
    return i * laneWidth + laneWidth / 2 + 12;
  }
}
