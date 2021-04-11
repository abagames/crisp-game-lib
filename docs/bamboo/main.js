title = "BAMBOO";

description = `
[Tap]  Turn
[Hold] Through
`;

characters = [
  `
  ll
  l  l
lpppp
  prrr
 r
r
`,
  `
   ll
   l  
lpppp
 rp  l
r  r
    r
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/** @type {{x: number, height: number, speed: number}[]} */
let bamboos;
let nextBambooTicks;
let x;
let vx;
let avx;
let animTicks;
let speedBambooTicks;

function update() {
  if (!ticks) {
    bamboos = [];
    nextBambooTicks = 0;
    x = 190;
    vx = 1;
    avx = 0;
    animTicks = 0;
    speedBambooTicks = 5;
  }
  color("black");
  if (input.isJustPressed) {
    play("select");
    vx *= -1;
  }
  x = wrap(x + vx * difficulty * (1 + avx), -3, 203);
  avx *= 0.9;
  animTicks += difficulty;
  char(
    input.isPressed ? "b" : addWithCharCode("a", floor(animTicks / 20) % 2),
    x,
    87,
    {
      mirror: { x: vx },
    }
  );
  nextBambooTicks--;
  if (nextBambooTicks < 0) {
    speedBambooTicks--;
    bamboos.push({
      x: rnd(5, 195),
      height: 0,
      speed: speedBambooTicks < 0 ? 2 : 1,
    });
    nextBambooTicks = rnd(70, 100) / difficulty;
    speedBambooTicks = rndi(4, 7);
  }
  remove(bamboos, (b) => {
    b.height += b.speed * difficulty * 0.14;
    let h = b.height / 4;
    let y = 90 - h / 2;
    if (h < 1) {
      y += (1 - h) * 3;
      h = 1;
    }
    let c = {};
    times(4, (i) => {
      color(
        b.height < 5
          ? "light_yellow"
          : b.height > 50
          ? "green"
          : b.height > 25
          ? i % 2 === 0
            ? "green"
            : "light_green"
          : b.height > 23
          ? "yellow"
          : i % 2 === 0
          ? "yellow"
          : "light_yellow"
      );
      c = { ...c, ...box(b.x, y, (4 - i) * 2, ceil(h)).isColliding.char };
      y -= h;
    });
    if ((c.a || c.b) && !input.isPressed) {
      if (b.height < 5) {
      } else if (b.height <= 25) {
        let s = ceil((b.height - 5) / 3);
        if (s === 7) {
          s = 10;
          play("powerUp");
        } else {
          play("coin");
        }
        addScore(s * s, b.x, 90 - b.height);
        return true;
      } else {
        play("hit");
        b.speed *= 0.6;
        b.height *= 0.7;
        avx++;
        if (avx > 5) {
          avx = 5;
        }
        vx *= -1;
        particle(
          b.x,
          87,
          9,
          difficulty * (1 + avx) * 0.5,
          vx > 0 ? 0 : PI,
          0.4
        );
        if (b.height <= 25) {
          play("explosion");
          return true;
        }
      }
    }
    if (b.height > 50) {
      b.speed *= 0.997;
    }
    if (b.height >= 89) {
      color("red");
      text("X", b.x, 3);
      play("lucky");
      end();
    }
  });
  color("purple");
  rect(0, 90, 200, 10);
}
