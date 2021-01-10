title = "EAROCK";

description = `
[Hold] Thrust
[Tap]  Turn
`;

characters = [
  `
  ll
  ll
llllll
 llll
ll  ll
l    l
`,
];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 4,
};

/** @type {Vector} */
let pos;
/** @type {Vector} */
let vel;
let angle;
let stars;
let starAppTicks;
let addingScore;
let bStars;

function update() {
  if (!ticks) {
    pos = vec(50, 20);
    vel = vec(0.1, 0);
    angle = 0;
    stars = [];
    starAppTicks = 0;
    addingScore = 1;
    bStars = times(36, () => {
      return {
        pos: vec(rnd(99), rnd(99)),
      };
    });
  }
  const c = vec(50, 50);
  const cr = 15;
  const df = sqrt(difficulty);
  color("light_black");
  bStars.forEach((b) => {
    box(b.pos, 1, 1);
  });
  color("blue");
  arc(c, cr - 5, 10);
  color("green");
  arc(c.x + 5, c.y - 3, cr * 0.2, cr * 0.5);
  arc(c.x - 7, c.y + 4, cr * 0.3, cr * 0.5);
  color("red");
  if (input.isJustPressed) {
    play("hit");
    vel.mul(0.5);
    vel.addWithAngle(angle, df * 0.1);
    particle(pos, 9, 2, angle + PI, 0.2);
  }
  if (input.isPressed) {
    vel.addWithAngle(angle, df * 0.01);
    particle(pos, 1, 1, angle + PI, 0.2);
  } else {
    angle = turnTo(angle, c, 0.01);
  }
  if (input.isJustReleased) {
    angle = turnTo(angle, c, 0.2);
    particle(pos, 5, 1, c.angleTo(pos), 0.2);
  }
  vel.mul(0.98);
  pos.add(vel.x * df, vel.y * df);
  if (pos.x < 0) {
    reflect(0);
  }
  if (pos.x > 99) {
    reflect(PI);
  }
  if (pos.y < 0) {
    reflect(PI / 2);
  }
  if (pos.y > 99) {
    reflect(-PI / 2);
  }
  if (pos.distanceTo(c) < cr * 1.1) {
    reflect(c.angleTo(pos));
  }
  color("red");
  bar(pos, 3, 3, angle - 0.2, 1.4);
  bar(pos, 3, 3, angle + 0.2, 1.4);
  color("black");
  bar(pos, 5, 3, angle);
  starAppTicks--;
  if (starAppTicks < 0) {
    const s = {
      pos: vec(c).addWithAngle(rnd(PI * 2), 70),
      vel: vec(),
    };
    s.vel.addWithAngle(
      s.pos.angleTo(c) + rnds(1),
      0.1 + rnd(difficulty - 1) * 0.1
    );
    stars.push(s);
    starAppTicks += 300 / difficulty;
  }
  color("yellow");
  stars = stars.filter((s) => {
    s.pos.add(s.vel);
    s.vel.mul(1 - 0.01 / df);
    s.vel.addWithAngle(s.pos.angleTo(c), 0.0002 * df);
    if (char("a", s.pos).isColliding.rect.black) {
      play("coin");
      addScore(addingScore, s.pos);
      addingScore++;
      return false;
    }
    if (!s.pos.isInRect(-3, -3, 103, 103)) {
      s.pos.add(s.vel.x * 9, s.vel.y * 9);
    }
    if (!s.pos.isInRect(-50, -50, 150, 150)) {
      return false;
    }
    if (s.pos.distanceTo(c) < cr) {
      play("explosion");
      color("red");
      text("X", s.pos);
      color("yellow");
      end();
    }
    return true;
  });
  if (stars.length === 0) {
    starAppTicks = 0;
  }
  color("black");
  text(`+${addingScore}`, 3, 95);

  function turnTo(a, p, v) {
    let at = pos.angleTo(p);
    let o = wrap(a - at, -PI, PI);
    if (abs(o) < v) {
      return at;
    } else if (o > 0) {
      return a - v;
    } else {
      return a + v;
    }
  }
  function reflect(n) {
    const r = wrap(angle + PI - n, -PI, PI);
    if (abs(r) < PI / 2) {
      angle = angle + PI - r * 2;
    }
    const s = vel.length;
    vel.set(0, 0).addWithAngle(angle, s / 2);
    play("select");
    addingScore = 1;
  }
}
