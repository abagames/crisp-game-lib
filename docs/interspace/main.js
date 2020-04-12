title = "INTERSPACE";

description = `
[Slide] Move
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let p, s, wp;

function update() {
  if (ticks === 0) {
    p = vec(50, 10);
    s = vec(7, 7);
    wp = vec(50, 99);
  }
  const sc = difficulty * 0.5 + (s.y - 7) * 0.3;
  wp.y -= sc;
  addScore(sc);
  if (wp.y < 0) {
    wp.x = wrap(wp.x + rnd(-9, 9), 9, 90);
    wp.y = 99;
    play("coin");
  }
  color("red");
  rect(0, wp.y, wp.x - 7, 9);
  rect(wp.x + 7, wp.y, 99, 9);
  p.x = clamp(input.pos.x, 0, 99);
  color("transparent");
  if (box(p, 7, 99).isColliding.rect.red) {
    p.y += (10 - p.y) * 0.1;
    s.y += (7 - s.y) * 0.4;
  } else {
    p.y += (30 - p.y) * 0.1;
    s.y += (30 - s.y) * 0.1;
  }
  color("green");
  if (box(p, s).isColliding.rect.red) {
    play("explosion");
    end();
  }
}
