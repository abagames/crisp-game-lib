title = "DARK CAVE";

description = `
[Slide] Move
`;

characters = [];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

/** @type {{pos: Vector, type: "spike" | "coin"}[]} */
let objs;
let nextSpikeDist;
let nextCoinDist;
/** @type {{pos: Vector, angle: number, range: number}} */
let player;
let pressedTicks;
const angleWidth = PI / 6;

function update() {
  if (!ticks) {
    objs = [];
    nextSpikeDist = 0;
    nextCoinDist = 10;
    pressedTicks = 0;
    player = { pos: vec(50, 90), angle: 0, range: 40 };
  }
  const scr = difficulty * (0.1 + player.range * 0.01);
  nextSpikeDist -= scr;
  if (nextSpikeDist < 0) {
    objs.push({ pos: vec(rnd(5, 95)), type: "spike" });
    nextSpikeDist = rnd(20, 30);
  }
  nextCoinDist -= scr;
  if (nextCoinDist < 0) {
    objs.push({ pos: vec(rnd(10, 90)), type: "coin" });
    nextCoinDist = rnd(30, 40);
  }
  const pp = player.pos.x;
  player.pos.x = clamp(input.pos.x, 3, 97);
  const vx = clamp(player.pos.x - pp, -0.1, 0.1);
  player.angle = clamp(player.angle + vx * sqrt(difficulty), -PI / 8, PI / 8);
  player.range *= 1 - 0.001 * sqrt(difficulty);
  color("white");
  box(player.pos, 7);
  remove(objs, (o) => {
    o.pos.y += scr;
    const d = player.pos.distanceTo(o.pos);
    const a = player.pos.angleTo(o.pos) + PI / 2;
    if (abs(a - player.angle) < angleWidth) {
      color(o.type === "coin" ? "yellow" : "purple");
      if (d < player.range) {
        text(o.type === "coin" ? "$" : "*", o.pos);
      } else {
        particle(o.pos, 0.05);
      }
    }
    color("transparent");
    const c = text(o.type === "coin" ? "$" : "*", o.pos).isColliding;
    if (c.rect.white) {
      if (o.type === "coin") {
        play("powerUp");
        addScore(floor(player.range), o.pos);
        player.range = clamp(player.range + 9, 9, 99);
      } else {
        play("explosion");
        color("red");
        text("*", o.pos);
        particle(o.pos);
        player.range /= 3;
      }
      return true;
    }
  });
  color("black");
  if (player.range < 9) {
    color("red");
  }
  const a1 = player.angle - angleWidth - PI / 2;
  const a2 = a1 + angleWidth * 2;
  line(player.pos, vec(player.pos).addWithAngle(a1, player.range), 2);
  line(player.pos, vec(player.pos).addWithAngle(a2, player.range), 2);
  arc(player.pos, player.range, 2, a1, a2);
  if (player.range < 9) {
    play("lucky");
    end();
  }
}
