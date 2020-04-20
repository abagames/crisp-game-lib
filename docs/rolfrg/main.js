title = "ROLFRG";

description = `
[Press] Turn
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

let x;
let w;
let frogs;
let l;

function update() {
  if (!ticks) {
    frogs = times(5, (i) => {
      return { p: vec(0, -i * 9), a: rnd(9) };
    });
    x = 50;
    w = 1;
  }
  color("green");
  score++;
  l = ticks % ceil(30 / difficulty) ? 4 : 30;
  frogs.map((f) => {
    if (f.p.y < 0) {
      f.p.x = rnd(99);
      f.p.y += rnd(99, 120);
    }
    bar(f.p, l, 3, f.a, 0);
    f.a += difficulty / 9;
    f.p.y -= difficulty / 2;
    if (l > 9) {
      play("laser");
      f.p.addWithAngle(f.a, 30);
    }
  });
  color("yellow");
  x += w * difficulty;
  if (input.isJustPressed || x < 0 || x > 99) {
    w *= -1;
  }
  if (box(x, 36, 3).isColliding.rect.green) {
    play("lucky");
    end();
  }
}
