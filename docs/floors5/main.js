title = "FLOORS 5";

description = `
[Tap]  Jump / Double Jump
[Hold] Fly
`;

characters = [
  `



 l  l
l ll l
 l  l
`,
  `
 lll
l l ll
llllll
l ll l


`,
  `
 llll
llllll
llllll
llllll
llllll
 llll
`,
  `
 llll
l    l
l    l
l    l
l    l
 llll
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7,
};

/**
 * @type { {pos: Vector, width: number, index: number,
 *  paintFrom: number, paintTo:number }[] }
 */
let floors;
/** @type { Color[] } */
const colors = ["red", "green", "blue", "yellow", "purple"];
/**
 * @type { {pos:Vector, vel: Vector, floor: any,
 * by: number, bvy: number, fallTicks: number, jumpCount: number }}
 */
let car;
let landedColors;
let multiplier;

function update() {
  if (!ticks) {
    floors = times(5, (i) => {
      return {
        pos: vec([25, 52, 105, 160, 220][i], [30, 50, 70, 60, 40][i]),
        width: [10, 35, 30, 30, 50][i],
        index: i,
        paintFrom: 0,
        paintTo: 0,
      };
    });
    car = {
      pos: vec(10, 10),
      vel: vec(1, 0),
      floor: undefined,
      by: 0,
      bvy: 0,
      fallTicks: -99,
      jumpCount: 0,
    };
    landedColors = times(5, () => false);
    multiplier = 1;
  }
  floors.forEach((f, i) => {
    if (f.pos.x + f.width < 0) {
      f.pos.set(rnd(200, 250), rnd(30, 90));
      f.width = rnd(20, 60);
      f.paintFrom = f.paintTo = 0;
    }
    color(colors[i]);
    f.pos.x -= car.vel.x;
    rect(f.pos, f.width, 6);
    color("white");
    rect(f.pos.x + 1, f.pos.y + 1, f.width - 2, 4);
    color(colors[i]);
    rect(f.pos.x + f.paintFrom, f.pos.y + 1, f.paintTo - f.paintFrom, 4);
  });
  car.vel.x += difficulty * 0.02;
  if (car.floor == null) {
    car.vel.y += input.isPressed ? 0.03 : 0.18;
  }
  car.pos.y += car.vel.y;
  car.bvy -= car.by * 0.1;
  car.by += car.bvy;
  car.by *= 0.9;
  car.fallTicks--;
  color("black");
  const cr = char("a", car.pos.x, clamp(car.pos.y, 0, 999)).isColliding.rect;
  const crb = char("b", car.pos.x, car.pos.y + car.by).isColliding.rect;
  if (car.floor == null) {
    colors.forEach((c, i) => {
      if (cr[c] || crb[c]) {
        if (car.vel.y >= 0) {
          play("select");
          car.floor = floors[i];
          car.pos.y = car.floor.pos.y - 3;
          car.vel.y = 0;
          car.vel.x = sqrt(difficulty);
          car.floor.paintFrom = clamp(car.pos.x - 5 - car.floor.pos.x, 0, 999);
          car.jumpCount = 0;
          landedColors[i] = true;
        } else {
          play("hit");
          car.pos.y = floors[i].pos.y + 9 - car.by;
          car.vel.y *= -0.7;
        }
      }
    });
    if (
      car.floor == null &&
      (car.fallTicks > -9 || car.jumpCount < 2) &&
      input.isJustPressed
    ) {
      play("jump");
      car.vel.y = -2;
      car.vel.x = sqrt(difficulty);
      car.bvy = -2;
      car.jumpCount++;
    }
  } else {
    if (input.isJustPressed) {
      play("jump");
      addFloorScore(car.floor);
      car.floor.pos.x = -999;
      car.floor = undefined;
      car.vel.y = -2;
      car.vel.x = sqrt(difficulty);
      car.bvy = -2;
      car.jumpCount++;
    } else if (car.floor.pos.x + car.floor.width < car.pos.x - 3) {
      addFloorScore(car.floor);
      car.floor.pos.x = -999;
      car.floor = undefined;
      car.vel.x = sqrt(difficulty);
      car.fallTicks = 0;
      car.jumpCount = 0;
    } else {
      car.floor.paintTo = clamp(
        car.pos.x + 5 - car.floor.pos.x,
        0,
        car.floor.width
      );
    }
  }
  let isAll = true;
  landedColors.forEach((lc, i) => {
    color(colors[i]);
    char(lc ? "c" : "d", i * 7 + 3, 96);
    isAll = lc && isAll;
  });
  if (isAll) {
    play("coin");
    multiplier++;
    landedColors = times(5, () => false);
  }
  if (multiplier > 1) {
    color("black");
    text(`x${multiplier}`, 45, 96);
  }
  if (car.pos.y > 99) {
    play("explosion");
    end();
  }

  function addFloorScore(f) {
    play("powerUp");
    const w = f.paintTo - f.paintFrom;
    const m = w >= f.width ? 3 : 1;
    let y = f.pos.y - (m > 1 ? 7 : 0);
    const s = clamp(floor(w) * multiplier, 0, 999);
    for (let i = 0; i < m; i++) {
      addScore(s, f.pos.x + f.width + 15, y);
      y += 7;
    }
  }
}
