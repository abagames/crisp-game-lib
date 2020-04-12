title = "MONJUM";

description = `
   [Hold] Back
[Release] Jump
`;

characters = [
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
  `
  lll
ll l l
 llll
 l  l
ll  ll
`,
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

const hole = 1,
  mon = 2,
  coin = 4;
let floors, mons, coins, flt, mnt, cnt;
let p, v, jump, fall, item;

function update() {
  if (ticks === 0) {
    floors = [
      {
        x: 0,
        w: 99,
      },
    ];
    mons = [];
    coins = [];
    flt = mnt = cnt = 0;
    p = vec(50, 87);
    v = vec();
    jump = fall = false;
  }
  color("black");
  char(addWithCharCode("a", Math.floor(ticks / 30) % 2), p);
  const fvy = difficulty * 0.5;
  flt -= fvy;
  if (flt < 0) {
    const w = rndi(50, 90);
    floors.push({
      x: 110,
      w,
    });
    flt += 10 + w;
  }
  color("black");
  floors = floors.filter((f) => {
    f.x -= fvy;
    rect(f.x, 90, f.w, 9);
    return f.x + f.w > 0;
  });
  mnt -= difficulty;
  if (mnt < 0) {
    mons.push({ p: vec(99, 87), v: vec(-difficulty * 0.75, 0), jump: false });
    mnt += rnd(200, 300);
  }
  mons = mons.filter((m) => {
    m.p.add(m.v);
    if (m.jump) {
      m.v.y += difficulty * 0.09;
      if (m.p.y > 87) {
        m.p.y = 87;
        m.v.y = 0;
        m.jump = false;
      }
    } else {
      color("transparent");
      if (!box(m.p.x - 4, m.p.y + 6, 6, 6).isColliding.rect.black) {
        m.jump = true;
        m.v.y = -1.4 * sqrt(difficulty);
      }
    }
    color("purple");
    const cl = char(addWithCharCode("c", Math.floor(ticks / 30) % 2), m.p, {
      mirror: { x: -1 },
    }).isColliding.char;
    if (cl.a || cl.b) {
      play("explosion");
      end();
    }
    return m.p.x > -3;
  });
  cnt -= difficulty;
  if (cnt < 0) {
    coins.push({ p: vec(99, 60) });
    cnt += rnd(50, 100);
  }
  color("yellow");
  coins = coins.filter((c) => {
    c.p.x -= difficulty;
    const cl = text("$", c.p).isColliding.char;
    if (cl.a || cl.b) {
      play("laser");
      item |= coin;
      return false;
    }
    return c.p.x > -3;
  });
  color("transparent");
  const c = box(p.x, p.y, 6, 50).isColliding.char;
  if (c.c || c.d) {
    item |= mon;
  }
  const hasHole = !box(p.x, 93, 6, 6).isColliding.rect.black;
  if (hasHole) {
    item |= hole;
  }
  if (fall) {
    v.y += 0.14 * difficulty;
    if (p.y > 99) {
      play("explosion");
      end();
    }
  } else if (jump) {
    v.y += 0.12 * difficulty;
    if (p.y > 87) {
      p.y = 87;
      v.y = 0;
      if (hasHole) {
        fall = true;
      } else {
        jump = false;
        function bitCount(n) {
          n = n - ((n >> 1) & 0x55555555);
          n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
          return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
        }
        const bc = bitCount(item);
        const sc = [0, 1, 5, 20][bc];
        if (sc > 0) {
          play("coin");
          addScore(sc, p);
        }
      }
    }
  } else {
    if (hasHole) {
      fall = true;
    }
    if (input.isPressed) {
      v.x = -0.5 * difficulty;
    } else {
      v.x = 0;
      p.x += (50 - p.x) * 0.02;
    }
    if (input.isJustReleased && ticks > 5) {
      play("jump");
      v.y = -2.5 * sqrt(difficulty);
      jump = true;
      item = 0;
    }
  }
  p.add(v);
  p.x = clamp(p.x, 0, 50);
}
