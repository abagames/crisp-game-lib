title = "NS CLIMB";

description = `
[Tap] Reverse
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 4,
};

/** @type {{pos: Vector, type: "N" | "S" | "", wallIndex: number}[]} */
let magnets;
/**
 * @type {{
 * type: "N" | "S" | "", prevType: "N" | "S", count: number,
 * x: number, vx: number
 * }[]}
 */
let walls;
let pos;
let vel;
let type;

function update() {
  if (!ticks) {
    magnets = times(22, (i) => {
      return {
        pos: vec(i % 2 === 0 ? 20 : 80, (i / 2) * 10 - 5),
        type: i < 10 ? "S" : "",
        wallIndex: i % 2,
      };
    });
    walls = [
      { type: "", prevType: "S", count: rndi(2, 4), x: 20, vx: 0 },
      { type: "", prevType: "S", count: rndi(2, 4), x: 80, vx: 0 },
    ];
    pos = vec(50, 90);
    vel = vec(0, -1);
    type = "N";
  }
  if (input.isJustPressed) {
    type = type === "N" ? "S" : "N";
    play(type === "N" ? "laser" : "select");
  }
  pos.add(vel);
  vel.x *= 0.98;
  vel.y += 0.001 * difficulty;
  let scr = 0;
  if (pos.y < 70) {
    scr = (70 - pos.y) * 0.1;
  }
  if (pos.y > 99) {
    play("explosion");
    end();
  }
  pos.y += scr;
  addScore(scr);
  color(type === "N" ? "red" : "blue");
  box(pos, 7, 7);
  color("white");
  text(type, pos.x - 1, pos.y - 1);
  magnets.forEach((m) => {
    m.pos.y += scr;
    if (m.type !== "") {
      const d = pos.distanceTo(m.pos);
      const a = pos.angleTo(m.pos);
      vel.addWithAngle(a, (difficulty / d / d) * (m.type === type ? -1 : 1));
    }
    color(m.type === "" ? "light_black" : m.type === "N" ? "red" : "blue");
    const c = box(m.pos, 9, 9).isColliding.rect;
    if (c.blue || c.red) {
      play("hit");
      pos.x = m.pos.x + (m.wallIndex === 0 ? 10 : -10);
      if (
        (m.wallIndex === 0 && vel.x < 0) ||
        (m.wallIndex === 1 && vel.x > 0)
      ) {
        vel.x *= -0.7;
      }
    }
    color("white");
    text(m.type, m.pos.x - 1, m.pos.y - 1);
    if (m.pos.y > 105) {
      m.pos.y -= 110;
      const w = walls[m.wallIndex];
      w.x += w.vx;
      m.pos.x = w.x;
      w.vx += rnds(0.1);
      if (m.wallIndex === 0) {
        if ((w.x < 10 && w.vx < 0) || (w.x > 40 && w.vx > 0)) {
          w.vx *= -0.5;
        }
      } else {
        if ((w.x < 60 && w.vx < 0) || (w.x > 90 && w.vx > 0)) {
          w.vx *= -0.5;
        }
      }
      w.count--;
      if (w.count < 0) {
        if (w.type === "") {
          w.type = w.prevType === "N" ? "S" : "N";
          w.prevType = w.type;
          w.count = rndi(3, 9);
        } else {
          w.type = "";
          w.count = rndi(2, 4);
        }
      }
      m.type = w.type;
    }
  });
}
