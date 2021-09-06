title = "HOPPING P";

description = `
[Tap] Turn
`;

characters = [];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/**
 * @type {{
 * pos: Vector, vel:Vector, vx: number, hop:Vector, grv: number,
 * hopTicks: number, type: "player" | "enemy" | "power"}[]
 * }
 */
let hoppings;
let enemyAppTicks;
let powerAppTicks;
let powerTicks;
let multiplier;
let isFirstPower;
const baseHop = vec(0.5, -1.2);
const baseGrv = 0.02;
const texts = {
  player: "o",
  enemy: "x",
  power: "P",
};
/** @type { {[key:string]: Color} } */
const colors = {
  player: "green",
  enemy: "red",
  power: "yellow",
};
const enemyPattern = [
  [1, 1, 0.65],
  [1, 0.8, 2],
  [1.6, 0.6, 2],
  [1, 2, 1.8],
];

function update() {
  if (!ticks) {
    hoppings = [
      {
        pos: vec(99, 60),
        vel: vec(baseHop.x, 0),
        vx: 1,
        hop: baseHop,
        grv: baseGrv,
        hopTicks: 0,
        type: "player",
      },
    ];
    enemyAppTicks = 0;
    powerAppTicks = 200;
    powerTicks = 0;
    isFirstPower = true;
  }
  color("blue");
  rect(0, 90, 199, 9);
  const isWeakApp = powerTicks > 60;
  enemyAppTicks -= isWeakApp ? 3 : 1;
  if (enemyAppTicks < 0) {
    const x = rnd() < 0.5 ? -5 : 205;
    const t = enemyPattern[rndi(enemyPattern.length)];
    hoppings.push({
      pos: vec(x, 89),
      vel: vec(),
      vx: x < 99 ? 1 : -1,
      hop: vec(baseHop.x * t[0] * (isWeakApp ? 0.5 : 1), baseHop.y * t[1]),
      grv: baseGrv * t[2],
      hopTicks: 0,
      type: "enemy",
    });
    enemyAppTicks = (rnd(100, 150) / sqrt(difficulty)) * sqrt(hoppings.length);
  }
  if (hoppings.length === 1) {
    enemyAppTicks = 0;
  }
  powerAppTicks--;
  if (powerAppTicks < 0) {
    const x = rnd() < 0.5 ? -5 : 205;
    const t = isFirstPower
      ? [0.88, 1.25, 1.25]
      : enemyPattern[rndi(enemyPattern.length)];
    isFirstPower = false;
    hoppings.push({
      pos: vec(x, 89),
      vel: vec(),
      vx: x < 99 ? 1 : -1,
      hop: vec(baseHop.x * t[0] * 0.8, baseHop.y * t[1] * 0.8),
      grv: baseGrv * t[2] * 0.8,
      hopTicks: 0,
      type: "power",
    });
    powerAppTicks = rnd(700, 999) / sqrt(difficulty);
  }
  powerTicks--;
  if (powerTicks > 60) {
    if (powerTicks % 30 === 0) {
      play("select");
    }
  } else if (powerTicks > 0) {
    if (powerTicks % 10 === 0) {
      play("select");
    }
  }
  if (powerTicks <= 0) {
    multiplier = 1;
  }
  hoppings = hoppings.filter((h) => {
    if (h.type === "player" && input.isJustPressed) {
      play("hit");
      h.vx *= -1;
      h.vel.x *= -1;
    }
    if (h.hopTicks > 0) {
      h.hopTicks -= difficulty;
      if (h.hopTicks <= 0) {
        color("black");
        if (h.type === "player") {
          play("jump");
          particle(h.pos, 9, -h.hop.y, -PI / 2, PI / 2);
        } else {
          play("laser");
          particle(h.pos, 4, -h.hop.y, -PI / 2, PI / 2);
        }
        h.vel.set(h.hop.x * h.vx * difficulty, h.hop.y * difficulty);
      } else {
        const r = h.hopTicks < 5 ? 1 - h.hopTicks / 5 : (h.hopTicks - 5) / 5;
        color("black");
        box(h.pos.x, h.pos.y - 2 * r, 2, 4 * r);
        box(h.pos.x, h.pos.y - 5 * r, 6, 2 * r);
        const c = drawHopping(h, r);
        return checkCollision(h, c);
      }
    }
    h.pos.add(h.vel);
    h.vel.y += h.grv * difficulty * difficulty;
    if (h.type === "player" && powerTicks > 0) {
      h.pos.add(h.vel);
      h.vel.y += h.grv * difficulty * difficulty;
    }
    if (h.pos.y > 90) {
      h.pos.y = 90;
      h.hopTicks = 9;
    }
    if ((h.pos.x < 0 && h.vx < 0) || (h.pos.x > 199 && h.vx > 0)) {
      h.vx *= -1;
      h.vel.x *= -1;
    }
    color("black");
    box(h.pos.x, h.pos.y - 2, 2, 4);
    box(h.pos.x, h.pos.y - 5, 6, 2);
    const c = drawHopping(h, 1);
    return checkCollision(h, c);
  });

  function checkCollision(h, c) {
    if (h.type === "enemy") {
      if (c.o) {
        if (powerTicks > 0) {
          play("coin");
          color("blue");
          particle(h.pos, 19, 2);
          addScore(multiplier, h.pos);
          if (multiplier < 64) {
            multiplier *= 2;
          }
          return false;
        }
        play("explosion");
        end();
      }
    } else if (h.type === "power") {
      if (c.o) {
        play("powerUp");
        color("yellow");
        particle(h.pos, 29, 3);
        powerTicks = floor(
          (300 / sqrt(difficulty)) * sqrt(sqrt(hoppings.length))
        );
        hoppings.forEach((h) => {
          if (h.type !== "player") {
            h.vel.x *= -1;
            h.vx *= -1;
          }
        });
        return false;
      }
    }
    return true;
  }

  function drawHopping(h, r) {
    color(
      powerTicks > 0 &&
        h.type === "enemy" &&
        !(powerTicks < 60 && powerTicks % 15 > 7)
        ? "blue"
        : colors[h.type]
    );
    let c;
    if ((h.type === "player" && powerTicks > 0) || h.type === "power") {
      c = text(texts[h.type], h.pos.x, h.pos.y - 10 * r - 2, {
        scale: { x: 2, y: 2 },
      }).isColliding.text;
    } else {
      c = text(texts[h.type], h.pos.x, h.pos.y - 10 * r).isColliding.text;
    }
    return c;
  }
}
