title = "DIVARR";

description = `
[Tap] Fire /
      Split
`;

characters = [
  `
yy
 yy
llllll
llllll
 yy
yy
`,
  `
  rr
  ll
 llll
  ll
y ll y
yyyyyy
`,
  `
   rr
  p
 llll
ll lll
l llll
 llll
`,
  `
 yy
yggy
 bb
y  y
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 3,
};

let shots;
const w = [vec(1, 0), vec(0, 1), vec(-1, 0), vec(0, -1)];
let fallings;
let fallingAddingTicks;
let humanAddingCount;
let firstHumanCount;

function update() {
  if (!ticks) {
    shots = [];
    fallings = [];
    fallingAddingTicks = 0;
    humanAddingCount = 3;
    firstHumanCount = 120;
  }
  const df = sqrt(difficulty);
  rect(0, 90, 99, 9);
  char("b", 50, 87);
  if (input.isJustPressed) {
    if (shots.length === 0) {
      play("laser");
      shots = [
        {
          pos: vec(50, 85),
          angle: 3,
          cc: 0,
        },
      ];
    } else {
      play("select");
      const ns = [];
      shots.forEach((s) => {
        if (shots.length < 16) {
          ns.push({ pos: vec(s.pos), angle: wrap(s.angle - 1, 0, 4), cc: 0 });
          ns.push({ pos: vec(s.pos), angle: wrap(s.angle + 1, 0, 4), cc: 0 });
        } else {
          ns.push({ pos: vec(s.pos), angle: wrap(s.angle + 1, 0, 4), cc: 0 });
        }
      });
      shots = ns;
    }
  }
  shots = shots.filter((s) => {
    s.pos.add(vec(w[s.angle]).mul(df));
    if (!s.pos.isInRect(-2, -2, 104, 90)) {
      return false;
    }
    if (char("a", s.pos, { rotation: s.angle }).isColliding.char.a) {
      s.cc++;
      if (s.cc > 8) {
        return false;
      }
    } else {
      s.cc = 0;
    }
    return true;
  });
  fallingAddingTicks--;
  if (fallingAddingTicks < 0) {
    humanAddingCount--;
    const f = {
      pos: vec(rnd(9, 90), -3),
      vel: vec(),
      isHuman: humanAddingCount < 0,
    };
    if (f.isHuman && firstHumanCount > 0) {
      f.pos.x = 25;
    }
    const t = vec(clamp(f.pos.x + rnds(clamp(df * 10, 0, 50)), 9, 90), 90)
      .sub(f.pos)
      .normalize();
    f.vel = t
      .mul(1 + rnd(df))
      .mul(0.1)
      .mul(f.isHuman ? 1.6 : 1);
    fallings.push(f);
    if (humanAddingCount < 0) {
      humanAddingCount = rndi(3, 15);
    }
    fallingAddingTicks += rnd(60, 80) / difficulty;
  }
  fallings = fallings.filter((f) => {
    f.pos.add(f.vel);
    if (f.isHuman && (firstHumanCount > 0 || f.pos.y < 8)) {
      firstHumanCount--;
      text("Don't", f.pos.x - 10, f.pos.y + 6);
      text("hit me !", f.pos.x - 15, f.pos.y + 12);
    }
    if (f.isHuman && f.pos.y < 20) {
      color("light_black");
      char("d", f.pos);
      color("black");
    } else {
      if (char(f.isHuman ? "d" : "c", f.pos).isColliding.char.a) {
        if (f.isHuman) {
          play("lucky");
          color("red");
          text("X", f.pos);
          color("black");
          end();
        } else {
          play("hit");
          color("red");
          particle(f.pos, 20, 2);
          color("black");
          addScore(shots.length, f.pos);
        }
        return false;
      }
    }
    if (f.pos.y > 88) {
      if (f.isHuman) {
        play("powerUp");
        addScore(100, f.pos);
      } else {
        play("explosion");
        color("red");
        text("X", f.pos);
        color("black");
        end();
      }
      return false;
    }
    return true;
  });
}
