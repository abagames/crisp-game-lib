title = "BOMB UP";

description = `
[Tap]
 Throw
 Blast
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
  r
 r
 ll
llll
llll
 ll
  `,
];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 90,
};

/** @type {{pos: Vector, vel: Vector}} */
let player;
/** @type {{pos: Vector, vel: Vector}} */
let bomb;
/** @type {{pos: Vector, ticks: number}} */
let explosion;
/** @type {{pos: Vector, vel: Vector}[]} */
let rocks;
let nextRockTicks;
let nextRockX;
let nextRockVelX;
let wallY;
let multiplier;

function update() {
  if (!ticks) {
    player = { pos: vec(50, 50), vel: vec() };
    bomb = explosion = undefined;
    rocks = [];
    nextRockTicks = 0;
    nextRockX = 80;
    nextRockVelX = 0;
    wallY = 0;
    multiplier = 1;
  }
  let scr = 0;
  if (player.pos.y < 40) {
    scr = (40 - player.pos.y) * 0.3;
  } else if (player.pos.y > 60) {
    scr = (60 - player.pos.y) * 0.2;
  }
  player.vel.y += 0.02;
  if (
    (player.pos.x < 7 && player.vel.x < 0) ||
    (player.pos.x > 93 && player.vel.x > 0)
  ) {
    player.vel.x *= -0.7;
    player.pos.x = clamp(player.pos.x, 7, 93);
  }
  player.vel.mul(0.99);
  player.pos.add(player.vel);
  player.pos.y += scr;
  color("black");
  char(player.vel.y < 0 ? "a" : "b", player.pos, {
    mirror: { x: player.vel.x < 0 ? -1 : 1 },
  });
  if (bomb == null) {
    char("c", player.pos.x + (player.vel.x < 0 ? -2 : 2), player.pos.y);
  }
  if (input.isJustPressed) {
    if (bomb == null) {
      play("select");
      bomb = {
        pos: vec(player.pos.x + (player.vel.x < 0 ? -2 : 2), player.pos.y),
        vel: vec(player.vel.x + (player.vel.x < 0 ? -0.5 : 0.5), player.vel.y),
      };
      multiplier = 1;
    } else if (bomb != null) {
      play("powerUp");
      explosion = { pos: vec(bomb.pos), ticks: 0 };
      color("light_red");
      particle(bomb.pos, 20, 3);
      const d = bomb.pos.distanceTo(player.pos);
      const a = bomb.pos.angleTo(player.pos);
      player.vel.addWithAngle(a, 20 / d);
      bomb = undefined;
    }
  }
  if (bomb != null) {
    if (
      (bomb.pos.x < 7 && bomb.vel.x < 0) ||
      (bomb.pos.x > 93 && bomb.vel.x > 0)
    ) {
      bomb.vel.x *= -0.7;
    }
    bomb.vel.y += 0.15;
    bomb.vel.mul(0.98);
    bomb.pos.add(bomb.vel);
    bomb.pos.y += scr;
    char("c", bomb.pos);
    if (bomb.pos.y > 103) {
      bomb = undefined;
    }
  }
  if (explosion != null) {
    explosion.ticks++;
    const r = sin(explosion.ticks * 0.15) * 25;
    if (r < 0) {
      explosion = undefined;
    } else {
      color("light_red");
      arc(explosion.pos, r);
    }
  }
  nextRockTicks--;
  nextRockVelX += rnds(0.1) * sqrt(difficulty);
  nextRockVelX *= 0.99;
  nextRockX += nextRockVelX;
  if (
    (nextRockX < 7 && nextRockVelX < 0) ||
    (nextRockX > 93 && nextRockVelX > 0)
  ) {
    nextRockVelX *= -0.7;
    nextRockX = clamp(nextRockX, 7, 93);
  }
  if (nextRockTicks < 0) {
    const isBottom = rnd() > (player.pos.y > 30 ? 0.05 : 0.9);
    rocks.push({
      pos: vec(nextRockX, isBottom ? 103 : -3),
      vel: vec(0, isBottom ? -rnd(0.5, sqrt(difficulty)) : player.vel.y / 2),
    });
    nextRockTicks = rnd(8, 10) / difficulty;
  }
  color("red");
  remove(rocks, (r) => {
    r.pos.add(r.vel);
    r.vel.y += 0.01;
    r.vel.mul(0.99);
    r.pos.add(r.vel);
    r.pos.y += scr;
    particle(r.pos, 0.1, r.vel.length * -0.5, r.vel.angle);
    const c = box(r.pos, 5).isColliding;
    if (c.rect.light_red) {
      play("coin");
      addScore(multiplier, r.pos);
      multiplier++;
      particle(r.pos);
      return true;
    } else if (c.char.a || c.char.b) {
      play("explosion");
      end();
    }
    if (r.pos.y < -50 || r.pos.y > 150) {
      return true;
    }
  });
  wallY += scr;
  color("light_black");
  times(18, (i) => {
    box(3, i * 6 + (wallY % 6), 4);
    box(97, i * 6 + (wallY % 6), 4);
  });
}
