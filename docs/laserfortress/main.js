title = "LASER FORTRESS";

description = `
[Hold] Laser irradiation
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
  `,
  `
llllll
ll l l
ll l l
llllll
ll  ll
  `,
  `
  lll
ll l l
 llll
 l  l
ll  ll
`,
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
  `
  l
  l
ll ll
  l
  l
`,
  `
 l
l  l
lllll
l  l
 l
`,
];

options = {
  theme: "pixel",
  viewSize: { x: 160, y: 60 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/** @type {{x: number, vx: number, ticks: number, type: "ally" | "enemy"}[]} */
let objs;
let nextObjTicks;
let nextObjCount;
/** @type {"ally" | "enemy"} */
let nextObjType;
let highSpeedIndex;
let sightX;
let laserX;
let multiplier;

function update() {
  if (!ticks) {
    objs = [];
    nextObjTicks = 0;
    nextObjCount = 5;
    highSpeedIndex = -1;
    nextObjType = "enemy";
    sightX = 40;
    laserX = undefined;
    multiplier = 1;
  }
  color("blue");
  rect(0, 50, 200, 10);
  color("light_cyan");
  rect(0, 7, 14, 22);
  char("f", 17, 8);
  if (input.isJustPressed) {
    play("select");
    laserX = sightX;
    multiplier = 1;
    color("blue");
    particle(20, 8, 9, 3, 0, PI / 8);
  }
  if (laserX != null && input.isPressed) {
    play("laser");
    color("blue");
    line(laserX, 50, 20, 8, 2);
    laserX += difficulty * 2;
    particle(laserX, 50, 1, 2, -PI / 2, PI / 6);
    color("purple");
    box(laserX - 2, 50, 5, 1);
  }
  nextObjTicks--;
  if (nextObjTicks < 0) {
    objs.push({
      x: 163,
      vx: difficulty * (nextObjCount === highSpeedIndex ? 2 : 1),
      ticks: rndi(99),
      type: nextObjType,
    });
    nextObjCount--;
    if (nextObjCount < 0) {
      nextObjCount = 9 - floor(sqrt(rnd(50)));
      nextObjTicks = rnd(20, 30) / difficulty;
      if (nextObjType === "ally") {
        nextObjType = "enemy";
      } else if (rnd() < 0.3) {
        nextObjType = "ally";
      }
      highSpeedIndex = rnd() < 0.5 ? -1 : rndi(2);
    } else {
      nextObjTicks = rnd(5, 8) / difficulty;
    }
  }
  let minX = 200;
  remove(objs, (o) => {
    o.x -= o.vx;
    if (o.type === "enemy" && o.x < minX) {
      minX = o.x;
    }
    o.ticks++;
    color(o.type === "ally" ? "blue" : "red");
    if (
      char(
        addWithCharCode(o.type === "ally" ? "a" : "c", floor(o.ticks / 12) % 2),
        o.x,
        47,
        { mirror: { x: -1 } }
      ).isColliding.rect.purple
    ) {
      if (o.type === "ally") {
        play("explosion");
        end();
      } else {
        play("hit");
        particle(o.x, 47);
        addScore(multiplier, o.x, 47);
        multiplier++;
      }
      return true;
    }
    if (o.x < 0) {
      if (o.type === "enemy") {
        play("explosion");
        color("red");
        text("X", 3, 47);
        end();
      }
      return true;
    }
  });
  if (minX < 200) {
    sightX += (minX - difficulty * 3 - 5 - sightX) * 0.3;
  }
  color("black");
  char("e", sightX, 47);
}
