title = "AERIAL BAR";

description = `
[Tap]  Jump
[Hold] Fly
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9000,
};

/**
 * @type {{
 * x: number, length: number, angle: number, angleVel: number, isHeld: boolean
 * }[]}
 */
let bars;
let nextBarDist;
/**
 * @type {{
 * pos: Vector, length: number, angle: number, angleVel: number,
 * center: number, bar: any, vel: Vector,
 * }}
 */
let player;
let flyingTicks;
let ceilingY;
let targetCeilingY;

function update() {
  if (!ticks) {
    bars = [{ x: 50, length: 50, angle: PI / 2, angleVel: 0.03, isHeld: true }];
    nextBarDist = 0;
    player = {
      pos: vec(),
      length: 10,
      angle: 0,
      angleVel: 0,
      center: 0.2,
      bar: bars[0],
      vel: vec(),
    };
    flyingTicks = 0;
    ceilingY = targetCeilingY = 10;
  }
  ceilingY += (targetCeilingY - ceilingY) * 0.1;
  color("light_cyan");
  rect(0, 0, 100, ceilingY);
  color("light_blue");
  rect(0, 90, 100, 10);
  let scr = difficulty * 0.02;
  if (player.pos.x > 50) {
    scr += (player.pos.x - 50) * 0.1;
  }
  player.pos.x -= scr;
  if (player.bar != null) {
    const b = player.bar;
    player.pos.set(b.x, ceilingY).addWithAngle(b.angle, b.length);
    player.angleVel += b.angleVel * b.length * 0.003;
    if (b.x < 0) {
      color("red");
      text("X", 3, ceilingY);
      play("explosion");
      end();
    }
    if (input.isJustPressed) {
      play("select");
      player.vel
        .set()
        .addWithAngle(
          b.angle + PI / 2,
          (b.angleVel * b.length + player.angleVel * 3) * sqrt(difficulty)
        )
        .add(0, -sqrt(difficulty) * 0.5);
      player.bar = undefined;
      flyingTicks = 1;
    }
  } else {
    flyingTicks += difficulty;
    player.pos.add(player.vel);
    player.vel.y += (input.isPressed ? 0.01 : 0.1) * sqrt(difficulty);
    player.vel.mul(input.isPressed ? 0.99 : 0.95);
    if (player.pos.y > 89) {
      play("hit");
      player.vel.y *= -1.5;
      player.pos.y = 88;
      targetCeilingY += 10;
      flyingTicks = -9999;
      bars.forEach((b) => {
        b.isHeld = false;
      });
    }
    if (player.pos.x < 0) {
      color("red");
      text("X", 3, player.pos.y);
      play("explosion");
      end();
    }
  }
  player.angleVel *= 0.99;
  player.angle += player.angleVel;
  color("cyan");
  if (
    bar(player.pos, player.length, 4, player.angle, player.center).isColliding
      .rect.light_cyan &&
    player.vel.y < 0
  ) {
    player.vel.y *= -0.5;
  }
  nextBarDist -= scr;
  if (nextBarDist < 0) {
    const length = rnd(20, 50);
    bars.push({
      x: 110,
      length,
      angle: PI / 2 - rnd(PI / 4),
      angleVel: rnds(0.02, 0.04),
      isHeld: false,
    });
    nextBarDist = length + rnd(20);
  }
  remove(bars, (b) => {
    b.x -= scr;
    b.angleVel += cos(b.angle) * b.length * 0.00005 * sqrt(difficulty);
    b.angle += b.angleVel;
    color("black");
    const p = vec(b.x, ceilingY).addWithAngle(b.angle, b.length);
    line(b.x, ceilingY, p);
    color(b.isHeld ? "black" : "blue");
    const c = box(p, 5).isColliding.rect;
    if (c.light_blue) {
      play("explosion");
      color("red");
      text("X", p);
      end();
    }
    if (!b.isHeld && player.bar == null && c.cyan) {
      play("powerUp");
      if (flyingTicks > 0) {
        addScore(ceil(flyingTicks), p);
      }
      player.bar = b;
      b.isHeld = true;
      targetCeilingY = clamp(targetCeilingY - 5, 10, 99);
    }
    return b.x < -30;
  });
}
