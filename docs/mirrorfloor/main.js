title = "MIRROR FLOOR";

description = `
[Tap]  Jump
[Hold] Speed up
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
 llll
ll lll
ll lll
ll lll
ll lll
 llll
 `,
];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5,
};

/** @type {{pos: Vector, width: number}[]} */
let floors;
let nextFloorDist;
/** @type {Vector[]} */
let coins;
/**
 * @type {{
 * y: number, my: number, vy: number, speed: number,
 * side: 1 | -1, state: "run" | "jump"
 * }} */
let player;
let multiplier = 1;
const playerX = 9;

function update() {
  if (!ticks) {
    floors = [{ pos: vec(10, 50), width: 80 }];
    nextFloorDist = 0;
    coins = [vec(60, 47)];
    player = { y: 10, my: 0, vy: 0, speed: 1, side: 1, state: "jump" };
    multiplier = 1;
  }
  const scr = difficulty * 0.5 * player.speed;
  if (player.state === "run") {
    if (input.isJustPressed) {
      play("powerUp");
      player.vy = -1.5 * sqrt(difficulty) * player.side;
      player.state = "jump";
    }
  }
  if (player.state === "jump") {
    player.vy += 0.07 * difficulty * player.side;
    player.y += player.vy;
  }
  if (input.isPressed) {
    player.speed += (2 - player.speed) * 0.05;
  } else {
    player.speed += (1 - player.speed) * 0.2;
  }
  if (
    (player.y < 0 && player.side === -1) ||
    (player.y > 99 && player.side === 1)
  ) {
    play("lucky");
    end();
  }
  color("black");
  char(addWithCharCode("a", floor(ticks / 15) % 2), playerX, player.y, {
    mirror: { y: player.side },
  });
  nextFloorDist -= scr;
  if (nextFloorDist < 0) {
    const f = { pos: vec(100, rnd(10, 90)), width: rnd(45, 75) };
    floors.push(f);
    let cx = rnd(20, 25);
    while (cx < f.width - 20) {
      coins.push(vec(100 + cx, f.pos.y - 3));
      cx += rnd(15, 30);
    }
    nextFloorDist += f.width + rnd(10, 20);
  }
  let isOnFloor = false;
  remove(floors, (f) => {
    f.pos.x -= scr;
    color(player.side === 1 ? "cyan" : "light_cyan");
    const c1 = rect(f.pos, f.width, 1).isColliding.char;
    color(player.side === -1 ? "cyan" : "light_cyan");
    const c2 = rect(f.pos.x, f.pos.y + 1, f.width, 1).isColliding.char;
    if ((c1.a || c1.b || c2.a || c2.b) && player.vy * player.side > 0) {
      play("laser");
      player.state = "run";
      player.y = f.pos.y + (player.side === 1 ? -3 : 5);
    }
    if (f.pos.x - 3 < playerX && playerX < f.pos.x + f.width + 3) {
      player.my = f.pos.y - (player.y - f.pos.y) + 2;
      color("light_black");
      char(addWithCharCode("a", floor(ticks / 15) % 2), playerX, player.my, {
        // @ts-ignore
        mirror: { y: -player.side },
      });
      isOnFloor = true;
    }
    return f.pos.x < -f.width;
  });
  if (!isOnFloor) {
    player.state = "jump";
  }
  remove(coins, (c) => {
    c.x -= scr;
    color(player.side === 1 ? "yellow" : "light_yellow");
    const cl = char("c", c).isColliding.char;
    color(player.side === 1 ? "light_yellow" : "yellow");
    char("c", c.x, c.y + 8);
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c);
      multiplier++;
      player.side *= -1;
      player.vy *= -1;
      player.y = player.my;
      return true;
    }
    if (c.x < -3) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
}
