title = "P FIT";

description = `
[Slide] Move
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 22,
};

/**
 * @type {{
 * pos: Vector, width: number, height: number, targetY: number,
 * type: "fix" | "move" | "end"
 * }[]}
 */
let walls;
let isAddingWall;
let wallX;
let matchTicks;
let nextScore;
let wallCount;
let wallWidth;

function update() {
  if (!ticks) {
    walls = [];
    isAddingWall = true;
    wallX = 0;
    matchTicks = 0;
    nextScore = 0;
  }
  if (isAddingWall) {
    wallCount = clamp(floor(6 * difficulty * rnd(0.5, 1)), 6, 20);
    wallWidth = 100 / (wallCount - 1);
    let h = rnd(22, 32);
    let hs = times(wallCount, () => {
      h += rnd(10, 50) / wallCount;
      return h;
    });
    times(99, () => {
      let i1 = rndi(wallCount);
      let i2 = rndi(wallCount);
      const t = hs[i1];
      hs[i1] = hs[i2];
      hs[i2] = t;
    });
    times(wallCount * 2, (i) => {
      walls.push({
        pos: vec(
          (i % wallCount) * wallWidth - wallWidth / 2,
          i < wallCount ? 75 : 225
        ),
        targetY: i < wallCount ? -25 : 125,
        width: wallWidth,
        height: i < wallCount ? hs[i] : hs[i - wallCount] - 99,
        type: i < wallCount ? "fix" : "move",
      });
    });
    wallX = -rnd(10, 90);
    for (let i = 0; i < 9; i++) {
      if (
        abs(
          wrap(
            wallX + input.pos.x,
            (-wallWidth * wallCount) / 2,
            (wallWidth * wallCount) / 2
          )
        ) > 20
      ) {
        break;
      }
      wallX = -rnd(10, 90);
    }
    nextScore = 300;
    isAddingWall = false;
  }
  if (matchTicks <= 30) {
    const wi = wrap(floor((input.pos.x - 5) / 10), 0, 11);
  }
  remove(walls, (w, i) => {
    w.pos.y += (w.targetY - w.pos.y) * 0.1;
    if (w.type === "end") {
      if (w.pos.y + (w.height > 0 ? w.height : 0) < 1) {
        return true;
      }
    } else {
      w.targetY += (w.type === "fix" ? 1 : -1) * difficulty * 0.02;
    }
    color(w.type === "move" && matchTicks < 30 ? "blue" : "green");
    const x =
      w.type === "move" && matchTicks <= 30
        ? wrap(w.pos.x + wallX + input.pos.x, -wallWidth, 100)
        : w.pos.x;
    if (
      rect(x, w.pos.y, ceil(w.width), w.height).isColliding.rect.green &&
      matchTicks < 30 &&
      w.type === "move"
    ) {
      color("red");
      text("x", x + wallWidth / 2, wrap(w.pos.y + w.height, -wallWidth, 100));
      color("blue");
      play("explosion");
      end();
    }
  });
  if (matchTicks > 30) {
    matchTicks++;
    if (matchTicks == 60) {
      walls.forEach((w) => {
        w.targetY = w.type === "fix" ? -100 : 0;
        w.type = "end";
      });
      isAddingWall = true;
      matchTicks = 0;
    }
  } else if (
    abs(
      wrap(
        wallX + input.pos.x,
        (-wallWidth * wallCount) / 2,
        (wallWidth * wallCount) / 2
      )
    ) < 3
  ) {
    matchTicks++;
    if (matchTicks > 30) {
      play("powerUp");
      walls.forEach((w) => {
        w.targetY = w.type === "fix" ? 1 : 99;
      });
      addScore(nextScore);
    }
  } else {
    matchTicks = 0;
  }
  color("black");
  text(`+${nextScore}`, 3, 10);
  if (matchTicks <= 30 && nextScore > 0) {
    nextScore--;
  }
}
