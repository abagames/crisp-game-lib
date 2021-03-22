title = "PRESS M";

description = `
[Slide] Move
`;

characters = [
  `
llllll
ll l l
llllll
 l  l
 l  l
  `,
  `
llllll
ll l l
llllll
ll  ll
  `,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7,
};

/** @type {{ pos: Vector, sy: number, ey: number, ney: number }[]} */
let walls;
/** @type { "press" | "return" } */
let wallMode;
let wallTicks;
let wallModeInterval;
let wallSpeed;
let hitWallIndex;
let px;
let pmx;
/** @type {{pos: Vector, wall, wallOy: number}[]} */
let coins;
/** @type {{pos: Vector, speed: number}[]} */
let inhalingCoins;
let multiplier;

function update() {
  if (!ticks) {
    walls = times(20, (i) => {
      const xi = i % 10;
      const yi = floor(i / 10);
      const ey = yi === 0 ? 40 : 60;
      return {
        pos: vec(xi * 10, ey),
        sy: 0,
        ey,
        ney: 0,
      };
    });
    wallTicks = 0;
    wallMode = "press";
    px = 50;
    pmx = 1;
    hitWallIndex = -1;
    inhalingCoins = [];
    multiplier = 1;
  }
  color(wallMode === "press" && wallTicks < 5 ? "red" : "purple");
  if (wallTicks === 0) {
    if (wallMode == "press") {
      if (multiplier > 1) {
        multiplier--;
      }
      if (hitWallIndex >= 0) {
        play("explosion");
        particle(walls[hitWallIndex].pos, 30, 2);
      }
      let i = 0;
      for (let yi = 0; yi < 2; yi++) {
        let a = rnd(PI * 2);
        let av = rnds(0.4, 1);
        let r = rnd(10, 20);
        let cy = yi === 0 ? rnd(15, 25) : rnd(75, 85);
        for (let xi = 0; xi < 10; xi++, i++) {
          const w = walls[i];
          w.sy = clamp(sin(a) * r + cy, 2, 97);
          av += rnds(0.1);
          r += rnds(1);
          a += av;
          cy += rnds(1);
        }
      }
      let mw = 99;
      for (let xi = 0; xi < 10; xi++) {
        const w = walls[xi + 10].sy - walls[xi].sy;
        if (w < mw) {
          mw = w;
          hitWallIndex = xi;
        }
      }
      mw /= 2;
      walls.forEach((w, i) => {
        w.ney = w.sy + (i < 10 ? mw : -mw);
      });
      let hasSpace = false;
      for (let xi = 0; xi < 10; xi++) {
        const w1 = walls[xi];
        const w2 = walls[xi + 10];
        if (w1.ney < 40 && w2.ney > 60) {
          hasSpace = true;
        }
      }
      if (!hasSpace) {
        for (let xi = 0; xi < 10; xi++) {
          if (xi !== hitWallIndex) {
            const w1 = walls[xi];
            const w2 = walls[xi + 10];
            if (w1.ney > 40) {
              const w = w1.ney - 40;
              w1.ney -= w;
              w1.sy -= w;
            }
            if (w2.ney < 60) {
              const w = 60 - w2.ney;
              w2.ney += w;
              w2.sy += w;
            }
          }
        }
      }
      coins = [];
      walls.forEach((w, i) => {
        if (rnd() < 0.2) {
          coins.push({
            pos: vec(),
            wall: w,
            wallOy: i < 10 ? 4 : -4,
          });
        }
      });
      wallMode = "return";
      wallModeInterval = wallTicks = ceil(60 / sqrt(difficulty));
    } else {
      walls.forEach((w) => {
        w.ey = w.ney;
      });
      wallMode = "press";
      wallModeInterval = wallTicks = ceil(20 / sqrt(difficulty));
    }
  }
  wallTicks--;
  walls.forEach((w, i) => {
    w.pos.y =
      wallMode === "press"
        ? w.sy +
          (w.ey - w.sy) *
            (wallTicks < 5
              ? 1 - wallTicks / 5
              : (1 - wallTicks / wallModeInterval) * 0.2)
        : w.ey + (w.sy - w.ey) * (1 - (wallTicks + 1) / wallModeInterval);
    if (i < 10) {
      rect(w.pos.x, 0, 9, w.pos.y);
    } else {
      rect(w.pos.x, w.pos.y, 9, 99 - w.pos.y);
    }
  });
  let p = vec(clamp(input.pos.x, 3, 96), 50);
  if (p.x < px - 2) {
    pmx = -1;
  } else if (p.x > px + 2) {
    pmx = 1;
  }
  px = p.x;
  color("black");
  if (
    char(addWithCharCode("a", floor((ticks % 60) / 30)), p, {
      mirror: { x: pmx },
    }).isColliding.rect.red
  ) {
    play("lucky");
    end();
  }
  color(wallMode === "press" ? "yellow" : "light_yellow");
  coins = coins.filter((c) => {
    c.pos.set(c.wall.pos.x + 5, c.wall.pos.y + c.wallOy);
    if (wallMode === "press" && c.pos.distanceTo(p) < 30) {
      inhalingCoins.push({ pos: c.pos, speed: rnd(0.1, 0.3) });
      return false;
    }
    text("o", c.pos);
    return true;
  });
  color("yellow");
  inhalingCoins = inhalingCoins.filter((c) => {
    c.pos.x += (p.x - c.pos.x) * c.speed;
    c.pos.y += (p.y - c.pos.y) * c.speed;
    const cl = text("o", c.pos).isColliding.char;
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c.pos);
      multiplier++;
      return false;
    }
    return true;
  });
}
