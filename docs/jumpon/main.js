title = "JUMP ON";

description = `
[Tap] Jump on
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
l ll l
l ll l
llllll
 l  l
 l  l
  `,
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
  `
  lll
ll l l
 llll
 l  l
ll  ll
`,
  `
 llll
l ll l
 llll
  ll
 l  l
 l  l
`,
  `


  ll
 l ll
 llll
  ll
`,
  `


llllll


`,
  `


ll  ll
  ll

`,
  `


l    l
 l  l
  ll
`,
  `

  ll
ll  ll


`,
  `
  ll
 l  l
l    l


`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 1,
};

/**
 * @type {{
 * pos: Vector, hole:any, nextDotsDist: number,
 * state: "up" | "down" | "walk" | "jumpTo" | "jumpFrom"
 * }[]}
 * */
let enemies;
let groupEnemyCount;
let nextGroupTicks;
let nextEnemyTicks;
/** @type {{x: number, animTicks: number}[]} */
let holes;
let nextHoleDist;
/**
 * @type {{
 * pos: Vector, hole:any,
 * state: "up" | "down" | "walk" | "jumpTo" | "jumpFrom"
 * }}
 * */
let player;
/** @type {{pos: Vector}[]} */
let dots;
let multiplier;

function update() {
  if (!ticks) {
    enemies = [];
    groupEnemyCount = 0;
    nextGroupTicks = 0;
    nextEnemyTicks = 0;
    holes = [
      { x: 30, animTicks: 99 },
      { x: 60, animTicks: 99 },
    ];
    nextHoleDist = 0;
    player = { pos: vec(5, 87), hole: undefined, state: "walk" };
    dots = [];
    multiplier = 1;
  }
  color("light_yellow");
  rect(0, 90, 100, 10);
  times(5, (i) => {
    rect(0, 90 - (i + 1) * 12, 100, 3);
  });
  color("light_purple");
  rect(0, 10, 100, 10);
  let scr = difficulty * 0.03;
  if (player.pos.x > 15) {
    scr += (player.pos.x - 15) * 0.1;
  }
  nextHoleDist -= scr;
  if (nextHoleDist < 0) {
    holes.push({ x: 104, animTicks: 99 });
    nextHoleDist += rnd(30, 45);
  }
  remove(holes, (h) => {
    h.x -= scr;
    color("white");
    box(h.x, 60, 8, 80);
    color("black");
    h.animTicks += difficulty;
    const ai =
      h.animTicks < 21 ? [1, 2, 1, 0, 3, 4, 3][floor(h.animTicks / 3)] : 0;
    char(addWithCharCode("h", ai), h.x, 90);
    return h.x < -4;
  });
  nextGroupTicks--;
  if (nextGroupTicks < 0) {
    nextEnemyTicks = 0;
    groupEnemyCount = rndi(1, 1 + round(sqrt(difficulty) * 2));
    nextGroupTicks = (groupEnemyCount * 8 + rnd(100, 110)) / difficulty;
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    enemies.push({
      pos: vec(103, 87 - rndi(6) * 12),
      hole: undefined,
      state: "walk",
      nextDotsDist: rnd(6),
    });
    groupEnemyCount--;
    if (groupEnemyCount === 0) {
      nextEnemyTicks = 9999;
    } else {
      nextEnemyTicks = rnd(8, 10) / difficulty;
    }
  }
  color("red");
  remove(enemies, (e) => {
    if (e.state === "walk") {
      e.pos.x += -difficulty - scr;
      holes.forEach((h) => {
        const o = e.pos.x - h.x;
        if (o < 8 && o > 0) {
          play("laser");
          e.state = "jumpTo";
          e.hole = h;
        }
      });
      char("e", e.pos, { mirror: { x: -1 } });
    } else if (e.state === "jumpTo") {
      e.pos.x += -difficulty - scr;
      const o = e.pos.x - e.hole.x;
      e.pos.y += o < 4 ? 1 : -1;
      if (o <= 0) {
        e.state = "down";
      }
      char("d", e.pos, { mirror: { x: -1 } });
    } else if (e.state === "down") {
      e.pos.x = e.hole.x;
      e.pos.y += difficulty;
      if (e.pos.y > 90) {
        play("hit");
        e.state = "up";
        e.hole.animTicks = 0;
      }
      char("f", e.pos);
    } else if (e.state === "up") {
      e.pos.x = e.hole.x;
      e.pos.y -= difficulty;
      if (e.pos.y < 23) {
        e.state = "down";
      }
      const o = e.pos.y - player.pos.y;
      if (o < 1 && o > -9) {
        e.state = "jumpFrom";
        e.pos.y = ceil((e.pos.y - 90) / 12) * 12 + 87;
      }
      char("f", e.pos);
    } else if (e.state === "jumpFrom") {
      e.pos.x += -difficulty - scr;
      const o = e.hole.x - e.pos.x;
      e.pos.y += o < 4 ? -1 : 1;
      if (o >= 8) {
        play("laser");
        e.state = "walk";
        e.pos.y = round((e.pos.y - 90) / 12) * 12 + 87;
        multiplier = 1;
      }
      char("d", e.pos, { mirror: { x: -1 } });
    }
    if (e.state === "walk") {
      e.nextDotsDist -= difficulty;
      if (e.nextDotsDist < 0) {
        dots.push({ pos: vec(e.pos) });
        e.nextDotsDist += 6;
      }
    }
    return e.pos.x < -3;
  });
  color("black");
  if (player.state === "walk") {
    player.pos.x += difficulty - scr;
    holes.forEach((h) => {
      const o = h.x - player.pos.x;
      if (o < 8 && o > 0) {
        play("jump");
        player.state = "jumpTo";
        player.hole = h;
      }
    });
    const c = char(addWithCharCode("a", floor(ticks / 10) % 2), player.pos)
      .isColliding.char;
    if (c.e) {
      play("explosion");
      end();
    }
  } else if (player.state === "jumpTo") {
    player.pos.x += difficulty - scr;
    const o = player.hole.x - player.pos.x;
    player.pos.y += o < 4 ? 1 : -1;
    if (o <= 0) {
      player.state = "down";
    }
    char("a", player.pos);
  } else if (player.state === "down") {
    player.pos.x = player.hole.x;
    player.pos.y += difficulty;
    if (player.pos.y > 90) {
      play("powerUp");
      player.state = "up";
      player.hole.animTicks = 0;
    }
    char("c", player.pos);
  } else if (player.state === "up") {
    player.pos.x = player.hole.x;
    player.pos.y -= difficulty;
    if (player.pos.y < 23) {
      player.state = "down";
    }
    if (input.isPressed) {
      play("jump");
      player.state = "jumpFrom";
      player.pos.y = ceil((player.pos.y - 90) / 12) * 12 + 87;
    }
    char("c", player.pos);
  } else if (player.state === "jumpFrom") {
    player.pos.x += difficulty - scr;
    const o = player.pos.x - player.hole.x;
    player.pos.y += o < 4 ? -1 : 1;
    if (o >= 8) {
      player.state = "walk";
      player.pos.y = round((player.pos.y - 90) / 12) * 12 + 87;
    }
    char("a", player.pos);
  }
  if (player.pos.x < 0) {
    play("explosion");
    end();
  }
  color("yellow");
  remove(dots, (d) => {
    d.pos.x -= scr;
    const c = char("g", d.pos).isColliding.char;
    if (c.a || c.b) {
      play("coin");
      addScore(multiplier, d.pos);
      multiplier++;
      return true;
    }
    return d.pos.x < -3;
  });
}
