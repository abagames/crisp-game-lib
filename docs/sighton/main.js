title = "SIGHT ON";

description = `
[Tap] Fire
`;

characters = [
  `
 llll
l ll l
l ll l
 llll
ll  ll
ll  ll
`,
  `
ll  ll
l    l
  ll
  ll
l    l
ll  ll
`,
];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7,
};

/** @type {{pos: Vector, vel: Vector, sink: Vector, target: any}[]} */
let enemies;
let currentEnemy;
let enemyCount;
let nextEnemyInterval;
let nextEnemyTicks;
let nextTargetTicks;
/** @type {{pos: Vector, vel: Vector}[]} */
let targets;
/** @type {{pos: Vector, ticks: number}[]} */
let explosions;
/** @type {{pos: Vector, vel: Vector}} */
let sight;
let multiplier;
let sightDownY;
/** @type {{pos: Vector, color: Color, ticks: number}[]} */
let stars;

function update() {
  if (!ticks) {
    enemies = [];
    currentEnemy = undefined;
    enemyCount = 0;
    nextEnemyInterval = 0;
    nextEnemyTicks = 0;
    nextTargetTicks = 0;
    targets = [];
    explosions = [];
    sight = { pos: vec(50, 50), vel: vec() };
    multiplier = 1;
    sightDownY = 0;
    // @ts-ignore
    stars = times(30, () => {
      return {
        pos: vec(rnd(99), rnd(99)),
        color: ["cyan", "green", "black"][rndi(3)],
        ticks: rndi(999),
      };
    });
  }
  stars.forEach((s) => {
    s.ticks++;
    if (s.ticks % 150 < 100) {
      color(s.color);
      box(s.pos, 1);
      s.pos.y += sqrt(difficulty) * 0.5;
      if (s.pos.y > 99) {
        s.pos.x = rnd(99);
        s.pos.y = -rnd(9);
      }
    }
  });
  color("light_red");
  rect(0, 90, 100, 10);
  nextTargetTicks--;
  if (nextTargetTicks < 0) {
    play("select");
    const sd = sqrt(difficulty);
    const t = {
      pos: vec(rnd(20, 80), 0),
      vel: vec(rnds(sd) * 0.1, sd * 0.1),
    };
    targets.push(t);
    currentEnemy = {
      pos: vec(rnd(10, 90), -5),
      vel: vec(rnds(1, 2), rnds(1, 2)),
      sink: vec(rnd(0.02, 0.07), rnd(0.02, 0.07)),
      target: t,
    };
    enemyCount = rndi(2, 5);
    nextEnemyInterval = rnd(3, 9) / sqrt(difficulty);
    nextEnemyTicks = 0;
    nextTargetTicks = rnd(120, 150) / difficulty;
  }
  remove(targets, (t) => {
    t.pos.add(t.vel);
    t.pos.x = wrap(t.pos.x, 0, 99);
    return t.pos.y > 150;
  });
  currentEnemy.pos.add(currentEnemy.target.vel);
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    enemies.push({
      pos: vec(currentEnemy.pos),
      vel: vec(currentEnemy.vel),
      sink: vec(currentEnemy.sink),
      target: currentEnemy.target,
    });
    nextEnemyTicks = nextEnemyInterval;
    enemyCount--;
    if (enemyCount === 0) {
      nextEnemyTicks = 9999;
    }
  }
  if (enemies.length === 0 && enemyCount === 0) {
    nextTargetTicks = 0;
  }
  let maxY = 0;
  let sightEnemy;
  color("yellow");
  remove(explosions, (e) => {
    const s = cos(e.ticks * 0.05) * 15;
    e.ticks++;
    if (s < 0) {
      return true;
    }
    box(e.pos, s);
  });
  color("red");
  remove(enemies, (e) => {
    e.vel.x += wrap(e.target.pos.x - e.pos.x, -50, 50) * e.sink.x;
    e.vel.y += (e.target.pos.y - e.pos.y) * e.sink.y;
    e.vel.mul(0.997);
    e.pos.x += e.vel.x * (sqrt(difficulty) - 0.8);
    e.pos.y += e.vel.y * (sqrt(difficulty) - 0.8);
    e.pos.x = wrap(e.pos.x, 0, 99);
    if (char("a", e.pos).isColliding.rect.yellow) {
      play("hit");
      particle(e.pos);
      addScore(multiplier, e.pos.x, clamp(e.pos.y, 20, 99));
      multiplier++;
      return true;
    }
    if (e.pos.y > maxY) {
      sightEnemy = e;
      maxY = e.pos.y;
    }
    if (e.pos.y > 90) {
      play("lucky");
      end();
    }
  });
  sight.vel.x +=
    //@ts-ignore
    wrap((sightEnemy == null ? 50 : sightEnemy.pos.x) - sight.pos.x, -50, 50) *
    0.01;
  sight.vel.y +=
    //@ts-ignore
    ((sightEnemy == null ? 50 : sightEnemy.pos.y) - sight.pos.y) * 0.01;
  sight.vel.mul(0.97);
  sight.pos.x += sight.vel.x * (sqrt(difficulty) - 0.8);
  sight.pos.y += sight.vel.y * (sqrt(difficulty) - 0.8);
  sight.pos.x = wrap(sight.pos.x, 0, 99);
  color("black");
  char("b", sight.pos);
  if (input.isJustPressed) {
    play("explosion");
    multiplier = 1;
    line(0, 90, sight.pos, 1);
    line(99, 90, sight.pos, 1);
    explosions.push({ pos: vec(sight.pos), ticks: 0 });
    targets.forEach((t) => {
      t.pos.y += sightDownY;
    });
    sightDownY++;
    sight.vel.mul(0.1);
  }
  sightDownY *= 0.99;
}
