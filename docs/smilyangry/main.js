title = "SMILY ANGRY";

description = `
[Tap] Turn
`;

characters = [
  `
 llll
l ll l
 llll 
l ll l
ll  ll
 llll
`,
  `
 llll
l ll l
llllll
ll  ll
l ll l
 llll
`,
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
];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/**
 * @type {{
 * pos: Vector, targetPos: Vector,
 * fireInterval: number, fireSpeed: number, fireTicks: number
 * isSmile: boolean, isRed: boolean
 * }[]}
 */
let smiles;
/** @type {{pos: Vector, vel:Vector, isRed: boolean, isBonus: boolean}[]} */
let bullets;
/** @type {{pos: Vector, vx: 1 | -1, speed: number}}  */
let player;
let multiplier;

function update() {
  if (!ticks) {
    smiles = [
      {
        pos: vec(30, 20),
        targetPos: vec(30, 20),
        fireInterval: 30,
        fireSpeed: 1,
        fireTicks: 20,
        isSmile: true,
        isRed: true,
      },
      {
        pos: vec(70, 20),
        targetPos: vec(70, 20),
        fireInterval: 30,
        fireSpeed: 1,
        fireTicks: 50,
        isSmile: false,
        isRed: false,
      },
    ];
    bullets = [];
    player = { pos: vec(50, 90), vx: 1, speed: 1 };
    multiplier = 1;
  }
  color("light_black");
  rect(0, 93, 100, 7);
  smiles.forEach((s) => {
    s.pos.x += (s.targetPos.x - s.pos.x) * 0.1;
    s.pos.y += (s.targetPos.y - s.pos.y) * 0.1;
    s.fireTicks--;
    if (s.fireTicks < 0) {
      fire(s.pos, s.fireSpeed, s.isSmile, s.isRed);
      s.fireTicks = s.fireInterval;
    }
    const changeRatio = 0.002 * sqrt(difficulty);
    if (rnd() < changeRatio) {
      s.targetPos.set(rnd(10, 90), rnd(10, 40));
    }
    if (rnd() < changeRatio) {
      s.isSmile = !s.isSmile;
    }
    if (rnd() < changeRatio) {
      s.isRed = !s.isRed;
    }
    if (rnd() < changeRatio) {
      s.fireInterval = rnd(30, 40) / sqrt(difficulty);
      s.fireSpeed = rnd(0.9, 1.2) * sqrt(difficulty);
    }
    color(
      s.isRed ? (s.isSmile ? "yellow" : "red") : s.isSmile ? "green" : "cyan"
    );
    char(s.isSmile ? "a" : "b", s.pos);
  });
  player.speed = sqrt(difficulty) * 0.5;
  if (input.isJustPressed) {
    play("select");
    player.vx *= -1;
  }
  player.pos.x = wrap(player.pos.x + player.vx * player.speed, -3, 103);
  color("black");
  const c = char(addWithCharCode("c", floor(ticks / 30) % 2), player.pos, {
    mirror: { x: player.vx },
  }).isColliding;
  remove(bullets, (b) => {
    b.pos.add(b.vel);
    b.pos.x = wrap(b.pos.x, -3, 103);
    color(b.isRed ? "red" : "cyan");
    let c;
    if (b.isBonus) {
      c = text("$", b.pos).isColliding;
    } else {
      c = bar(b.pos, 3, 2, b.vel.angle).isColliding;
    }
    if (c.char.c || c.char.d) {
      if (b.isBonus) {
        play("powerUp");
        addScore(multiplier, player.pos);
        multiplier++;
        return true;
      } else {
        play("explosion");
        end();
      }
    }
    if (c.rect.light_black) {
      if (b.isBonus && multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });

  /** @type {(pos: Vector, speed: Number, isSmile: Boolean, isRed: boolean) => void} */
  function fire(pos, speed, isSmile, isRed) {
    play(isSmile ? "laser" : "hit");
    if (isRed) {
      const t1 = player.pos.distanceTo(pos) / speed;
      const t2 =
        vec(
          player.pos.x + t1 * player.vx * player.speed,
          player.pos.y
        ).distanceTo(pos) / speed;
      const vel = vec().addWithAngle(
        pos.angleTo(
          vec(player.pos.x + t2 * player.vx * player.speed, player.pos.y)
        ),
        speed
      );
      bullets.push({ pos: vec(pos), vel, isRed, isBonus: isSmile });
    } else {
      const vel = vec().addWithAngle(pos.angleTo(player.pos), speed);
      bullets.push({ pos: vec(pos), vel, isRed, isBonus: isSmile });
    }
  }
}
