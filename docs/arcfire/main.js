title = "ARCFIRE";

description = `
[Hold]
  Set arc
[Release]
  Fire
`;

characters = [
  `
  ll
  l  l
 llll
l l  
  lll
 l 
`,
  `
  ll
l l
 llll
  l  l
llll
    l
`,
  ``,
  `
 llll
  l  
 lllll
l l  
  lll
 l 
`,
  `
 llll
  l
lllll
  l  l
llll
    l
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
  theme: "crt",
};

let pos;
let moveAngle;
let moveDist;
let angle;
let arcFrom;
let arcTo;
let shots;
let isPressing;
let enemies;
let enemyAddAngle;
let enemyAddTicks;
let multiplier;

function update() {
  if (!ticks) {
    pos = vec(50, 50);
    angle = 0;
    shots = [];
    isPressing = false;
    moveAngle = 0;
    moveDist = 0;
    enemies = [];
    enemyAddAngle = rnd(PI * 2);
    enemyAddTicks = 0;
  }
  if (moveDist > 1) {
    pos.add(vec(moveDist * 0.2).rotate(moveAngle));
    moveDist *= 0.2;
    if (!pos.isInRect(10, 10, 90, 90)) {
      moveAngle += PI;
    }
    pos.clamp(10, 90, 10, 90);
  }
  angle += 0.07 * difficulty;
  color("light_blue");
  arc(50, 50, 7, 4);
  color("light_black");
  line(pos, vec(9).rotate(angle).add(pos), 2);
  color("black");
  char(addWithCharCode("a", floor(ticks / 30) % 2), pos, {
    mirror: { x: cos(moveAngle) < 0 ? -1 : 1 },
  });
  let range = 0;
  if (isPressing) {
    arcTo = angle;
    range = 300 / sqrt((arcTo - arcFrom) * 30);
    color("green");
    line(pos, vec(range).rotate(arcFrom).add(pos));
    line(pos, vec(range).rotate(arcTo).add(pos));
    arc(pos, range, 3, arcFrom, arcTo);
  }
  if (isPressing && arcTo - arcFrom > PI) {
    isPressing = false;
  }
  if (isPressing && input.isJustReleased) {
    isPressing = false;
    if (shots.length === 0) {
      play("select");
      shots.push({ pos, d: 0, range, arcFrom, arcTo });
    }
    moveAngle = (arcTo + arcFrom) / 2;
    moveDist = range / 2;
  }
  if (input.isJustPressed) {
    play("laser");
    arcFrom = angle;
    isPressing = true;
    multiplier = 1;
  }
  color("cyan");
  shots = shots.filter((s) => {
    s.d += 2;
    arc(pos, s.d, 5, s.arcFrom, s.arcTo);
    return s.d < s.range;
  });
  enemyAddTicks -= difficulty;
  if (enemyAddTicks < 0) {
    const p = vec(70).rotate(enemyAddAngle).add(50, 50);
    const v = vec(rnd(10))
      .rotate(rnd(PI * 2))
      .add(50, 50)
      .sub(p)
      .div(500 / rnd(1, difficulty));
    enemies.push({ p, v });
    enemyAddTicks += rnd(40, 60);
    if (rnd() < 0.1) {
      enemyAddAngle = rnd(PI * 2);
    } else {
      enemyAddAngle += rnds(0.05);
    }
  }
  color("red");
  enemies = enemies.filter((e) => {
    e.p.add(e.v);
    const c = char(addWithCharCode("d", floor(ticks / 30) % 2), e.p, {
      mirror: { x: cos(e.v.angle) < 0 ? -1 : 1 },
    }).isColliding;
    if (c.rect.cyan) {
      play("powerUp");
      particle(e.p);
      addScore(multiplier, e.p);
      multiplier++;
      return false;
    }
    if (c.char.a || c.char.b || c.rect.light_blue) {
      if (c.rect.light_blue) {
        text("X", vec(e.p).sub(50, 50).div(2).add(50, 50));
      } else {
        text("X", pos);
      }
      play("lucky");
      end();
    }
    return true;
  });
}
