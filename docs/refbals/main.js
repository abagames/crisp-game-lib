title = "REFBALS";

description = `
[Hold] Accel
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let balls;
let walls;

function update() {
  if (!ticks) {
    balls = [];
    walls = times(5, (i) => vec(i * -29, -9));
  }
  if (!(ticks % 99)) {
    balls.push({ p: vec(rnd(50), 0), v: 0 });
  }
  color("blue");
  walls.map((w) => {
    w.x -= input.isPressed ? 2 : 1;
    box(w, 36, 3);
    if (w.x < -19) {
      w.x += rnd(130, 150);
      w.y = rnd(50, 90);
    }
  });
  color("purple");
  balls.map((b) => {
    if ((b.p.y += b.v += 0.03) > 99) {
      play("explosion");
      end();
    }
    if (box(b.p, 5).isColliding.rect.blue) {
      play("select");
      score++;
      b.p.y += (b.v *= -1) * 2;
    }
  });
}
