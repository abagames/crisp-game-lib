title = "LADDER DROP";

description = `
[Tap] Drop
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
llllll
llllll
llllll
llllll
 l  l
 l  l
  `,
  `
llllll
llllll
llllll
llllll
ll  ll
  `,
  `
b    b
bbbbbb
b    b
b    b
bbbbbb
b    b
  `,
  `
LLLLLL
r rr r
r rr r

rr rr
rr rr
  `,
  `
b    b
bbbbbb
b    b
b    b
bbbbbb
b    b
  `,
  `
RRRRRR
rrrrrr
rrrrrr
rrrrrr
rrrrrr
rrrrrr
  `,
  `
 yyy
yYYYy
yYyYy
yYYYy
 yyy
  `,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 19,
};

/**
 * @type {{
 * pos: Vector, size: Vector, lxs: number[],
 * state: "wait" | "drop" | "fix", hasCoin: boolean
 * }[]}
 */
let panels;
let pvx;
let nextPanelX;
let coinPanelCount;
/**
 * @type {{
 * pos: Vector, vx: -1 | 1, state: "walk" | "up" | "down" | "downWalk" | "drop"
 * }}
 */
let player;
let lockCount;
/** @type {Vector[]} */
let coins;
let scr;
let totalScr;
let multiplier;
const coinPanelInterval = 4;

function update() {
  if (!ticks) {
    panels = [
      {
        pos: vec(2, 88),
        size: vec(16, 2),
        lxs: [],
        state: "fix",
        hasCoin: false,
      },
    ];
    pvx = 1;
    nextPanelX = 50;
    coinPanelCount = coinPanelInterval;
    addPanel();
    player = { pos: vec(9, 91), vx: 1, state: "walk" };
    coins = [];
    scr = totalScr = 0;
    multiplier = 1;
    lockCount = 0;
  }
  color("light_blue");
  rect(0, 0, 2, 100);
  rect(98, 0, 2, 100);
  color("black");
  let minY = 99;
  remove(panels, (p) => {
    if (p.state === "wait") {
      p.pos.x += pvx * sqrt(difficulty) * 1.5;
      nextPanelX = p.pos.x;
      if (p.pos.x < -9) {
        pvx *= -1;
        p.pos.x = -9;
      } else if (p.pos.x > 109 - p.size.x * 6) {
        pvx *= -1;
        p.pos.x = 109 - p.size.x * 6;
      }
      drawPanel(p);
      if (input.isJustPressed) {
        play("select");
        p.state = "drop";
      }
    } else if (p.state === "drop") {
      p.pos.y += 6 * sqrt(difficulty);
      color("transparent");
      let cl = drawPanel(p);
      if (cl.e || cl.f) {
        while (cl.e || cl.f) {
          p.pos.y--;
          cl = drawPanel(p);
        }
        p.pos.y = floor(p.pos.y) + (totalScr % 1);
        p.state = "fix";
        if (p.hasCoin) {
          p.hasCoin = false;
          times(p.size.x, (x) => {
            coins.push(vec(p.pos.x + x * 6 + 2, p.pos.y + 2));
          });
        }
        addPanel();
      }
      color("black");
      drawPanel(p);
    } else if (p.state === "fix") {
      p.pos.y += scr;
      color("black");
      drawPanel(p);
      if (p.pos.y < minY) {
        minY = p.pos.y;
      }
    }
    if (p.pos.y > 99) {
      if (p.state === "drop") {
        addPanel();
      }
      return true;
    }
  });
  color("black");
  player.pos.y += scr;
  if (player.state === "walk" || player.state === "downWalk") {
    player.pos.x += player.vx * sqrt(difficulty) * 0.4;
    let c = char(addWithCharCode("a", floor(ticks / 30) % 2), player.pos, {
      mirror: { x: player.vx },
    }).isColliding.char;
    if (c.h) {
      play("explosion");
      end();
    }
    if (c.f || player.pos.x < 5 || player.pos.x > 95) {
      play("laser");
      player.vx *= -1;
      player.pos.x += player.vx * 2;
      lockCount++;
      if (lockCount > 8) {
        player.pos.x = clamp(player.pos.x, 10, 90);
        player.pos.y -= 6;
        lockCount = 0;
        player.state = "drop";
      }
    } else {
      lockCount = 0;
    }
    if (c.e) {
      if (player.state === "walk") {
        player.state = "up";
      }
    } else {
      player.state = "walk";
      color("transparent");
      c = char("a", player.pos.x, player.pos.y + 6).isColliding.char;
      if (!(c.e || c.f)) {
        player.state = "drop";
      }
    }
  } else if (player.state === "up") {
    play("hit");
    player.pos.y -= sqrt(difficulty) * 0.3;
    color("transparent");
    let c = char("c", player.pos).isColliding.char;
    if (!c.e && c.f) {
      player.state = "down";
    } else if (!c.e) {
      let py = player.pos.y;
      while (c.e) {
        py++;
        c = char("c", player.pos.x, py).isColliding.char;
      }
      player.pos.y = floor(py) + (totalScr % 1);
      player.pos.x += player.vx * sqrt(difficulty) * 0.5;
      player.state = "walk";
    }
    color("black");
    char(addWithCharCode("c", floor(ticks / 30) % 2), player.pos);
  } else if (player.state === "down") {
    play("hit");
    player.pos.y += sqrt(difficulty) * 0.4;
    color("transparent");
    let c = char("c", player.pos.x, player.pos.y + 6).isColliding.char;
    if (!c.e && c.f) {
      let py = player.pos.y + 6;
      while (c.f) {
        py--;
        c = char("c", player.pos.x, py).isColliding.char;
      }
      player.pos.y = floor(py) + (totalScr % 1);
      player.state = "downWalk";
    }
    color("black");
    char(addWithCharCode("c", floor(ticks / 30) % 2), player.pos);
  } else {
    player.pos.y += sqrt(difficulty) * 0.5;
    color("transparent");
    let c = char("a", player.pos).isColliding.char;
    if (c.e || c.f) {
      let py = player.pos.y;
      while (!(c.e || c.f)) {
        py--;
        c = char("a", player.pos).isColliding.char;
      }
      player.pos.y = floor(py - 1) + (totalScr % 1);
      player.state = "walk";
    }
    color("black");
    char("a", player.pos, { mirror: { x: player.vx } });
  }
  if (player.pos.y > 99) {
    play("explosion");
    end();
  }
  color("black");
  remove(coins, (c) => {
    c.y += scr;
    const cl = char("i", c).isColliding.char;
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c);
      multiplier++;
      return true;
    }
    if (c.y > 36 && (cl.e || cl.f)) {
      return true;
    }
    if (c.y > 103) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  scr = 0.01 * difficulty;
  if (minY < 30) {
    scr += (30 - minY) * 0.1;
  }
  totalScr += scr;

  function drawPanel(p) {
    const lc = p.state == "fix" ? "e" : "g";
    const fc = p.state == "drop" ? "h" : "f";
    let c;
    let li = 0;
    let cl = {};
    times(p.size.x, (x) => {
      times(p.size.y, (y) => {
        c = undefined;
        if (y === 0 && p.hasCoin) {
          c = "i";
        } else if (y >= 1 && li < p.lxs.length && x === p.lxs[li]) {
          c = lc;
        } else if (y === 1) {
          c = fc;
        }
        if (c != null) {
          const clc = char(c, p.pos.x + x * 6 + 3, p.pos.y + y * 6 + 3)
            .isColliding.char;
          cl = { ...cl, ...clc };
        }
      });
      if (x === p.lxs[li]) {
        li++;
      }
    });
    return cl;
  }

  function addPanel() {
    const size = vec(rndi(4, 8), rndi(3, 6));
    let lx = -1;
    let nd = rndi(1, 5);
    const lxs = [];
    while (lx < size.x) {
      lx += nd;
      lxs.push(lx);
      lx += rndi(2, 5);
    }
    let hasCoin = false;
    coinPanelCount--;
    if (coinPanelCount === 0) {
      coinPanelCount = coinPanelInterval;
      hasCoin = true;
    }
    panels.push({
      pos: vec(clamp(nextPanelX, 2, 98 - size.x * 6), 0),
      size,
      lxs,
      state: "wait",
      hasCoin,
    });
  }
}
