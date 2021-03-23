title = "SNAKE 1";

description = `
[Tap] Turn
`;

characters = [];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9,
};

/** @type { {pos: Vector, angle: number, rotation: number} } */
let head;
let headMoveTicks;
let isHeadGettingDollar;
let isHeadTurning;
/** @type { Vector[] } */
let bodies;
/** @type { Vector[] } */
let dollars;
let wallChars;
let edgeWallChars;
const angleOfs = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
const headChar = [">", "v", "<", "^"];

function update() {
  if (!ticks) {
    color("green");
    head = { pos: vec(8, 8), angle: 0, rotation: 1 };
    headMoveTicks = 0;
    isHeadGettingDollar = false;
    isHeadTurning = false;
    bodies = times(4, (i) => vec(4 + i, 8));
    dollars = [vec(12, 8)];
    wallChars = times(16, () => "#").join("");
    edgeWallChars = `#${times(14, () => " ").join("")}#`;
  }
  text(wallChars, 3, 9);
  for (let y = 1; y <= 13; y++) {
    text(edgeWallChars, 3, 9 + y * 6);
  }
  text(wallChars, 3, 9 + 14 * 6);
  if (!isHeadTurning && input.isJustPressed) {
    play("select");
    isHeadTurning = true;
  }
  headMoveTicks--;
  if (headMoveTicks < 0) {
    play("laser");
    if (!isHeadGettingDollar) {
      bodies.shift();
    } else {
      isHeadGettingDollar = false;
    }
    bodies.push(vec(head.pos));
    if (isHeadTurning) {
      head.angle = wrap(head.angle + head.rotation, 0, 4);
      isHeadTurning = false;
    }
    const ao = angleOfs[head.angle];
    head.pos.add(ao[0], ao[1]);
    headMoveTicks = 20 / difficulty;
  }
  bodies.forEach((b) => {
    text("o", b.x * 6 + 3, b.y * 6 + 3);
  });
  const c = text(
    headChar[wrap(head.angle + head.rotation, 0, 4)],
    head.pos.x * 6 + 3,
    head.pos.y * 6 + 3
  ).isColliding.text;
  if (c.o || c["#"]) {
    play("explosion");
    color("white");
    rect(head.pos.x * 6, head.pos.y * 6, 6, 6);
    color("green");
    text("X", head.pos.x * 6 + 3, head.pos.y * 6 + 3);
    end();
  }
  let ig = false;
  dollars = dollars.filter((d) => {
    const c = text("$", d.x * 6 + 3, d.y * 6 + 3).isColliding.text;
    if (c.v || c[">"] || c["<"] || c["^"]) {
      ig = true;
      return false;
    }
    return true;
  });
  if (ig) {
    play("coin");
    addScore(1);
    isHeadGettingDollar = true;
    head.rotation *= -1;
    color("transparent");
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 99; j++) {
        let x = rndi(2, 14);
        let y = rndi(3, 14);
        const c = text("$", x * 6 + 3, y * 6 + 3).isColliding.text;
        if (c.v || c[">"] || c["<"] || c["^"] || c.o) {
        } else {
          dollars.push(vec(x, y));
          break;
        }
      }
    }
    color("green");
  }
}
