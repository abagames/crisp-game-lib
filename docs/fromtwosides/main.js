title = "FROM TWO SIDES";

description = `
[Slide] Move
`;

characters = [
  `
rrrrrr
rRRRRr
 rRRr
 `,
  `
rRRr
 rr
 rr
`,
  `
 G
GgG
 G
`,
];

options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9,
};

/** @type {{pos:Vector, vy: number, wy: -1 | 1}[]} */
let arrows;
let nextArrowTicks;
/** @type {{x: number, vx: number}[]} */
let safes;

function update() {
  if (!ticks) {
    arrows = [];
    nextArrowTicks = [0, 60];
    safes = [
      { x: 50, vx: -1 },
      { x: 50, vx: 1 },
    ];
  }
  safes.forEach((s) => {
    s.x += s.vx;
    if ((s.x < 9 && s.vx < 0) || (s.x > 90 && s.vx > 0)) {
      s.vx *= -1;
    }
    s.vx += rnds(0.5);
    s.vx *= 0.98;
  });
  for (let i = 0; i < 2; i++) {
    nextArrowTicks[i]--;
    if (nextArrowTicks[i] < 0) {
      play("explosion");
      const w = rnd(10, 40) / sqrt(difficulty) + 10;
      times(17, (xi) => {
        const x = xi * 6 + 2;
        let isSafe = false;
        safes.forEach((s) => {
          isSafe = isSafe || abs(x - s.x) < w / 2;
        });
        if (!isSafe) {
          arrows.push({
            pos: vec(x, i === 0 ? -3 : 103),
            vy: 0,
            wy: i === 0 ? 1 : -1,
          });
          addScore(1);
        }
      });
      nextArrowTicks[i] = rnd(60, 90) / sqrt(difficulty);
    }
  }
  const s = difficulty * 2;
  remove(arrows, (a) => {
    a.vy += (a.wy * s - a.vy) * 0.05;
    a.pos.y += a.vy;
    if (a.wy > 0) {
      char("a", a.pos.x, a.pos.y - 1);
      char("b", a.pos.x, a.pos.y + 2);
    } else {
      char("a", a.pos.x, a.pos.y + 1, { mirror: { y: -1 } });
      char("b", a.pos.x, a.pos.y - 2, { mirror: { y: -1 } });
    }
    color("red");
    particle(a.pos, 0.4, -abs(a.vy), (PI / 2) * a.wy, 0.3);
    color("black");
    return a.pos.y < -3 || a.pos.y > 103;
  });
  const x = clamp(input.pos.x, 1, 98);
  const c = char("c", x, 50).isColliding.char;
  if (c.a || c.b) {
    play("powerUp");
    end();
  }
}
