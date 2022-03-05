title = "GRAVELER";

description = `
[Hold]
 Reverse gravity
`;

characters = [
  `
l
 lll
ll  ll
 ll
`,
];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 29,
};

/** @type { {pos: Vector, width: number}[]} */
let walls;
/** @type { { y: number, vy: number, w: number, wy: number}} */
let nextWall;
let nextWallDist;
let nextWallIndex;
const sx = 10;
let sy;
let svy;
let grvOfs;
/** @type { {pos: Vector, type: "coin" | "spike"}[]} */
let objs;
let nextObjDist;
let coinCount;
let coinY;
let multiplier;

function update() {
  if (!ticks) {
    walls = times(11, (i) => {
      return {
        pos: vec(i * 10, 50),
        width: 60,
      };
    });
    nextWall = { y: 50, vy: 0, w: 60, wy: 0 };
    nextWallDist = 10;
    nextWallIndex = 0;
    grvOfs = 0;
    sy = 65;
    svy = 0;
    objs = times(5, (i) => {
      return {
        pos: vec(i * 7 + 15, 65),
        type: "coin",
      };
    });
    nextObjDist = 10;
    coinCount = 0;
    multiplier = 1;
  }
  if (ticks % 600 === 0) {
    sss.stopBgm();
    sss.setTempo(clamp(120 + (ticks / 600) * 10, 120, 240));
    if (!isReplaying) {
      sss.playBgm();
    }
  }
  const scr = difficulty * 0.5;
  walls.forEach((w) => {
    color("blue");
    rect(w.pos.x, 0, 11, w.pos.y - w.width / 2);
    rect(w.pos.x, w.pos.y + w.width / 2, 11, 101 - w.pos.y - w.width / 2);
    color(input.isPressed ? "purple" : "cyan");
    for (let y = w.pos.y - w.width / 2 + grvOfs; y < w.pos.y; y += 10) {
      rect(w.pos.x, y, 10, 1);
    }
    for (let y = w.pos.y + w.width / 2 - grvOfs; y > w.pos.y; y -= 10) {
      rect(w.pos.x, y, 10, 1);
    }
    if (sx >= w.pos.x && sx < w.pos.x + 10) {
      let f = sy < w.pos.y ? -1 : 1;
      if (input.isPressed) {
        f *= -1.5;
      }
      svy += sqrt(difficulty) * f * 0.015;
    }
    w.pos.x -= scr;
  });
  grvOfs = wrap(grvOfs + difficulty * (input.isPressed ? 0.25 : -0.16), 0, 10);
  nextWallDist -= scr;
  if (nextWallDist <= 0) {
    const w = walls[nextWallIndex];
    nextWallIndex = wrap(nextWallIndex + 1, 0, 11);
    nextWall.vy += rnds(0.2);
    nextWall.y += nextWall.vy;
    nextWall.wy += rnds(0.2);
    nextWall.w += nextWall.wy;
    if (nextWall.y - nextWall.w / 2 < 20 && nextWall.vy < 0) {
      nextWall.vy += 1;
    }
    if (nextWall.y + nextWall.w / 2 > 80 && nextWall.vy > 0) {
      nextWall.vy -= 1;
    }
    if (nextWall.w < 32 && nextWall.wy < 0) {
      nextWall.wy += 1;
    }
    if (nextWall.w > 60 && nextWall.wy > 0) {
      nextWall.wy -= 1;
    }
    w.pos.set(100 + nextWallDist, nextWall.y);
    w.width = nextWall.w;
    nextWallDist += 10;
  }
  color("black");
  sy += svy;
  svy *= 0.99;
  if (char("a", sx, sy).isColliding.rect.blue) {
    play("explosion");
    end();
  }
  if (input.isJustPressed) {
    play("laser");
  } else if (input.isJustReleased) {
    play("hit");
  }
  objs = objs.filter((o) => {
    if (o.type === "coin") {
      color("yellow");
      const c = text("o", o.pos).isColliding;
      if (c.char.a) {
        play("powerUp");
        addScore(multiplier, o.pos);
        multiplier++;
        return false;
      }
      if (c.rect.blue) {
        coinY += coinY < 50 ? 10 : -10;
        return false;
      }
    } else {
      color("red");
      if (text("x", o.pos).isColliding.char.a) {
        play("explosion");
        end();
      }
    }
    o.pos.x -= scr;
    if (o.pos.x < -3) {
      if (o.type === "coin" && multiplier > 1) {
        multiplier--;
      }
      return false;
    }
    return true;
  });
  nextObjDist -= scr;
  if (nextObjDist < 0) {
    const w = walls[wrap(nextWallIndex - 1, 0, 11)];
    if (coinCount === 0) {
      objs.push({
        pos: vec(103, rnd(w.pos.y - 10, w.pos.y + 10)),
        type: "spike",
      });
      coinCount = rndi(3, 7);
      nextObjDist = rnd(40, 60) * sqrt(difficulty);
      coinY =
        rnd() < 0.5
          ? rnd(w.pos.y - w.width * 0.36, w.pos.y - w.width * 0.2)
          : rnd(w.pos.y + w.width * 0.36, w.pos.y + w.width * 0.2);
    } else {
      objs.push({
        pos: vec(103, coinY),
        type: "coin",
      });
      coinCount--;
      if (coinCount === 0) {
        nextObjDist = rnd(40, 60) * sqrt(difficulty);
      } else {
        nextObjDist = 7;
      }
    }
  }
}
