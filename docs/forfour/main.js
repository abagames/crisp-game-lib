title = "FORFOUR";

description = `
[Tap] Roll
`;

characters = [
  `
 llll
llllll
ll  ll
ll  ll
llllll
 llll
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
};

let circles;
let tmpCircles;
let flying;
let flyingColor;
let flyingAngle;
let flyingCount;

function update() {
  const circleCount = 13;
  const circlesOffset = vec(12, 18);
  const cc = floor(circleCount / 2);
  /** @type {Color[]} */
  const colors = ["black", "red", "green", "blue", "yellow"];
  /** @type {Color[]} */
  const lightColors = [
    "light_black",
    "light_red",
    "light_green",
    "light_blue",
    "light_yellow",
  ];
  if (!ticks) {
    circles = times(circleCount, () => times(circleCount, () => -1));
    tmpCircles = times(circleCount, () => times(circleCount, () => -1));
    circles[cc][cc] = 0;
    for (let i = cc + 1; i < circleCount - 1; i++) {
      circles[i][cc] = rndi(1, 5);
    }
    flying = vec();
    flyingCount = -999;
  }
  if (flyingCount < -900) {
    flyingCount = 60 / difficulty;
    flyingAngle = rndi(4);
    flyingColor = rndi(1, 5);
    let sz = checkSize();
    if (rnd() < sqrt(sz) * 0.1) {
      flyingColor = 0;
      sz = ceil(sz * 0.7);
    }
    const min = cc - sz + 1;
    const max = cc + sz - 1;
    switch (flyingAngle) {
      case 0:
        flying.set(-1, rndi(min, max + 1));
        break;
      case 1:
        flying.set(rndi(min, max + 1), -1);
        break;
      case 2:
        flying.set(circleCount, rndi(min, max + 1));
        break;
      case 3:
        flying.set(rndi(min, max + 1), circleCount);
        break;
    }
    flying.set(flying.x * 6 + circlesOffset.x, flying.y * 6 + circlesOffset.y);
  }
  flyingCount--;
  color(lightColors[flyingColor]);
  if (flyingAngle % 2 === 0) {
    rect(0, flying.y - 1, 99, 2);
  } else {
    rect(flying.x - 1, 0, 2, 99);
  }
  if (flyingCount < 0) {
    flying.addWithAngle((flyingAngle * PI) / 2, difficulty);
    const c = vec(
      round((flying.x - circlesOffset.x) / 6),
      round((flying.y - circlesOffset.y) / 6)
    );
    if (c.isInRect(0, 0, circleCount, circleCount) && circles[c.x][c.y] >= 0) {
      if (flyingColor === 0) {
        flyingColor = circles[c.x][c.y];
        if (flyingColor === 0) {
          flyingColor = rndi(1, 5);
        }
      }
      for (let i = 0; i < 99; i++) {
        c.addWithAngle((flyingAngle * PI) / 2 + PI, 1);
        c.round();
        if (!c.isInRect(0, 0, circleCount, circleCount)) {
          play("explosion");
          color("red");
          text("X", circlesOffset.x + c.x * 6, circlesOffset.y + c.y * 6);
          end();
          break;
        }
        if (circles[c.x][c.y] < 0) {
          play("laser");
          circles[c.x][c.y] = flyingColor;
          flyingCount = -999;
          const [ic, cnt] = checkConnection(c, flyingColor);
          if (cnt >= 4) {
            play("coin");
            let dcc = 0;
            for (let y = 0; y < circleCount; y++) {
              for (let x = 0; x < circleCount; x++) {
                if (ic[x][y]) {
                  color(colors[circles[x][y]]);
                  particle(
                    circlesOffset.x + x * 6,
                    circlesOffset.y + y * 6,
                    4,
                    1
                  );
                  circles[x][y] = -1;
                  dcc++;
                }
              }
            }
            const [icc, _] = checkConnection(vec(cc, cc));
            for (let y = 0; y < circleCount; y++) {
              for (let x = 0; x < circleCount; x++) {
                if (!icc[x][y] && circles[x][y] > 0) {
                  color(lightColors[circles[x][y]]);
                  particle(
                    circlesOffset.x + x * 6,
                    circlesOffset.y + y * 6,
                    4,
                    1
                  );
                  circles[x][y] = -1;
                  dcc++;
                }
              }
            }
            dcc -= 3;
            addScore(dcc * dcc, flying);
          }
          break;
        }
      }
    }
  }
  if (!flying.isInRect(-3, -3, 103, 103)) {
    flyingCount = -999;
  }
  color(colors[flyingColor]);
  char("a", flying);
  if (input.isJustPressed) {
    play("select");
    for (let y = 0; y < circleCount; y++) {
      for (let x = 0; x < circleCount; x++) {
        tmpCircles[x][y] = circles[x][y];
      }
    }
    for (let y = 0; y < circleCount; y++) {
      for (let x = 0; x < circleCount; x++) {
        circles[circleCount - 1 - y][x] = tmpCircles[x][y];
      }
    }
  }
  for (let y = 0; y < circleCount; y++) {
    for (let x = 0; x < circleCount; x++) {
      const c = circles[x][y];
      if (c >= 0) {
        color(colors[c]);
        char("a", circlesOffset.x + x * 6, circlesOffset.y + y * 6);
      }
    }
  }
  function checkConnection(pos, cl = -1) {
    let c = 1;
    const ic = times(circleCount, () => times(circleCount, () => false));
    ic[pos.x][pos.y] = true;
    for (let i = 0; i < 9; i++) {
      const pc = c;
      for (let y = 0; y < circleCount - 1; y++) {
        for (let x = 0; x < circleCount - 1; x++) {
          if (!ic[x][y]) {
            continue;
          }
          if (
            ((cl > 0 && circles[x + 1][y] === cl) ||
              (cl < 0 && circles[x + 1][y] >= 0)) &&
            !ic[x + 1][y]
          ) {
            ic[x + 1][y] = true;
            c++;
          }
          if (
            ((cl > 0 && circles[x][y + 1] === cl) ||
              (cl < 0 && circles[x][y + 1] >= 0)) &&
            !ic[x][y + 1]
          ) {
            ic[x][y + 1] = true;
            c++;
          }
        }
      }
      for (let y = circleCount - 1; y > 0; y--) {
        for (let x = circleCount - 1; x > 0; x--) {
          if (!ic[x][y]) {
            continue;
          }
          if (
            ((cl > 0 && circles[x - 1][y] === cl) ||
              (cl < 0 && circles[x - 1][y] >= 0)) &&
            !ic[x - 1][y]
          ) {
            ic[x - 1][y] = true;
            c++;
          }
          if (
            ((cl > 0 && circles[x][y - 1] === cl) ||
              (cl < 0 && circles[x][y - 1] >= 0)) &&
            !ic[x][y - 1]
          ) {
            ic[x][y - 1] = true;
            c++;
          }
        }
      }
      if (pc === c) {
        break;
      }
    }
    return [ic, c];
  }
  function checkSize() {
    let minX = circleCount - 1,
      maxX = 0;
    let minY = circleCount - 1,
      maxY = 0;
    for (let y = 0; y < circleCount; y++) {
      for (let x = 0; x < circleCount; x++) {
        if (circles[x][y] >= 0) {
          if (minX > x) {
            minX = x;
          }
          if (maxX < x) {
            maxX = x;
          }
          if (minY > y) {
            minY = y;
          }
          if (maxY < y) {
            maxY = y;
          }
        }
      }
    }
    minX = cc - minX + 1;
    maxX = maxX - cc + 1;
    minY = cc - minY + 1;
    maxY = maxY - cc + 1;
    return Math.max(minX, maxX, minY, maxY);
  }
}
