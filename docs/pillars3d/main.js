title = "PILLARS 3D";

description = `
[Slide] Move
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 20,
};

/** @type {{x: number, z: number, size: Vector, color: Color}[]} */
let pillars;
let nextPillarTicks;
let nextYellowPillar;
let pos;
let vy;
let multiplier;

function update() {
  if (!ticks) {
    pillars = [{ x: 0, z: 20, size: vec(100, 100), color: "yellow" }];
    nextPillarTicks = nextYellowPillar = 9;
    pos = vec(50, 10);
    vy = 0;
    multiplier = 1;
  }
  nextPillarTicks--;
  if (nextPillarTicks < 0) {
    nextYellowPillar--;
    pillars.unshift({
      x: rnds(60, 160),
      z: 20,
      size: vec(rnd(50, 100), rnd(70, 180)),
      color: nextYellowPillar < 0 ? "yellow" : "black",
    });
    nextPillarTicks = 20 / difficulty;
    if (nextYellowPillar < 0) {
      nextYellowPillar = 9;
    }
  }
  color("light_black");
  rect(0, 60, 100, 1);
  color("black");
  pos.x = clamp(input.pos.x, 6, 93);
  pos.y += vy;
  vy += 0.1 * difficulty;
  text("TT", pos.x - 3, pos.y).isColliding.rect;
  if (pos.y > 95) {
    play("explosion");
    end();
  }
  pillars = pillars.filter((p) => {
    color(p.color);
    if (
      box(
        p.x / p.z + 50,
        p.size.y / 3 / p.z + 60,
        p.size.x / p.z,
        p.size.y / p.z
      ).isColliding.text.T
    ) {
      const ty = p.size.y / 3 / p.z + 60 - p.size.y / p.z / 2;
      if (vy > 0) {
        play("laser");
        vy = -2.5 * sqrt(difficulty);
        if (pos.y > ty) {
          pos.y = ty;
        }
      }
      addScore(multiplier, p.x / p.z + 50, ty);
      if (p.color === "yellow") {
        play("select");
        multiplier++;
      }
      return false;
    }
    p.z -= difficulty * 0.2;
    return p.z > 1;
  });
}
