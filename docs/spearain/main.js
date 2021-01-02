title = "SPEARAIN";

description = `
[Hold] Slow
`;

characters = [
  `
 l
 l
 l
 l
lll
 l
`,
  `
llll
llll
 l
lll
 lll
l
`,
  `
llll
llll
  l
 lll
lll
   l
`,
];

options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

/** @type { { pos: Vector,speed: number, isBonus: boolean }[]} */
let objs;
let appTicks;
let appRatio;
let bonusAppCount;
let speedRatio;
let x, vx;
let anim;

function update() {
  if (!ticks) {
    objs = [];
    appTicks = 0;
    appRatio = 1;
    bonusAppCount = 0;
    speedRatio = 1;
    x = 50;
    vx = 1;
    anim = 0;
  }
  color("light_blue");
  rect(0, 0, 9, 99);
  rect(90, 0, 9, 99);
  rect(0, 90, 99, 9);
  appTicks -= difficulty;
  if (appTicks < 0) {
    play("laser");
    bonusAppCount--;
    objs.push({
      pos: vec(rnd(12, 88), 2),
      speed: (1 + rnd(sqrt(sqrt(difficulty)))) / (bonusAppCount < 0 ? 3 : 1),
      isBonus: bonusAppCount < 0,
    });
    if (bonusAppCount < 0) {
      bonusAppCount = 12;
    }
    appTicks += rnd(40, 60) / difficulty / appRatio;
  }
  if (input.isJustPressed) {
    speedRatio *= 0.5;
  }
  if (speedRatio < 1 && input.isPressed) {
    speedRatio *= 0.98;
    appRatio *= 1.05;
  } else {
    speedRatio += (1 - speedRatio) * 0.05;
    appRatio = 1;
  }
  if (speedRatio < 0.03 || input.isJustReleased) {
    speedRatio = 1 / sqrt(speedRatio);
  }
  const sr = input.isPressed ? 0.33 : 1;
  objs = objs.filter((o) => {
    let s = o.speed * speedRatio * difficulty;
    if (o.isBonus) {
      color("yellow");
      text("$", o.pos);
      if (s > 78) {
        s *= 0.2;
      }
    } else {
      color("red");
      char("a", o.pos);
      if (s > 74) {
        s *= 1.5;
      }
    }
    o.pos.y += s;
    if (o.pos.y >= 87) {
      play("hit");
    }
    return o.pos.y < 87;
  });
  const s = (vx / sqrt(speedRatio)) * difficulty;
  x += s;
  if ((x < 12 && vx < 0) || (x > 88 && vx > 0)) {
    addScore(1);
    play("select");
    vx *= -1;
  }
  anim += abs(s) * 0.1;
  color("black");
  const cl = char(addWithCharCode("b", floor(anim % 2)), x, 87).isColliding;
  if (cl.text["$"]) {
    play("coin");
    addScore(objs.length, x, 87);
    color("black");
    objs.forEach((o) => {
      particle(o.pos, 5);
    });
    objs = [];
    appRatio = 1;
    appTicks = 60;
  } else if (cl.char.a) {
    play("explosion");
    end();
  }
}
