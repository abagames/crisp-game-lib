title = "BOARDING";

description = `
[Hold] Boarding
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
  `
     l
    ll
   ll
  ll
 ll
ll
`,
  `
l
ll
 ll
  ll
   ll
    ll
`,
  `
  l
 l
lllll
 l
  l
`,
  `
  l
   l
lllll
   l
  l
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

let boards;
let passengers;
let px, pt, pi, pvx;
let gy;
let tgy;
let bi;
let scr;
let isFirstPressing;

function update() {
  if (!ticks) {
    boards = [];
    passengers = [];
    px = 50;
    pt = -1;
    pi = 0;
    pvx = -1;
    gy = 50;
    bi = 0;
    scr = 0.1;
    isFirstPressing = true;
    while (gy < 91) {
      addBoard();
      gy += 2;
    }
    gy = tgy = 91;
  }
  color("black");
  boards = boards.filter((b) => {
    b.pos.y -= scr * difficulty;
    char(addWithCharCode("e", b.angle), b.pos);
    return b.pos.y > 15 && b.pos.y < gy;
  });
  tgy -= scr * difficulty;
  if (tgy < 11) {
    tgy = 11;
  }
  gy += (tgy - gy) * 0.1;
  color("red");
  rect(0, gy, 50, 8);
  color("blue");
  rect(50, gy, 50, 8);
  color("white");
  char("a", 5, gy + 4);
  char("g", 12, gy + 4);
  text("GATE1", 20, gy + 4);
  char("c", 95, gy + 4);
  char("h", 88, gy + 4);
  text("GATE2", 55, gy + 4);
  if (bi < 0) {
    addBoard();
    bi += 4;
  }
  color(pt < 0 ? "red" : "blue");
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
        bc: 0,
      };
      p.prevPos.set(p.pos);
      passengers.push(p);
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
  passengers = passengers.filter((p) => {
    p.vel.y += 0.2;
    p.vel.mul(0.9);
    p.prevPos.set(p.pos);
    p.pos.add(p.vel);
    color(p.type < 0 ? "red" : "blue");
    const c = char(
      addWithCharCode("a", p.type + 1 + (floor(ticks / 30) % 2)),
      p.pos
    ).isColliding.char;
    if (c.e || c.f) {
      const a = wrap(p.pos.angleTo(p.prevPos), -PI, PI);
      let ra;
      if (c.e) {
        ra = a < -PI / 4 || a > (PI / 4) * 3 ? (-PI / 4) * 3 : PI / 4;
      } else {
        ra = a < (-PI / 4) * 3 || a > PI / 4 ? (PI / 4) * 3 : -PI / 4;
      }
      const v = vec(p.vel.length * 2).rotate(ra);
      p.vel.add(v);
      p.pos.add(p.vel);
      p.pos.add(p.vel);
      p.bc++;
    }
    if (p.pos.y < 0 && p.vel.y < 0) {
      p.vel.y *= -0.5;
    }
    if ((p.pos.x < 0 && p.vel.x < 0) || (p.pos.x > 99 && p.vel.x > 0)) {
      p.vel.x *= -1;
    }
    if (p.pos.y > gy) {
      const isOk = (p.pos.x - 50) * p.type > 0;
      if (isOk) {
        if (p.bc > 0) {
          play("powerUp");
          addScore(p.bc, p.pos);
          const oy = p.bc * 2 * difficulty;
          tgy += oy;
          bi -= oy;
          if (tgy > 91) {
            tgy = 91;
          }
        } else {
          addScore(0, p.pos);
        }
        return false;
      } else {
        play("hit");
        addScore(-1 - p.bc, p.pos);
        let oy = sqrt(1 + p.bc) * difficulty;
        if (oy > 20) {
          oy = 20;
        }
        tgy -= oy;
        return false;
      }
    }
    return true;
  });
}

function addBoard() {
  const pos = vec(rnd(9, 90), gy - 3);
  if (boards.some((b) => b.pos.distanceTo(pos) < 16)) {
    return;
  }
  boards.push({
    pos,
    angle: rndi(2),
  });
}
