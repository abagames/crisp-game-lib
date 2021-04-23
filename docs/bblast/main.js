title = "B BLAST";

description = `
[Hold] 
 Select area
[Release]
 Erase balls
`;

characters = [];

options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5,
};

/**
 * @type {{
 * pos: Vector, vel: Vector, radius: number, targetRadius: number, isRed:boolean
 * }[]}
 */
let balls;
let nextBallTicks;
let nextRedBallTicks;
let pos;
let radius;
let radiusSlowTicks;

function update() {
  if (!ticks) {
    balls = [];
    nextRedBallTicks = 0;
    nextBallTicks = 60;
    pos = vec();
    radius = undefined;
    radiusSlowTicks = 0;
  }
  nextRedBallTicks--;
  if (nextRedBallTicks < 0) {
    play("jump");
    balls.push({
      pos: vec(rnd(19, 80), 10),
      vel: vec(),
      radius: 0,
      targetRadius: 9,
      isRed: true,
    });
    nextRedBallTicks = 300 / difficulty;
  }
  nextBallTicks--;
  if (nextBallTicks < 0) {
    play("hit");
    balls.push({
      pos: vec(rnd(9, 90), rnd(20, 80)),
      vel: vec(),
      radius: 0,
      targetRadius: rnd(5, 10),
      isRed: false,
    });
    nextBallTicks = 30 / difficulty;
  }
  let hasRed = false;
  remove(balls, (b) => {
    b.radius += (b.targetRadius - b.radius) * 0.05;
    balls.forEach((ob) => {
      if (b === ob) {
        return;
      }
      const d = b.pos.distanceTo(ob.pos) - b.radius - ob.radius;
      if (d < 0) {
        b.vel.addWithAngle(ob.pos.angleTo(b.pos), -d / b.radius);
      }
    });
    if (
      (b.pos.x < b.radius && b.vel.x < 0) ||
      (b.pos.x > 99 - b.radius && b.vel.x > 0)
    ) {
      b.vel.x *= -0.7;
    }
    if (b.pos.y > 110 - b.radius && b.vel.y > 0) {
      b.vel.y *= -0.7;
    }
    b.vel.y += 0.05;
    b.vel.mul(0.95);
    if (b.vel.length > 1) {
      b.vel.mul(0.5);
    }
    b.pos.add(b.vel);
    if (b.isRed) {
      hasRed = true;
      if (b.pos.y > 99 - b.radius) {
        play("coin");
        addScore(10, b.pos);
        b.isRed = false;
      }
    }
    color(b.isRed ? "red" : "black");
    arc(b.pos, b.radius, b.radius * 0.4);
    if (b.pos.y - b.radius < 0) {
      play("lucky");
      color("red");
      text("X", b.pos.x, 7);
      end();
    }
  });
  if (!hasRed) {
    nextRedBallTicks = 0;
  }
  if (input.isJustPressed) {
    play("select");
    pos.set(input.pos).clamp(0, 99, 0, 99);
    radius = 1;
  }
  if (radius != null && input.isPressed) {
    radius += 0.5 * difficulty * (1 - radiusSlowTicks / 60);
    color("yellow");
    arc(pos, radius, 2);
  }
  if (radius != null && input.isJustReleased) {
    play("laser");
    radiusSlowTicks = 60;
    let multiplier = 1;
    const redPoss = [];
    remove(balls, (b) => {
      if (b.pos.distanceTo(pos) - b.radius - radius < 0) {
        if (b.isRed) {
          play("explosion");
          redPoss.push(b.pos);
          color("red");
          particle(b.pos, 30, 4);
        } else {
          play("coin");
          color("black");
          particle(b.pos, b.radius, b.radius * 0.3);
        }
        addScore(multiplier, b.pos);
        multiplier++;
        return true;
      }
    });
    redPoss.forEach((p) => {
      times(9, () => {
        balls.push({
          pos: vec(p.x + rnds(3), p.y + rnds(3)),
          vel: vec(),
          radius: 0,
          targetRadius: rnd(12, 15),
          isRed: false,
        });
      });
    });
  }
  if (radiusSlowTicks > 0) {
    radiusSlowTicks--;
  }
}
