title = "BOTTOP";

description = `
[Tap]  Jump
[Hold] Fly
`;

characters = [
  `
  ll
  l
 llll
l l
 l  l
l  l
`,
  `
  ll
  l
 lll
  l
  ll
 ll
`,
  `
  ll
l l  l
 llll
  l
 l lll
l   
`,
  `
ll  ll
 llll
llllll
llllll
  ll
  ll
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
  theme: "pixel",
};

let y;
let vy;
let isJumping;
let spikes;
let spikeAddDist;
let scrolling;

function update() {
  if (!ticks) {
    y = vy = 0;
    isJumping = false;
    spikes = [];
    spikeAddDist = 0;
    scrolling = 1;
  }
  scrolling = difficulty;
  score += scrolling / 10;
  spikeAddDist -= scrolling;
  if (spikeAddDist < 0) {
    const y = rnd() < 0.33 ? (rnd() < 0.5 ? 8 : 92) : rnd(8, 92);
    spikes.push({ p: vec(103, y) });
    spikeAddDist += rnd(30, 60);
  }
  color("red");
  spikes = spikes.filter((s) => {
    s.p.x -= scrolling;
    char("d", s.p, { rotation: floor(ticks / 10) });
    return s.p.x > -3;
  });
  if (!isJumping && input.isPressed) {
    play("powerUp");
    isJumping = true;
    vy = 3;
  }
  if (isJumping) {
    vy -= input.isPressed ? 0.1 : 0.3;
    y += vy;
    if (y < 0) {
      y = 0;
      isJumping = false;
    }
  }
  color("black");
  const c = isJumping ? "c" : addWithCharCode("a", floor(ticks / 15) % 2);
  if (
    char(c, 9, 8 + y, { mirror: { y: -1 } }).isColliding.char.d ||
    char(c, 9, 92 - y).isColliding.char.d
  ) {
    play("explosion");
    end();
  }
  color("light_blue");
  rect(0, 0, 99, 5);
  rect(0, 95, 99, 5);
}
