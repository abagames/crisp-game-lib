title = "TWHOLS";

description = `
[Press] Turn
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let walls;
let p, v;

function update() {
  if (!ticks) {
    p = vec(50, 50);
    v = vec(1, 1);
    walls = times(2, (i) => {
      return { p: vec(0, 9 + i * 70), v: 1 };
    });
  }
  color("blue");
  walls.map((w) => {
    rect(w.p.x, w.p.y, -99, 5);
    rect(w.p.x + 40, w.p.y, 99, 5);
    w.p.x -= w.v;
    if (w.p.x < -40) {
      w.p.x = 99;
      w.v = rnd(1, 2) * difficulty;
    }
  });
  color("green");
  p.add(vec(v).mul(difficulty));
  if (box(p, 5).isColliding.rect.blue) {
    play("hit");
    v.y = p.y < 50 ? 1 : -1;
    score++;
  }
  if (input.isJustPressed || p.x < 0 || p.x > 99) {
    v.x *= -1;
  }
  if (p.y < 0 || p.y > 99) {
    play("lucky");
    end();
  }
}
