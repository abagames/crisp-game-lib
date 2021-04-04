title = "INF RANGE";

description = `
[Tap]  Turn 90
[Hold] Turn slow
`;

characters = [];

options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
};

/** @type {{pos:Vector, angle: number, angleVel: number, speed: number }[]} */
let arrows;
let nextArrowTicks;
/** @type Vector */
let pos;
let angle;
let speed;
let tapAngle;
let tapTicks;
let scr;
let multiplier;
/** @type {{pos:Vector, size: Vector}[]} */
let lines;

function update() {
  if (!ticks) {
    arrows = [];
    nextArrowTicks = 200;
    pos = vec(50, 80);
    angle = tapAngle = -PI / 2;
    speed = 1;
    tapTicks = -99;
    scr = vec();
    multiplier = 10.9;
    lines = [];
    for (let i = 0; i < 5; i++) {
      lines.push({ pos: vec(50, i * 20), size: vec(100, 1) });
    }
    for (let i = 0; i < 5; i++) {
      lines.push({ pos: vec(i * 20, 50), size: vec(1, 100) });
    }
  }
  pos.addWithAngle(angle, speed);
  if (pos.x < 40) {
    scr.x = (40 - pos.x) * 0.2;
  } else if (pos.x > 60) {
    scr.x = (60 - pos.x) * 0.2;
  }
  if (pos.y < 40) {
    scr.y = (40 - pos.y) * 0.2;
  } else if (pos.y > 60) {
    scr.y = (60 - pos.y) * 0.2;
  }
  color("light_green");
  for (let i = 0; i < 5; i++) {
    const l = lines[i];
    l.pos.y = wrap(l.pos.y + scr.y, 0, 100);
    box(l.pos, l.size);
  }
  for (let i = 5; i < 10; i++) {
    const l = lines[i];
    l.pos.x = wrap(l.pos.x + scr.x, 0, 100);
    box(l.pos, l.size);
  }
  pos.add(scr);
  color("blue");
  bar(pos, 5, 2, angle);
  particle(pos, 1, speed, angle + PI, 0.2);
  color("green");
  bar(vec(pos).addWithAngle(angle, 4), 3, 2, angle + PI / 2);
  if (input.isJustPressed) {
    play("laser");
    tapAngle = angle;
    tapTicks = ticks;
  }
  if (input.isPressed) {
    angle += 0.02 * difficulty;
    speed += (1 - speed) * 0.1;
  } else {
    speed += (difficulty - speed) * 0.05;
  }
  if (input.isJustReleased) {
    if (ticks - tapTicks < 9) {
      play("select");
      angle = tapAngle + PI / 2;
    }
  }
  arrows = arrows.filter((a) => {
    a.angle += a.angleVel;
    a.pos.addWithAngle(a.angle, a.speed);
    a.pos.add(scr);
    a.pos.wrap(-3, 103, -3, 103);
    color("red");
    const c = bar(a.pos, 5, 2, a.angle).isColliding.rect;
    if (c.blue || c.green) {
      if (!checkCollision(a)) {
        play("powerUp");
        particle(a.pos, 9, (speed + a.speed) * 2);
        addScore(floor(multiplier), a.pos);
        multiplier += 10;
        return false;
      }
    }
    if (rnd() < 0.2) {
      particle(a.pos, 1, a.speed, a.angle + PI, 0.1);
    }
    color("yellow");
    if (
      bar(vec(a.pos).addWithAngle(a.angle, 4), 2, 2, a.angle + PI / 2)
        .isColliding.rect.blue
    ) {
      if (!checkCollision(a)) {
        play("lucky");
        end();
      }
    }
    return true;
  });
  if (arrows.length === 0) {
    nextArrowTicks = 0;
  }
  nextArrowTicks -= sqrt(difficulty);
  if (nextArrowTicks < 0) {
    let p = vec();
    let isApp = false;
    for (let i = 0; i < 9; i++) {
      p.set(rnd(10, 90), rnd(10, 90));
      if (
        abs(wrap(pos.x - p.x, -50, 50)) + abs(wrap(pos.y - p.y, -50, 50)) >
        36
      ) {
        isApp = true;
        break;
      }
    }
    if (isApp) {
      play("hit");
      arrows.push({
        pos: p,
        angle: rnd(PI * 2),
        angleVel: rnds(sqrt(difficulty - 1) * 0.05),
        speed: rnd(1, difficulty) / 2,
      });
      nextArrowTicks = rnd(150, 250);
    }
  }
  multiplier -= 0.02;
  if (multiplier < 10.9) {
    multiplier = 10.9;
  }
  color("black");
  text(`+${floor(multiplier)}`, 3, 97);

  function checkCollision(a) {
    if (abs(wrap(angle + PI - a.angle, -PI, PI)) < 0.7) {
      a.angle += PI;
      a.pos.addWithAngle(a.angle, a.speed * 2);
      angle += PI;
      speed = 1;
      return true;
    } else {
      return false;
    }
  }
}
