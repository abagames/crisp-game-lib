title = "SCAFFOLD";

description = `
[Tap]
 Change angle
[Hold]
 Scaffold 
`;

characters = [
  `
    ll
   lll
  ll
 ll
ll
l
`,
  `




llllll
llllll
`,
  `
l
ll
 ll
  ll
   lll
    ll
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
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 100,
};

/** @type {{pos: Vector, type: number}[]} */
let floors;
/** @type {Vector} */
let nextFloorPos;
let nextFloorType;
let tv;
let pressedCount;
/** @type {Vector} */
let wall;
/**
 * @type {{
 * pos: Vector, vy: number, d: number, distance: number, type: "spike" | "gold"
 * }[]}
 */
let objs;
let nextObjDist;
/** @type {Vector} */
let player;
let multiplier;

function update() {
  if (!ticks) {
    floors = times(9, (i) => {
      return { pos: vec(i * 6 + 3, 52), type: 1 };
    });
    nextFloorPos = vec(9 * 6 + 3, 52);
    nextFloorType = 0;
    tv = 1;
    pressedCount = 0;
    wall = vec(-9, 0);
    objs = [];
    nextObjDist = 0;
    player = vec(5, 50);
    multiplier = 1;
  }
  let scr = difficulty * 0.05;
  if (nextFloorPos.x > 40) {
    scr += (nextFloorPos.x - 40) * 0.1;
  }
  wall.x -= scr;
  color("red");
  if (wall.x < -6) {
    let wy = 47;
    for (let i = 0; i < 9; i++) {
      const y = 47 + rndi(-9, 9) * 4;
      if (abs(y - nextFloorPos.y) < 25) {
        wy = y;
        break;
      }
    }
    wall.set(6 - (nextFloorPos.x % 6) + 120, wy);
    objs.push({
      pos: vec(wall.x + 4, wall.y + 4),
      vy: 0.1,
      d: 2,
      distance: 4,
      type: "gold",
    });
    color("purple");
    rect(100, 0, 40, 100);
    color("red");
    nextObjDist += 30;
  }
  rect(wall.x + 3, 0, 2, wall.y - 12);
  rect(wall.x + 3, wall.y + 18, 2, 100 - 18 - wall.y);
  rect(0, -7, 100, 9);
  rect(0, 98, 100, 9);
  if (input.isJustReleased) {
    play("laser");
    if (
      (nextFloorType === 0 && tv === -1) ||
      (nextFloorType === 2 && tv === 1)
    ) {
      tv *= -1;
    }
    nextFloorType += tv;
  }
  if (input.isPressed) {
    pressedCount++;
    if (pressedCount > 15 / sqrt(difficulty)) {
      play("select");
      floors.push({
        pos: vec(
          nextFloorPos.x,
          nextFloorPos.y + (nextFloorType === 2 ? 4 : 0)
        ),
        type: nextFloorType,
      });
      nextFloorPos.add(6, nextFloorType * 4 - 4);
      pressedCount = 0;
    }
  } else {
    pressedCount = 0;
  }
  color("black");
  remove(floors, (f) => {
    f.pos.x -= scr;
    char(addWithCharCode("a", f.type), f.pos);
    return f.pos.x < -3;
  });
  color("cyan");
  nextFloorPos.x -= scr;
  char(
    addWithCharCode("a", nextFloorType),
    nextFloorPos.x,
    nextFloorPos.y + (nextFloorType === 2 ? 4 : 0)
  );
  let vx = 0;
  if (player.x < 20) {
    vx += (20 - player.x) * 0.2;
  }
  player.x += vx - scr;
  if (
    char(addWithCharCode("d", floor(ticks / 15) % 2), player).isColliding.rect
      .red
  ) {
    play("explosion");
    end();
  }
  color("transparent");
  let type;
  for (let i = 0; i < 9; i++) {
    const c = box(player.x + 4, player.y, 1, 6).isColliding.char;
    if (c.a) {
      type = 0;
      player.y--;
    } else if (c.b) {
      type = 1;
      player.y--;
    } else if (c.c) {
      type = 2;
      player.y--;
    } else {
      if (type != null) {
        break;
      }
      player.y++;
    }
  }
  if (type === 0) {
    player.y += 4;
  }
  nextObjDist -= scr;
  if (nextObjDist < 0) {
    const type = rnd() < 0.5 ? "gold" : "spike";
    const distance = rnd(20, 60) / (type === "gold" ? 4 : 1.5);
    const wy = rnds(20) * (type === "gold" ? 1 : 1.5);
    objs.push({
      pos: vec(120, clamp(nextFloorPos.y + rnds(20), 10, 90)),
      d: distance / 2,
      distance,
      vy: rnds(1, sqrt(difficulty)) * 0.3,
      type,
    });
    nextObjDist = rnd(15, 25);
  }
  remove(objs, (o) => {
    o.pos.x -= scr;
    o.pos.y += o.vy;
    o.d -= abs(o.vy);
    if (o.d < 0) {
      o.d = o.distance;
      o.vy *= -1;
    }
    color(o.type === "gold" ? "yellow" : "red");
    const c = text(o.type === "gold" ? "$" : "x", o.pos).isColliding;
    if (o.distance > 4 && c.rect.purple) {
      return true;
    }
    if (c.char.d || c.char.e) {
      if (o.type === "gold") {
        play("coin");
        addScore(multiplier, o.pos);
        multiplier++;
        return true;
      } else {
        play("explosion");
        end();
      }
    }
    if (o.pos.x < -3) {
      if (o.type === "gold" && multiplier > 1) {
        play("hit");
        multiplier--;
      }
      return true;
    }
  });
}
