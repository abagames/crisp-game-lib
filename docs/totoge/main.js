title = "TOTOGE";

description = `
[Tap] Jump
`;

characters = [
  `
 r r
 lll l
yl lll
 lllll
  llyl
     y
`,
  `
 r r
 lll
yl ll
 lllll
 yl ll
y
`,
  `
  rr
  rr
 rRRr
 rRRr
rRRRRr
rrrrrr
`,
];

options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5,
};

/** @type {Vector} */
let pos;
/** @type {Vector} */
let vel;
/** @type {{pos:Vector, c: string}[]} */
let spikes;
let spikeAddDist;
let nextSpikeX;
let nextSpikeVx;
let scr;
/** @type {Vector[]} */
let walls;
let nextWallY;

function update() {
  if (!ticks) {
    spikes = [];
    spikeAddDist = 0;
    nextSpikeX = 10;
    nextSpikeVx = 1;
    pos = vec(50, 9);
    vel = vec(0.33, 0);
    scr = 0;
    walls = [];
    for (let i = -10; i < 10; i++) {
      walls.push(vec(5, i * 10 + 5));
      walls.push(vec(95, i * 10 + 5));
    }
    nextWallY = 105;
  }
  while (nextWallY < 105) {
    addScore(1);
    walls.push(vec(5, nextWallY));
    walls.push(vec(95, nextWallY));
    nextWallY += 10;
  }
  nextWallY -= scr;
  color("light_blue");
  walls = walls.filter((w) => {
    w.y -= scr;
    box(w, 8, 8);
    return w.y > -99;
  });
  spikeAddDist -= scr;
  if (spikeAddDist < 0) {
    play("laser");
    const width = rndi(2, 5);
    spikes.push({
      pos: vec(clamp(nextSpikeX, 12, 93 - width * 6), 199),
      c: times(width, () => "c").join(""),
    });
    spikeAddDist = rnd(99, 199);
    nextSpikeX += nextSpikeVx * width * 6;
    if (
      (nextSpikeX < 9 && nextSpikeVx < 0) ||
      (nextSpikeX > 90 && nextSpikeVx > 0)
    ) {
      nextSpikeVx *= -1;
    }
  }
  color("black");
  spikes = spikes.filter((s) => {
    s.pos.y -= scr;
    char(s.c, s.pos.x, clamp(s.pos.y, -99, 99));
    return s.pos.y > -99;
  });
  color("transparent");
  const cp = vec(pos);
  for (let i = 0; i < clamp(vel.y / 6, 1, 99); i++) {
    if (char("a", cp).isColliding.char.c) {
      play("lucky");
      end();
    }
    cp.y -= 6;
  }
  color("black");
  char(vel.y > 0 ? "a" : "b", pos, { mirror: { x: vel.x > 0 ? -1 : 1 } });
  pos.x += vel.x * difficulty;
  pos.y += vel.y * difficulty - scr;
  if (pos.y < 10) {
    scr = (pos.y - 10) * 0.5;
  } else if (pos.y > 30) {
    scr = (pos.y - 30) * 0.5;
  }
  vel.y += 0.05;
  if ((pos.x < 9 && vel.x < 0) || (pos.x > 90 && vel.x > 0)) {
    vel.x *= -1;
  }
  if (vel.y > 0 && nextWallY < 150 && input.isJustPressed) {
    play("jump");
    const s = vel.y * vel.y * difficulty * difficulty;
    if (s > 10) {
      addScore(s, pos);
    }
    vel.y = -1;
  }
}
