title = "HYPER LASER";

description = `
[Hold] Laser
`;

characters = [
  `
LllllL
lLLLLl
lLLLLl
lLLLLl
lLLLLl
LllllL
`,
  `
  l
  l
ll ll
  l
  l
`,
  `
 yy
ylly
ylly
 yy
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 20,
};

/** @type {{pos: Vector, vel: Vector, ticks: number}[]} */
let lasers;
/** @type {Vector[]} */
let blocks;
let nextBlockDist;
/** @type {{pos: Vector, angle: number, laserTicks: number, hasShield: boolean}} */
let player;
/**
 * @type {{
 * pos: Vector, angle: number, targetAngle: number, turretAngle: number,
 * shotAngle: number, burstTicks: number, burstIndex: number, burstCount: number
 * shotTicks: number, shotInterval: number
 * turnTicks: number
 * }[]}
 */
let enemies;
/** @type {{pos: Vector, vel: Vector}[]} */
let shots;
let nextEnemyDist;
let multiplier;

function update() {
  if (!ticks) {
    lasers = [];
    blocks = [];
    nextBlockDist = 0;
    player = {
      pos: vec(50, 95),
      angle: -PI / 2,
      laserTicks: 0,
      hasShield: false,
    };
    enemies = [];
    shots = [];
    nextEnemyDist = 0;
    multiplier = 1;
  }
  color("light_cyan");
  rect(0, 0, 5, 100);
  rect(95, 0, 5, 100);
  let scr = difficulty * 0.1;
  nextBlockDist -= scr;
  if (nextBlockDist < 0) {
    blocks.push(vec(rnd(8, 92), -9));
    nextBlockDist = rnd(16);
  }
  color("red");
  const sp = input.pos.clamp(1, 99, 1, 99);
  char("b", sp);
  const ta = player.pos.angleTo(sp);
  if (input.isPressed) {
    player.hasShield = false;
    player.laserTicks--;
    if (player.laserTicks < 0) {
      play("laser");
      lasers.push({
        pos: vec(player.pos),
        vel: vec().addWithAngle(ta, sqrt(difficulty) * 3),
        ticks: 0,
      });
      player.laserTicks = 9 / sqrt(difficulty);
    }
  } else {
    player.hasShield = true;
    const x = clamp(input.pos.x, 7, 93);
    const s = sqrt(difficulty) * 0.3;
    if (player.pos.x < x - 1) {
      player.pos.x += s;
      player.angle += wrap(-player.angle, -PI, PI) * 0.1;
    }
    if (player.pos.x > x + 1) {
      player.pos.x -= s;
      player.angle += wrap(PI - player.angle, -PI, PI) * 0.1;
    }
    color("light_blue");
    arc(player.pos, 5, 2, ticks * 0.03, ticks * 0.1 + PI);
    arc(player.pos, 5, 2, ticks * 0.03 + PI, ticks * 0.1 + PI * 2);
  }
  color("black");
  bar(player.pos, 1, 3, player.angle);
  const p = vec(player.pos);
  color("light_black");
  p.addWithAngle(player.angle + PI / 2, 2);
  bar(p, 4, 2, player.angle);
  p.addWithAngle(player.angle + PI / 2, -4);
  bar(p, 4, 2, player.angle);
  color("red");
  bar(player.pos, 2, 2, ta, -0.5);
  color("black");
  remove(blocks, (b) => {
    b.y += scr;
    const c = char("a", b).isColliding;
    if (c.rect.black) {
      particle(b);
      return true;
    }
    return (c.char.a && b.y < -3) || b.y > 103;
  });
  remove(lasers, (l) => {
    l.pos.y += scr;
    const pp = vec(l.pos);
    color("transparent");
    l.pos.add(l.vel);
    let isColliding = false;
    if (
      bar(l.pos.x, pp.y, 5, 2, l.vel.angle).isColliding.char.a ||
      (l.pos.x < 5 && l.vel.x < 0) ||
      (l.pos.x > 95 && l.vel.x > 0)
    ) {
      l.vel.x *= -1;
      isColliding = true;
    }
    if (bar(pp.x, l.pos.y, 5, 2, l.vel.angle).isColliding.char.a) {
      l.vel.y *= -1;
      isColliding = true;
    }
    if (
      !isColliding &&
      bar(l.pos.x, l.pos.y, 5, 2, l.vel.angle).isColliding.char.a
    ) {
      l.vel.x *= -1;
      l.vel.y *= -1;
      isColliding = true;
    }
    if (isColliding) {
      l.pos.set(pp);
      l.pos.add(l.vel);
    }
    // @ts-ignore
    color(["blue", "purple", "cyan", "green"][l.ticks % 4]);
    l.ticks++;
    const c = bar(l.pos, 5, 2, l.vel.angle).isColliding;
    if (c.char.a) {
      return true;
    }
    return l.pos.y < -5 || l.pos.y > 105 || l.ticks > 120 / sqrt(difficulty);
  });
  if (enemies.length === 0) {
    nextBlockDist = 0;
  }
  nextEnemyDist--;
  if (nextEnemyDist < 0) {
    const shotInterval = rnd(60, 120) / sqrt(difficulty);
    enemies.push({
      pos: vec(rnd(10, 90), -9),
      angle: PI / 2,
      targetAngle: PI / 2,
      shotAngle: PI / 2,
      turretAngle: PI / 2,
      burstTicks: 9999,
      burstIndex: 0,
      burstCount: rndi(3, 9),
      shotTicks: rnd(shotInterval),
      shotInterval,
      turnTicks: 0,
    });
    nextEnemyDist = rnd(150, 200) / sqrt(difficulty);
  }
  remove(enemies, (e) => {
    e.pos.y += scr;
    const pp = vec(e.pos);
    let isMoving = false;
    if (abs(wrap(e.angle - e.targetAngle, -PI, PI)) < 0.1) {
      e.angle = e.targetAngle;
      e.pos.addWithAngle(e.angle, sqrt(difficulty) * 0.1);
      isMoving = true;
      e.turnTicks--;
    } else {
      e.angle += wrap(e.targetAngle - e.angle, -PI, PI) * 0.1;
    }
    color("yellow");
    const c = bar(e.pos, 2, 3, e.angle).isColliding;
    const p = vec(e.pos);
    color("light_black");
    p.addWithAngle(e.angle + PI / 2, 2);
    bar(p, 4, 1, e.angle);
    p.addWithAngle(e.angle + PI / 2, -4);
    bar(p, 4, 1, e.angle);
    e.shotTicks--;
    let hasShield = e.shotTicks > 0 && e.pos.y < 70;
    if (hasShield) {
      e.turretAngle = (round(e.pos.angleTo(player.pos) / (PI / 4)) * PI) / 4;
    }
    color("red");
    bar(e.pos, 2, 2, e.turretAngle, -0.5);
    if (e.shotTicks < 0 && e.burstIndex <= 0) {
      e.burstTicks = 0;
      e.burstIndex = e.burstCount;
    }
    e.burstTicks--;
    if (e.burstTicks < 0) {
      shots.push({
        pos: vec(e.pos),
        vel: vec().addWithAngle(e.turretAngle, sqrt(difficulty) * 2),
      });
      e.burstIndex--;
      if (e.burstIndex > 0) {
        e.burstTicks = 20 / sqrt(difficulty);
      } else {
        e.burstTicks = 9999;
        e.shotTicks = e.shotInterval;
      }
    }
    if (
      isMoving &&
      (c.char.a || e.turnTicks < 0 || e.pos.x < 9 || e.pos.x > 90)
    ) {
      e.pos.set(pp);
      e.targetAngle = wrap(
        e.targetAngle + ((rndi(2) * 2 - 1) * PI) / 2,
        -PI,
        PI
      );
      e.turnTicks = rnd(200, 300) / sqrt(difficulty);
    }
    color("light_yellow");
    if (hasShield) {
      arc(e.pos, 4, 2, ticks * 0.03, ticks * 0.1 + PI);
      arc(e.pos, 4, 2, ticks * 0.03 + PI, ticks * 0.1 + PI * 2);
    } else if (c.rect.blue || c.rect.purple || c.rect.cyan || c.rect.green) {
      play("explosion");
      addScore(multiplier * 10, e.pos);
      color("red");
      particle(e.pos, 19, 2);
      return true;
    }
    if (e.pos.y > 99) {
      color("red");
      text("X", e.pos.x, 96);
      play("lucky");
      end();
    }
  });
  color("transparent");
  remove(blocks, (b) => {
    return char("a", b).isColliding.rect.yellow && b.y < -3;
  });
  remove(lasers, (l) => {
    if (bar(l.pos, 5, 2, l.vel.angle).isColliding.rect.light_yellow) {
      play("hit");
      return true;
    }
  });
  color("black");
  remove(shots, (s) => {
    s.pos.y += scr;
    s.pos.add(s.vel);
    const c = char("c", s.pos).isColliding;
    if (!player.hasShield && c.rect.black) {
      play("lucky");
      end();
    }
    if (player.hasShield && c.rect.light_blue) {
      play("powerUp");
      addScore(multiplier, player.pos);
      multiplier++;
      return true;
    }
    return !s.pos.isInRect(5, 0, 90, 100) || c.char.a;
  });
}
