title = "BAROLL";

description = `
[Tap]  Jump
[Hold] Slow down
`;

characters = [
  `
 llll
l    l
l ll l
llllll
llllll
 llll
`,
  `
  l
  l
 lll
 l l
  l
 l
`,
  `
    l
   l
 lllll
l ll 
 l  l
l   l
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9,
};

/** @type {{pos: Vector, vy: number, speed: number, mode: "fall" | "roll", angle: number }[]} */
let barrels;
let barrelAddingTicks;
/** @type {Vector} */
let pos;
/** @type {Vector} */
let vel;
/** @type { "run" | "jump"} */
let mode;
let bx;
let anim;

function update() {
  if (!ticks) {
    barrels = [];
    barrelAddingTicks = 0;
    pos = vec(9, 86);
    vel = vec();
    mode = "run";
    bx = 0;
    anim = 0;
  }
  rect(0, 90, 200, 9);
  const df = sqrt(difficulty);
  barrelAddingTicks -= df;
  if (barrelAddingTicks < 0) {
    play("laser");
    barrels.push({
      pos: vec(rnd(mode === "run" ? 10 : 100, 200), -5),
      vy: 0,
      speed: rnd(1, df),
      mode: "fall",
      angle: rnd(99),
    });
    barrelAddingTicks += rndi(30, 90);
  }
  vel.x = df * (input.isPressed ? 1 : 2);
  addScore(vel.x - df);
  barrels = barrels.filter((b) => {
    if (b.mode === "fall") {
      b.vy += b.speed * 0.2;
      b.vy *= 0.92;
      b.pos.y += b.vy * sqrt(df);
      if (b.pos.y > 85) {
        play("select");
        b.pos.y = 86;
        b.mode = "roll";
      }
    } else {
      b.pos.x -= b.speed * df;
      b.angle += b.speed * df * 0.2;
    }
    b.pos.x -= vel.x;
    char("a", b.pos, { rotation: 3 - floor(b.angle % 4) });
    return b.pos.x > -5;
  });
  if (mode === "run") {
    if (input.isJustPressed) {
      play("jump");
      mode = "jump";
      vel.y = -3.6;
    }
  } else {
    pos.y += vel.y;
    vel.y += input.isPressed ? 0.1 : 0.2;
    if (pos.y > 85) {
      pos.y = 86;
      if (input.isPressed) {
        play("jump");
        vel.y = -3;
      } else {
        mode = "run";
      }
    }
  }
  anim += df * (input.isPressed ? 0.1 : 0.2) * (mode === "run" ? 1 : 0.5);
  if (char(addWithCharCode("b", floor(anim % 2)), pos).isColliding.char.a) {
    play("explosion");
    end();
  }
  bx -= vel.x;
  if (bx < -9) {
    bx += 200;
  }
  color("light_black");
  rect(bx, 90, 3, 9);
  color("black");
}
