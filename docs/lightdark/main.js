title = "LIGHT DARK";

description = `
[Tap] Jump
[Hold] Fly
`;

characters = [
  `
    ll
   l
  l
  ll
 l  l
l    l
`,
  `
  ll
  l
  l
  ll
  ll
 l  l
`,
  `
  ll
  ll
 llll
 llll
llllll
llllll
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

/** @type {{x: number, type: "spike" | "coin", side: "light" | "dark" }[]} */
let objs;
let objDists;
let objTypes;
let pos;
let vel;
let state;
let side;
let multiplier;
let scx;

function update() {
  if (!ticks) {
    objs = [];
    for (let i = 0; i < 10; i++) {
      objs.push({
        x: i < 5 ? 25 + i * 9 : 99 + i * 9,
        type: "coin",
        side: i < 5 ? "light" : "dark",
      });
    }
    objDists = [200, 300];
    objTypes = ["coin", "spike"];
    pos = vec(9, 0);
    side = "light";
    vel = vec(2);
    state = "ground";
    multiplier = 1;
    scx = 0;
  }
  const scr = vel.x * difficulty;
  color("light_black");
  rect(0, 50, 200, 50);
  if (state === "ground") {
    if (input.isJustPressed) {
      side = side === "light" ? "dark" : "light";
      play(side === "light" ? "jump" : "laser");
      vel.y = 3 * sqrt(difficulty);
      pos.y = 7;
      state = "jump";
      scx = 0;
    }
  } else {
    if (input.isJustPressed) {
      play("hit");
      side = side === "light" ? "dark" : "light";
    }
    vel.y -= (input.isPressed ? 0.1 : 0.5) * difficulty;
    pos.y += vel.y;
    if (pos.y < 0) {
      pos.y = 0;
      state = "ground";
    }
  }
  const y = side === "light" ? 47 - pos.y : 53 + pos.y;
  color(side === "light" ? "black" : "white");
  const ch =
    state === "jump"
      ? "b"
      : addWithCharCode("a", floor((ticks * difficulty) / 10) % 2);
  const c = char(ch, pos.x, y, side === "light" ? {} : { mirror: { y: -1 } })
    .isColliding;
  objs = objs.filter((o) => {
    const y = o.side === "light" ? 46 : 54;
    color(o.side === "light" ? "black" : "white");
    let c;
    if (o.type === "spike") {
      c = char("c", o.x, y, o.side === "light" ? {} : { mirror: { y: -1 } })
        .isColliding;
    } else {
      c = text("o", o.x, y, o.side === "light" ? {} : { mirror: { y: -1 } })
        .isColliding;
    }
    if (c.char.a || c.char.b) {
      if (o.type === "spike") {
        play("explosion");
        end();
      } else {
        play(o.side === "light" ? "coin" : "select");
        addScore(multiplier, o.x + scx * 7, y);
        multiplier++;
        scx++;
        return false;
      }
    }
    o.x -= scr;
    if (o.x < -3) {
      if (o.type === "coin" && multiplier > 1) {
        multiplier--;
      }
      return false;
    }
    return true;
  });
  for (let i = 0; i < 2; i++) {
    objDists[i] -= scr;
    const side = i === 0 ? "light" : "dark";
    const o = objTypes[i] === "coin" ? 9 : 6;
    const c = objTypes[i] === "coin" ? rndi(4, 8) : rndi(5, 15);
    if (objDists[i] < 0) {
      for (let j = 0; j < c; j++) {
        objs.push({ x: 200 + j * o, type: objTypes[i], side });
      }
      objDists[i] = c * o + rnd(40, 120);
      objTypes[i] = objTypes[i] === "coin" ? "spike" : "coin";
    }
  }
}
