title = "GOLFME";

description = `
[Hold]    Change angle
[Release] Jump
`;

characters = [];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
};

let p, v;
let isJumping;
let angle;
let width;
let space;
let scr;
let playerCollision;

function update() {
  if (!ticks) {
    p = vec(50, 85);
    isJumping = angle = width = space = 0;
  }
  if (width + space < 0) {
    width = 200;
    space = rnd(50, 150);
  }
  color("blue");
  rect(0, 90, width, 9);
  rect(width + space, 90, 200, 9);
  color("green");
  playerCollision = box(p, 9, 9);
  if (p.x < 0 || p.y > 99) {
    play("lucky");
    end();
  }
  if (isJumping) {
    p.add(v);
    v.y += 0.1;
    if (playerCollision.isColliding.rect.blue) {
      isJumping = angle = 0;
      p.y = 85;
    }
  } else {
    if (input.isPressed) {
      bar(p, 20, 3, (angle -= 0.05), 0);
    }
    if (input.isJustReleased) {
      play("jump");
      isJumping = 1;
      v = vec(4).rotate(angle);
    }
  }
  p.x -= scr = clamp(p.x - 50, 0, 99) * 0.1 + difficulty;
  width -= scr;
  score += scr;
}
