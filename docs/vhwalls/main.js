title = "VH WALLS";

description = `
[Tap] Place wall
`;

characters = [
  `
ll
ll
ll
ll
ll
ll
`,
  `
llllll
llllll
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

/** @type {{pos: Vector, angle: number, isFixed: boolean}[]} */
let walls;
let nextWallAngle;
/** @type {{pos: Vector, vel: Vector}} */
let ball;
/** @type {{pos: Vector, size: number, initTicks: number}} */
let target;

function update() {
  if (!ticks) {
    walls = [
      { pos: vec(1, 50), angle: 0, isFixed: true },
      { pos: vec(99, 50), angle: 0, isFixed: true },
      { pos: vec(50, 1), angle: 1, isFixed: true },
      { pos: vec(50, 99), angle: 1, isFixed: true },
    ];
    nextWallAngle = 0;
    ball = { pos: vec(50, 50), vel: vec(1, 1) };
    target = { pos: vec(50, 50), size: 0, initTicks: 0 };
    setTarget();
  }
  ball.pos.x += ball.vel.x * sqrt(difficulty);
  ball.pos.y += ball.vel.y * sqrt(difficulty);
  ball.pos.clamp(1, 99, 1, 99);
  color("green");
  box(ball.pos, 5);
  color(nextWallAngle === 0 ? "light_blue" : "light_cyan");
  char(addWithCharCode("a", nextWallAngle), 45, 6);
  if (input.isJustPressed && input.pos.isInRect(1, 1, 98, 98)) {
    play("select");
    walls.unshift({
      pos: vec(input.pos),
      angle: nextWallAngle,
      isFixed: false,
    });
    nextWallAngle = wrap(nextWallAngle + 1, 0, 2);
  }
  if (target.initTicks > 0) {
    color("purple");
    arc(target.pos, target.size);
    target.initTicks++;
    target.size += (5 - target.size) * 0.2;
    if (target.initTicks > 16) {
      target.initTicks = 0;
    }
  } else {
    color("red");
    const c = arc(target.pos, target.size).isColliding.rect;
    if (c.green) {
      play("coin");
      particle(target.pos, 20, 3);
      addScore(walls.length - 4, target.pos);
      setTarget();
    }
    target.size += 0.02 * difficulty;
  }
  remove(walls, (w) => {
    //@ts-ignore
    color(`${w.isFixed ? "light_" : ""}${w.angle === 0 ? "blue" : "cyan"}`);
    const wd = w.isFixed ? 100 : 20;
    const c = box(w.pos, w.angle === 0 ? 2 : wd, w.angle === 0 ? wd : 2)
      .isColliding.rect;
    if (!w.isFixed && (c.purple || c.blue || c.cyan)) {
      particle(w.pos);
      return true;
    }
    if (c.red) {
      play("explosion");
      color("purple");
      text("X", w.pos);
      if (w.angle === 0) {
        text("X", w.pos.x, target.pos.y);
      } else {
        text("X", target.pos.x, w.pos.y);
      }
      end();
    }
    if (c.green) {
      play("hit");
      if (w.angle === 0) {
        ball.vel.x *= -1;
        ball.pos.x = w.pos.x + ball.vel.x * 4;
      } else {
        ball.vel.y *= -1;
        ball.pos.y = w.pos.y + ball.vel.y * 4;
      }
    }
  });

  function setTarget() {
    target.size = 20;
    target.initTicks = 1;
    const p = vec(target.pos);
    for (let i = 0; i < 9; i++) {
      target.pos.set(rnd(20, 80), rnd(20, 80));
      if (target.pos.distanceTo(p) > 40) {
        break;
      }
    }
  }
}
