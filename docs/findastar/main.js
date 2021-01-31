title = "FIND A STAR";

description = `
[Tap] Open
`;

characters = [
  `
 lll
l   l
l   l
lllll
l l l
lllll
`,
  `
 lll
l  l
l l
lllll
l   l
lllll
`,
  `
  ll
l ll l
 llll
 llll
 l  l
l    l
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9,
};

const boxCount = 16;
const boxLeftX = 5;
/** @type { {y: number, sx: number, isOpened: boolean[]}[] } */
let boxLines;
let boxLineAddDist;
/** @type { {pos: Vector, vy: number, angle: number, score: number}[] } */
let stars;
let pvy;

function update() {
  if (!ticks) {
    boxLines = [];
    boxLineAddDist = 0;
    stars = [];
    pvy = 0;
  }
  const ibx = floor((input.pos.x - boxLeftX + 3) / 6);
  if (input.isJustPressed && ibx >= 0 && ibx < boxCount) {
    play("laser");
    color("blue");
    rect(boxLeftX + ibx * 6, 0, 1, 99);
    pvy += 2;
  }
  const scr = difficulty * 0.06 + pvy;
  pvy *= 0.07;
  boxLineAddDist -= scr;
  if (boxLineAddDist < 0) {
    play("select");
    boxLines.push({
      y: -3,
      sx: rndi(boxCount),
      isOpened: times(boxCount, () => false),
    });
    boxLineAddDist += 5 + 5 / difficulty;
  }
  let lc = 0;
  let ml = 1;
  boxLines = boxLines.filter((l) => {
    lc++;
    if (l.y < 9) {
      l.y += (9 - l.y) * 0.2;
    } else if (input.isJustPressed && ibx >= 0 && ibx < boxCount) {
      if (ibx === l.sx) {
        play("coin");
        stars.push({
          pos: vec(boxLeftX + ibx * 6, l.y),
          vy: 1,
          angle: 0,
          score: lc * lc * ml,
        });
        ml++;
        return false;
      } else if (ibx > l.sx) {
        for (let i = ibx; i < boxCount; i++) {
          l.isOpened[i] = true;
        }
      } else {
        for (let i = 0; i <= ibx; i++) {
          l.isOpened[i] = true;
        }
      }
    }
    l.y += scr;
    for (let i = 0; i < boxCount; i++) {
      color(l.isOpened[i] ? "light_blue" : "blue");
      char(l.isOpened[i] ? "b" : "a", boxLeftX + i * 6, l.y);
    }
    if (l.y > 97) {
      play("explosion");
      end();
    }
    return true;
  });
  if (boxLines.length === 0) {
    boxLineAddDist = 0;
  }
  color("yellow");
  stars = stars.filter((s) => {
    char("c", s.pos, { scale: { x: cos(s.angle), y: 1 } });
    s.pos.y += s.vy;
    s.vy *= 0.9;
    s.angle += 0.2;
    if (s.angle > PI * 2) {
      play("powerUp");
      addScore(s.score, s.pos);
      return false;
    }
    return true;
  });
}
