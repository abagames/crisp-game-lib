title = "JUJUMP";

description = `
[Press] Jump
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let p, v;
let floors;
let jumpWay;
let jumpPower;
let floorAppDist;
let scr;

function update() {
  if (!ticks) {
    p = vec(50, 50);
    v = vec();
    floors = [vec(50, 70)];
    jumpWay = jumpPower = floorAppDist = 1;
  }
  p.add(v);
  v.y += input.isPressed ? 0.05 : 0.1;
  score += scr = (p.y < 30 ? (30 - p.y) * 0.1 : 0) + difficulty * 0.1;
  if ((floorAppDist -= scr) < 0) {
    floorAppDist = rnd(99);
    floors.push(vec(rnd(99), -9));
  }
  p.y += scr;
  color("blue");
  floors = floors.filter((f) => {
    f.y += scr;
    box(f, 33, 7);
    return f.y < 99;
  });
  color("transparent");
  for (;;) {
    if (!box(p, 7, 7).isColliding.rect.blue) {
      break;
    }
    p.y--;
    v.set();
    jumpPower = 1;
  }
  color("green");
  box(p, 7, 7);
  if (input.isJustPressed) {
    play("jump");
    v.x = jumpWay *= -1;
    v.y = -3 * jumpPower;
    jumpPower *= 0.7;
  }
  if (p.y > 99) {
    play("explosion");
    end();
  }
}
