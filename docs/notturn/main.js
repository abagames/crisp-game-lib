title = "NOT TURN";

description = `
[Hold]
 Turn & Speed up
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

llllll
l ll l
l ll l
llllll
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

 llll
l ll l
 llll
  ll
 l  l
  `,
  `
  ll
 l ll
 llll
  ll
  `,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 80,
};

/** @type {{pos: Vector}[]} */
let bars;
let nextBarDist;
/**
 * @type {{
 * pos: Vector, vel: Vector, xIndex: number, noTurnDist: number, dotDist: number
 * }[]}
 */
let enemies;
let nextEnemyTicks;
/**
 * @type {{
 * pos: Vector, vel: Vector, xIndex: number, noTurnDist: number, speed: number
 * }}
 */
let player;
let dots;
let multiplier;
const xBarCount = 5;
const xBarInterval = 20;
const xBarPadding = (100 - (xBarCount - 1) * xBarInterval) / 2;

function update() {
  if (!ticks) {
    bars = [];
    nextBarDist = 0;
    enemies = [];
    nextEnemyTicks = 20;
    const xIndex = 2;
    player = {
      pos: vec(xBarPadding + xBarInterval * xIndex, 99),
      vel: vec(0, 1),
      xIndex,
      noTurnDist: 5,
      speed: 1,
    };
    dots = [];
    multiplier = 1;
  }
  let scr;
  if (player.pos.y > 20) {
    scr = (player.pos.y - 20) * 0.1;
  }
  nextBarDist -= scr;
  if (nextBarDist < 0) {
    let i1 = rndi(xBarCount - 1);
    let i2 = rndi(xBarCount - 1);
    bars.push({
      pos: vec(calcBarX(i1) + xBarInterval / 2, 102),
    });
    if (abs(i2 - i1) > 1) {
      bars.push({
        pos: vec(calcBarX(i2) + xBarInterval / 2, 102),
      });
    }
    nextBarDist += rnd(9, 12);
  }
  color("light_black");
  times(xBarCount, (i) => {
    box(calcBarX(i), 50, 3, 100);
  });
  color("light_blue");
  remove(bars, (b) => {
    b.pos.y -= scr;
    box(b.pos, xBarInterval - 3, 3);
    return b.pos.y < -1;
  });
  const sp = clamp(sqrt(difficulty) * player.speed * 0.2, 0, 3);
  player.pos.add(vec(player.vel).mul(sp));
  player.noTurnDist -= player.vel.y * sp;
  let pc;
  if (player.vel.x !== 0) {
    const bx = calcBarX(player.xIndex);
    if ((player.pos.x - bx) * player.vel.x > 0) {
      player.pos.x = bx;
      player.vel.set(0, 1);
    }
    pc = addWithCharCode("a", floor(ticks / (input.isPressed ? 10 : 20)) % 2);
  } else {
    if (player.noTurnDist < 0 && input.isPressed) {
      color("transparent");
      if (
        box(player.pos.x + 6, player.pos.y + 3, 1, 1).isColliding.rect
          .light_blue
      ) {
        play("select");
        player.vel.set(1, 0);
        player.xIndex++;
        player.noTurnDist = 5;
      } else if (
        box(player.pos.x - 6, player.pos.y + 3, 1, 1).isColliding.rect
          .light_blue
      ) {
        play("select");
        player.vel.set(-1, 0);
        player.xIndex--;
        player.noTurnDist = 5;
      }
    }
    pc = addWithCharCode("c", floor(ticks / (input.isPressed ? 10 : 20)) % 2);
  }
  if (input.isJustPressed) {
    play("laser");
  }
  if (input.isJustReleased) {
    play("hit");
  }
  player.speed += ((input.isPressed ? 4 : 1) - player.speed) * 0.2;
  color("black");
  char(pc, player.pos, { mirror: { x: player.vel.x > 0 ? 1 : -1 } });
  player.pos.y -= scr;
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    const xIndex = rndi(xBarCount);
    enemies.push({
      pos: vec(calcBarX(xIndex), 103),
      vel: vec(0, -1),
      xIndex,
      noTurnDist: 0,
      dotDist: 0,
    });
    nextEnemyTicks = rnd(100, 150) / difficulty;
  }
  remove(enemies, (e) => {
    const sp = clamp(sqrt(difficulty) * 0.3, 0, 3);
    e.pos.add(vec(e.vel).mul(sp));
    e.noTurnDist += e.vel.y * sp;
    if (e.vel.x !== 0) {
      const bx = calcBarX(e.xIndex);
      if ((e.pos.x - bx) * e.vel.x > 0) {
        e.pos.x = bx;
        e.vel.set(0, -1);
      }
    } else if (e.noTurnDist < 0) {
      color("transparent");
      if (box(e.pos.x + 6, e.pos.y + 3, 1, 1).isColliding.rect.light_blue) {
        e.vel.set(1, 0);
        e.xIndex++;
        e.noTurnDist = 5;
      } else if (
        box(e.pos.x - 6, e.pos.y + 3, 1, 1).isColliding.rect.light_blue
      ) {
        e.vel.set(-1, 0);
        e.xIndex--;
        e.noTurnDist = 5;
      }
    }
    color("red");
    const c = char("e", e.pos).isColliding.char;
    if (c.a || c.b || c.c || c.d) {
      play("explosion");
      end();
    }
    e.pos.y -= scr;
    e.dotDist -= sp;
    if (e.dotDist < 0) {
      e.dotDist += 6;
      dots.push({ pos: vec(e.pos) });
    }
    if (e.pos.y < -3) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  color("yellow");
  remove(dots, (d) => {
    const c = char("i", d.pos).isColliding.char;
    if (c.a || c.b || c.c || c.d) {
      play("coin");
      addScore(multiplier, d.pos);
      multiplier++;
      return true;
    }
    d.pos.y -= scr;
    return d.pos.y < -3;
  });
  color("black");
  text(`x${multiplier}`, 3, 10);

  function calcBarX(i) {
    return i * xBarInterval + xBarPadding;
  }
}
