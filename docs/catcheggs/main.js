title = "catch eggs";
//
description = `
[Tap]
To open mouse
[Using mouse to move]
`;

characters = [
  `
 lll 
ly yl
l   l
l r l
 lll 
`,
  `
 llll 
lc  cl
l    l
l gg l
l gg l
 llll 
`,
`
 r r 
rrrrr
 rrr 
  r   
`
];

const G = {
  WIDTH: 150,
  HEIGHT: 150,
};

options = {
  seed: rndi(1,89),
  isPlayingBgm: true,
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  isReplayEnabled: true,
  theme: "pixel",
  isCapturing: true,
  isCapturingGameCanvasOnly: true,
  captureCanvasScale: 2,
};
console.log(options.seed);

/**
 * @typedef { object } Player - A decorative floating object in the background
 * @property { Vector } pos - The current position of the object
 */
/**
 * @type { Player }
 */
let player;

/**
 * @typedef { object } egg - A decorative floating object in the background
 * @property { Vector } pos - The current position of the object
 * @property { number } vy
 */
/**
 * @type { egg }
 */
/**
 * @type { egg[] }
 */

let eggs;
/**
 * @type { egg[] }
 */
let bad_eggs;

/**
 * @type { number }
 */
let v_up;


function update() {
  if (!ticks) {
    player = { pos: vec(G.WIDTH / 2, (G.HEIGHT * 7) / 8) };
    eggs = [];
    bad_eggs = [];
    v_up = 0;
  }

  player.pos = vec(input.pos.x, player.pos.y);
  player.pos.clamp(10, G.WIDTH - 10, 10, G.HEIGHT - 10);
  color("black");
  char(input.isPressed ? "b" : "a", player.pos);
  if (eggs.length <= 20) {
    const egg = {
      pos: vec(rnd(10, G.WIDTH - 10), 20),
      vy: rnd(0.1, 0.3) * (difficulty + 1) * 0.5 + v_up * 2,
    };
    eggs.push(egg);
  }
  if (bad_eggs.length <= 5 + difficulty) {
    const bad_egg = {
      pos: vec(rnd(player.pos.x - 20, player.pos.x + 20), 20).clamp(
        10,
        G.WIDTH - 10,
        0,
        G.HEIGHT - 10
      ),
      vy: rnd(0.2, 0.3) * difficulty + v_up,
    };
    bad_eggs.push(bad_egg);
  }
  remove(eggs, (egg) => {
    egg.pos.y += egg.vy;
    color("light_yellow");
    const isCollidingWithB = box(egg.pos, 2).isColliding.char.b;
    if (isCollidingWithB) {
      const m = rndi(0, 2) == 0 ? "coin" : "powerUp";
      play(`${m}`);
      color("yellow");
      particle(egg.pos, 4, 1);
      addScore(1, player.pos);
      v_up += 0.01;
      difficulty = difficulty%100 == 0? difficulty + 1 : difficulty;
    }
    return isCollidingWithB || egg.pos.y > G.HEIGHT - 10;
  });
  remove(bad_eggs, (bad_egg) => {
    bad_egg.pos.y += bad_egg.vy;
    color("red");
    const isCollidingWithB = box(bad_egg.pos, 1).isColliding.char.b;
    if (isCollidingWithB) {
      play("explosion");
      color("red");
      particle(bad_egg.pos, 4, 1);
      end();
    }
    return isCollidingWithB || bad_egg.pos.y > G.HEIGHT - 10;
  });
}
