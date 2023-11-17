title = "S OR P";

description = `
[SPACE] SWIPE
`;

characters = [
  `
  lll
 l l ll
  llll
  l  l
 ll  ll
   `,
   `
  lll
 l l ll
  llll
   ll
  l  l
  l  l
   `,
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
];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
};

// var defs
let dates;
let px, pt, pi, pvx;
let gy;
let tgy;
let bi;
let scr;
let isFirstPressing;

function update() {
  if (!ticks) {
    // initalize vars
    dates = [];
    px = 50;
    pt = -1;
    pi = 0;
    pvx = -1;
    gy = 50;
    bi = 0;
    scr = 0.1;
    isFirstPressing = true;
    gy = tgy = 91;
  }

  // targets
  color("black");
  gy += (tgy - gy) * 0.1;
  color("red");
  rect(0, gy, 50, 8);
  color("green");
  rect(50, gy, 50, 8);
  color("white");
  char(":", 5, gy + 4);
  char("(", 10, gy + 4);
  text("PASS", 20, gy + 4);
  char("3", 95, gy + 4);
  char("<", 88, gy + 4);
  text("SMASH", 55, gy + 4);

  // swipe input
  color(pt < 0 ? "red" : "green");
  char(addWithCharCode("a", pt + 1 + (floor(ticks / 30) % 2)), px, 9);
  if (gy <= 12) {
    play("explosion");
    end();
  }
  pi--;
  let speed = 1;
  if (input.isPressed && !isFirstPressing) {
    if (pi < 0) {
      const p = {
        pos: vec(px, 9),
        vel: vec(),
        type: pt,
        prevPos: vec(),
      };
      p.prevPos.set(p.pos);
      dates.push(p);
      pi = 9;
    }
    speed = 0.1;
  }
  px += pvx * difficulty * speed;
  if ((px < 10 && pvx < 0) || (px > 90 && pvx > 0)) {
    pvx *= -1;
  }
  if (input.isJustReleased) {
    if (isFirstPressing) {
      isFirstPressing = false;
    } else {
      pt *= -1;
    }
  }

  // dates spawn
  dates = dates.filter((p) => {
    p.vel.y += 0.2;
    p.vel.mul(0.9);
    p.prevPos.set(p.pos);
    p.pos.add(p.vel);
    color(p.type < 0 ? "red" : "green");
    const c = char(
      addWithCharCode("a", p.type + 1 + (floor(ticks / 30) % 2)),
      p.pos
    ).isColliding.char;

    // romance score
    if (p.pos.y > gy) {
      const isOk = (p.pos.x - 50) * p.type > 0;
      if (isOk) {
        play("explosion");
        addScore(1, p.pos);
        return false;
      } else {
        play("powerUp");
        addScore(-5, p.pos);
        let oy = sqrt(1) * difficulty;
        if (oy > 20) {
          oy = 20;
        }
        tgy -= oy + 10;
        return false;
      }
    }
    return true;
  });
}