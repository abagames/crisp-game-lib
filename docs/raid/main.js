title = "RAID";

description = `
[Hold]
 Speed up
[Release]
 Bomb
`;

characters = [
  `
ll
lllll
llllll
`,
  `
lll
lll
lll
lll
 l
`,
];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 400,
};

/**
 * @type {{
 * pos: Vector, vel: Vector, speed: number, downDist: number, bombVy: number,
 * }}
 */
let ship;
/** @type {{pos: Vector, vel: Vector}} */
let bomb;
/** @type {{height:number}[]} */
let buildings;
/** @type {{pos: Vector, vy: number}[]} */
let fallings;
/** @type {{pos: Vector, size: number}[]} */
let clouds;
let nextCloudDist;

function update() {
  if (!ticks) {
    ship = {
      pos: vec(50, 15),
      vel: vec(1, 0),
      speed: 1,
      downDist: 0,
      bombVy: 0,
    };
    bomb = undefined;
    buildings = times(8, (i) => {
      return {
        height: rnd(10, 60),
      };
    });
    fallings = [];
    clouds = [];
    times(3, () => {
      addClouds(rnd(10, 90));
    });
    nextCloudDist = 0;
  }
  let scr = 0;
  if (ship.pos.y > 15) {
    scr += (ship.pos.y - 15) * 0.05;
  }
  nextCloudDist -= scr * 0.3;
  if (nextCloudDist < 0) {
    addClouds();
    nextCloudDist = rnd(20, 40);
  }
  color("light_blue");
  remove(clouds, (c) => {
    c.pos.y -= scr * 0.3;
    box(c.pos, c.size);
    return c.pos.y < -9;
  });
  if (input.isPressed) {
    ship.speed += 0.01;
  } else {
    ship.speed += (1 - ship.speed) * 0.2;
    if (bomb == null && ticks > 30 && input.isJustReleased) {
      play("powerUp");
      bomb = { pos: vec(ship.pos), vel: vec(ship.vel).mul(ship.speed) };
      ship.bombVy = 0.33;
    }
  }
  ship.pos.add(vec(ship.vel).mul(ship.speed));
  if (ship.vel.y === 0) {
    if (
      (ship.pos.x < 10 && ship.vel.x < 0) ||
      (ship.pos.x > 90 && ship.vel.x > 0)
    ) {
      play("select");
      ship.vel.y = 0.1;
      ship.downDist = difficulty;
    }
  } else {
    ship.vel.x += ((ship.pos.x < 50 ? 1 : -1) - ship.vel.x) * 0.05;
    ship.downDist -= ship.vel.y * ship.speed;
    if (ship.downDist < 0) {
      ship.vel.set(ship.pos.x < 50 ? 1 : -1, 0);
    }
  }
  ship.pos.y += ship.bombVy - scr;
  ship.bombVy *= 0.8;
  color("black");
  char(ship.vel.y === 0 ? "a" : "b", ship.pos, {
    mirror: { x: ship.vel.x < 0 ? -1 : 1 },
  });
  if (bomb != null) {
    bomb.vel.y += 0.1;
    bomb.vel.mul(0.99);
    bomb.pos.add(bomb.vel);
    bomb.pos.y -= scr;
    color("red");
    bar(bomb.pos, 3, 3, bomb.vel.angle);
    if (
      (bomb.pos.x < 0 && bomb.vel.x < 0) ||
      (bomb.pos.x > 99 && bomb.vel.x > 0)
    ) {
      bomb.vel.x *= -1;
    }
    if (bomb.pos.y > 99) {
      bomb = undefined;
    }
  }
  color("light_black");
  fallings.forEach((f) => {
    f.vy += 0.1;
    f.pos.y += f.vy - scr;
    rect(f.pos, 9, 10);
    return f.pos.y > 110;
  });
  buildings.forEach((b, i) => {
    b.height += scr;
    const x = i * 10 + 10;
    let c = ceil(b.height / 10);
    let y = 100 - b.height + c * 10;
    let isDestroyed = false;
    let multiplier = 1;
    times(c, () => {
      if (isDestroyed) {
        play("hit");
        fallings.push({ pos: vec(x, y), vy: -multiplier * 0.5 });
        addScore(multiplier, x + 5, y);
        multiplier++;
        y -= 10;
        return;
      }
      // @ts-ignore
      color(["green", "yellow", "purple", "cyan"][(i * 17) % 4]);
      const c = rect(x, y, 9, 10).isColliding;
      color("white");
      rect(x + 1, y + 1, 7, 3);
      rect(x + 1, y + 6, 7, 3);
      if (c.rect.red) {
        play("explosion");
        addScore(multiplier, x + 5, y);
        multiplier++;
        isDestroyed = true;
        b.height = 100 - y;
        color("red");
        particle(x + 5, y + 5, 19, 2);
        bomb = undefined;
      }
      if (c.rect.light_black) {
        play("hit");
        b.height = 100 - y;
        color("red");
        particle(x + 5, y + 5);
      }
      if (c.char.a || c.char.b) {
        play("explosion");
        end();
      }
      y -= 10;
    });
  });

  function addClouds(y = 110) {
    let x = rnd(-10, 90);
    const c = rndi(2, 5);
    times(c, () => {
      const size = rnd(7, 12);
      clouds.push({ pos: vec(x, y + rnds(3)), size });
      x += size * rnd(0.4, 0.6);
    });
  }
}
