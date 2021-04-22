title = "B WALLS";

description = `
[Tap] Shoot
`;

characters = [
  `
  ll
  ll
rrLLrr
rrLLrr
  ll
`,
  `
l ll l
 lyyl
lyyyyl
 ylly
 ylly
  ll
`,
  `
 y
yyy
lll
yyy
lll
 y
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 19,
};

/**
 * @type {{
 * y: number, width: number, interval: number, ox: number, vx: number
 * }[]}
 */
let walls;
let nextWallDist;
let scr;
let wallTicks;
let shotY;
let multiplier;

function update() {
  if (!ticks) {
    walls = [];
    nextWallDist = 0;
    scr = 0;
    wallTicks = 0;
    shotY = undefined;
    multiplier = 1;
  }
  const wallStopInterval = 120 / sqrt(difficulty);
  const isWallStopping = (wallTicks / wallStopInterval) % 1 > 0.5;
  if (shotY == null && input.isJustPressed) {
    play("powerUp");
    shotY = 90;
    multiplier = 1;
  }
  if (shotY != null) {
    shotY -= sqrt(difficulty) * 3;
    char("c", 50, shotY);
    if (shotY > 66) {
      scr += (shotY - 66) * 0.1;
    }
  }
  if (!isWallStopping) {
    play("hit");
  }
  let maxY = 0;
  remove(walls, (w) => {
    w.y += scr;
    if (w.y > maxY) {
      maxY = w.y;
    }
    if (!isWallStopping) {
      w.ox = (w.ox + w.vx) % (w.width + w.interval);
    }
    let x = w.ox - w.width;
    color("yellow");
    while (x < 99) {
      if (rect(x, w.y, w.width, 5).isColliding.char.c) {
        play("select");
        shotY = undefined;
      }
      x += w.width + w.interval;
    }
    color("black");
    if (char("b", 50, w.y - 3).isColliding.char.c && shotY != null) {
      play("explosion");
      addScore(multiplier, 50, w.y - 3);
      multiplier *= 2;
      return true;
    }
  });
  if (shotY == null) {
    wallTicks++;
  } else if (shotY < -9 || (!isWallStopping && shotY < maxY + 7)) {
    play("select");
    shotY = undefined;
  }
  nextWallDist -= scr;
  if (nextWallDist < 0) {
    const w = rnd(10, 20);
    const i = rnd(20, 40);
    const wall = {
      y: -9 - nextWallDist,
      width: w,
      interval: i,
      ox: rnd(w + i),
      vx: 0,
    };
    let isValid = false;
    for (let i = 0; i < 99; i++) {
      const vx = rnds(5, 10) * sqrt(difficulty);
      if (abs((vx * wallStopInterval * 0.5) % (w + i)) > 19) {
        wall.vx = vx;
        isValid = true;
        break;
      }
    }
    if (!isValid) {
      wall.width = 0;
    }
    walls.push(wall);
    nextWallDist += 11;
  }
  if (maxY < 40) {
    scr += (40 - maxY) * 0.01;
  } else {
    scr *= 0.5;
  }
  scr += difficulty * 0.01;
  color("black");
  if (char("a", 50, 90).isColliding.rect.yellow) {
    play("lucky");
    end();
  }
}
