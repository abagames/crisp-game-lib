title = "FLOATER";

description = `
[Tap] Jump
[Hold] Fly
`;

characters = [];

options = {
  isPlayingBgm: true,
  seed: 1,
  isReplayEnabled: true,
};

let floaters;
let player;
let floaterAddDist;
let fy;

function update() {
  if (ticks === 0) {
    fy = 50;
    floaters = [];
    player = {
      p: vec(105, 10),
      v: vec(),
      on: undefined,
    };
    floaterAddDist = 0;
  }
  if (floaterAddDist <= 0) {
    const r = rnd(10, 20);
    if (fy < 30 + r) {
      fy = 30 + r + (30 + r - fy);
    } else if (fy > 80 - r) {
      fy = 80 - r - (fy - (80 - r));
    }
    floaters.push({
      cp: vec(105, fy),
      p: vec(),
      a: rnd(PI * 2),
      r,
      v: rnd(0.05, 0.1) * difficulty,
      isValid: true,
    });
    fy += rnds(20);
    floaterAddDist += rnd(20, 40);
  }
  let sc = difficulty * 0.1;
  if (player.p.x > 30) {
    sc += (player.p.x - 30) * 0.05;
  }
  floaterAddDist -= sc;
  color("light_black");
  rect(0, 0, 99, 5);
  floaters = floaters.filter((f) => {
    f.cp.x -= sc;
    if (f.cp.x < -10) {
      return false;
    }
    color(f.isValid ? "blue" : "light_blue");
    f.p.set(f.cp.x, f.cp.y + sin(f.a) * f.r);
    box(f.p, 15, 5);
    f.a += f.v;
    return true;
  });
  player.p.x -= sc;
  addScore(sc);
  if (player.on != null) {
    player.p.y = player.on.p.y - 6;
  } else {
    player.v.y += input.isPressed ? 0.05 : 0.2;
    player.p.add(player.v);
  }
  color("green");
  const pc = box(player.p, 7, 7);
  if (player.on != null) {
    if (input.isJustPressed) {
      player.v.x = 1;
      player.v.y = cos(player.on.a) * player.on.v * 20 - 1;
      player.on.isValid = false;
      player.on = undefined;
      play("jump");
    }
  } else {
    if (pc.isColliding.rect.light_black && player.v.y < 0) {
      player.v.y *= -0.25;
    }
    if (pc.isColliding.rect.blue) {
      play("laser");
      floaters.forEach((f) => {
        if (abs(f.p.x - player.p.x) < 12) {
          player.on = f;
        }
      });
    }
  }
  if (player.p.y > 99 || player.p.x < 0) {
    play("explosion");
    end();
  }
}
