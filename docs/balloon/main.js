title = "BALLOON";

description = `
[Slide] Wind
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 27,
  theme: "shape",
};

let balloons;
let addBalloonTicks;
let prevInputPos;
let wind;
let bonuses;
let addBonusTicks;
let multiplier;
let scoreTotal;
let scorePos;

function update() {
  if (!ticks) {
    balloons = [];
    addBalloonTicks = 0;
    prevInputPos = vec(input.pos);
    wind = vec();
    bonuses = [];
    addBonusTicks = 0;
  }
  multiplier = 1;
  scoreTotal = 0;
  addBonusTicks--;
  if (addBonusTicks < 0) {
    bonuses.push({
      p: vec(rnd(10, 80), -5),
      v: vec(rnds(0.2), rnd(0.1, 0.25 + difficulty * 0.05)),
      bl: undefined,
    });
    addBonusTicks += 50 / difficulty;
  }
  bonuses = bonuses.filter((b) => {
    if (b.bl != null) {
      color("green");
      b.p.add(vec(b.bl.p).sub(b.p).mul(0.1));
      b.v.add(vec(b.bl.p).sub(b.p).mul(0.02)).mul(0.95);
    } else {
      color("yellow");
      balloons.forEach((bl) => {
        if (bl.p.distanceTo(b.p) < bl.r * 1.3) {
          play("select");
          b.bl = bl;
        }
      });
    }
    if ((b.p.x < 0 && b.v.x < 0) || (b.p.x > 99 && b.v.x > 0)) {
      b.v.x *= -1;
    }
    b.p.add(b.v);
    text("$", b.p);
    if (b.bl == null && b.p.y > 99) {
      play("explosion");
      end();
    }
    if (b.bl != null && !b.bl.isAlive) {
      scoreTotal += multiplier;
      scorePos = b.p;
      multiplier++;
      return false;
    }
    return true;
  });
  if (scoreTotal > 0) {
    play("coin");
    addScore(scoreTotal, scorePos.x, scorePos.y + 9);
  }
  color("cyan");
  const o = vec(input.pos).sub(prevInputPos);
  if (o.length < 9) {
    wind.add(o.mul(0.5)).mul(0.5);
  }
  prevInputPos.set(input.pos);
  particle(input.pos, 3, wind.length, wind.angle, 0.1);
  addBalloonTicks--;
  if (addBalloonTicks < 0) {
    const r = 20;
    balloons.push({
      p: vec(rnd(r, 99 - r), 99 + r),
      v: vec(rnds(1)),
      r,
      t: 0,
      isAlive: true,
    });
    addBalloonTicks += 200;
  }
  color("green");
  balloons = balloons.filter((b) => {
    if (input.pos.distanceTo(b.p) < b.r) {
      b.v.add(wind);
    }
    b.p.add(b.v);
    if ((b.p.x < b.r && b.v.x < 0) || (b.p.x > 99 - b.r && b.v.x > 0)) {
      b.v.x *= -0.7;
    }
    if (b.p.y > 99 - b.r && b.v.y > 0) {
      b.v.y *= -0.7;
    }
    b.v.x *= 0.9;
    b.v.y += (-0.3 - b.v.y) * 0.1;
    b.r *= 1 - b.v.length * 0.003;
    b.t++;
    let a = b.t * 0.03;
    times(7, (i) => {
      bar(vec(b.r).rotate(a).add(b.p), b.r * 0.3, 3, a + PI / 2);
      a += (PI * 2) / 7;
    });
    if (b.p.y < b.r || b.r < 9) {
      b.isAlive = false;
      particle(b.p);
      return false;
    }
    return true;
  });
}
