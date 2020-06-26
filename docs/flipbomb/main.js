title = "FLIPBOMB";

description = `
[Tap] Flip
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
  theme: "crt",
};

let balls, bombs, explosions;
let bombAppTicks;
let ballAppTicks;
let multiplier;

function update() {
  if (!ticks) {
    balls = [];
    bombs = [];
    explosions = [];
    bombAppTicks = ballAppTicks = 0;
    multiplier = 1;
  }
  color("blue");
  line(99, 75, 75, 86);
  if (input.isJustPressed) {
    play("laser");
    line(70, 89, 50, 80);
    multiplier = 1;
  } else {
    line(70, 89, 50, 98);
  }
  color("purple");
  explosions = explosions.filter((e) => {
    let a = e.a;
    const r = e.t < 20 ? e.t * 0.5 : 20 * 0.5 - (e.t - 20);
    const s = e.t === 0 ? 10 : r + 3;
    times(5, (i) => {
      box(vec(e.p).addWithAngle(a, r), s, s);
      a += (PI * 2) / 5;
    });
    e.t++;
    e.a += 0.2;
    return e.t < 30;
  });
  ballAppTicks -= difficulty;
  if (ballAppTicks < 0) {
    balls.push({ p: vec(99, 70), v: vec(-1, 0.5).mul(difficulty), s: 0 });
    ballAppTicks = 60;
  }
  balls = balls.filter((b) => {
    b.p.add(b.v);
    color(b.s === 0 ? "blue" : "cyan");
    if (b.s === 0) {
      if (b.p.x < 70) {
        if (input.isJustPressed) {
          b.v.set(2, -4).rotate((b.p.x - 70) * 0.06);
          b.s = 1;
        }
      } else if (b.p.x < 50) {
        b.s = 1;
      }
    } else {
      particle(b.p, 1, b.v.length, b.v.angle + PI, 0.1);
    }
    if (box(b.p, 3, 3).isColliding.rect.purple) {
      return false;
    }
    return b.p.isInRect(0, 0, 99, 99);
  });
  bombAppTicks -= difficulty;
  if (bombAppTicks < 0) {
    const p = vec(rnd(80), 0);
    const v = vec(rnd(20, 70), 70)
      .sub(p)
      .div(500 / rnd(1, difficulty));
    bombs.push({ p, v });
    bombAppTicks += rnd(30, 50);
  }
  bombs = bombs.filter((b) => {
    b.p.add(b.v);
    color("red");
    const bc = box(b.p, 5, 5).isColliding.rect;
    if (bc.cyan || bc.purple) {
      play("hit");
      explosions.push({ p: b.p, t: 0, a: rnds(PI) });
      color("purple");
      particle(b.p, 16, 3);
      addScore(multiplier, b.p);
      multiplier++;
      return false;
    }
    if (b.p.y > 99 || bc.blue) {
      play("explosion");
      end();
    }
    return true;
  });
}
