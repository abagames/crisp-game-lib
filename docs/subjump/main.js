title = "SUB JUMP";

description = `
[Hold]
 Go up & 
 Speed up
`;

characters = [
  `
   ll
   l
  lll
l l l
llllll
l lll
`,
  `
   ll
   l
  lll
  l l
llllll
  lll
`,
  `
 llll
ll lll
ll lll
ll lll
ll lll
 llll
`,
];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 4,
};

/** @type {Vector[]} */
let points;
/** @type {"sea" | "land"} */
let landForm;
let nextLandFormDist;
let lvy;
/** @type {{pos: Vector, vel: Vector}} */
let sub;
/** @type {Vector[]} */
let coins;
let nextCoinDist;
let multiplier;

function update() {
  if (!ticks) {
    points = times(12, (i) => vec(i * 10 - 10, rnd(75, 85)));
    landForm = "sea";
    nextLandFormDist = 50;
    lvy = 0;
    sub = { pos: vec(5, 60), vel: vec() };
    coins = [];
    nextCoinDist = 0;
    multiplier = 1;
  }
  const sd = sqrt(difficulty);
  let scr = 0;
  if (sub.pos.x > 10) {
    scr += (sub.pos.x - 10) * 0.2;
  }
  nextLandFormDist -= scr;
  let gp = points[points.length - 1];
  points.forEach((p, i) => {
    p.x -= scr;
    const pp = points[wrap(i - 1, 0, 12)];
    if (p.x < -10) {
      if (nextLandFormDist < 0) {
        landForm = landForm === "land" ? "sea" : "land";
        nextLandFormDist =
          rnd(200, 300) / (landForm === "land" ? 7 / sqrt(difficulty) : 1);
      }
      p.x += 120;
      lvy += rnds(sd) * 2;
      lvy *= 0.95;
      if (landForm === "sea") {
        if (pp.y < 55) {
          lvy += 5;
        } else if (pp.y < 65) {
          lvy += 3;
        } else if ((pp.y < 65 && lvy < 0) || (pp.y > 90 && lvy > 0)) {
          lvy *= -0.5;
        }
        p.y = pp.y + lvy;
        if (nextLandFormDist < 60) {
          lvy += 4;
        }
      } else {
        if (pp.y > 50) {
          lvy -= 5;
        } else if ((pp.y < 40 && lvy < 0) || (pp.y > 45 && lvy > 0)) {
          lvy *= -0.5;
        }
        p.y = pp.y + lvy / 3;
      }
      p.y = clamp(p.y, 35, 95) + rnds(5);
    }
    if (pp.x < p.x) {
      color(pp.y < 50 || p.y < 50 ? "green" : "purple");
      line(pp, p, 2);
    } else {
      gp = pp;
    }
  });
  color("blue");
  rect(0, 50, 100, 2);
  if (input.isJustPressed) {
    play("select");
  }
  if (input.isPressed) {
    if (sub.pos.y > 50) {
      sub.vel.y -= sd * 0.06;
      sub.vel.x += (1 * sd - sub.vel.x) * 0.1;
    } else {
      sub.vel.y += sd * 0.01;
      sub.vel.x += (1 * sd - sub.vel.x) * 0.1;
    }
  } else {
    if (sub.pos.y > 50) {
      sub.vel.y += sd * 0.03;
      sub.vel.x += (0.5 * sd - sub.vel.x) * 0.1;
    } else {
      sub.vel.y += sd * 0.05;
      sub.vel.x += (0.5 * sd - sub.vel.x) * 0.1;
    }
  }
  let py = sub.pos.y;
  sub.vel.mul(sub.pos.y > 50 ? 0.95 : 0.99);
  sub.pos.add(sub.vel);
  sub.pos.x -= scr;
  color("blue");
  if (py > 50 && sub.pos.y < 50) {
    play("jump");
    particle(sub.pos.x, 50, 9, 1, -PI / 2, PI);
  }
  if (py < 50 && sub.pos.y > 50) {
    play("hit");
    particle(sub.pos.x, 50, 9, 0.5, -PI / 2, PI);
  }
  color("black");
  const c = char(
    sub.pos.y < 50 ? "a" : addWithCharCode("a", floor(ticks / 7) % 2),
    sub.pos
  ).isColliding.rect;
  if (c.purple || c.green) {
    play("explosion");
    end();
  }
  if (sub.pos.y > 55) {
    color("blue");
    particle(sub.pos.x - 3, sub.pos.y + 1, 0.3, 1, PI, 0.1);
  }
  nextCoinDist -= scr;
  if (nextCoinDist < 0) {
    coins.push(vec(gp.x, gp.y - (gp.y < 50 ? rnd(5, 10) : rnd(10, 20))));
    nextCoinDist = rnd(10, 40);
  }
  color("yellow");
  remove(coins, (c) => {
    c.x -= scr;
    const cl = char("c", c).isColliding.char;
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c);
      multiplier++;
      return true;
    }
    if (c.x < -3) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
}
