// Title of the game
title = "REFBALS";

// Description is displayed on the title screen
description = `
[Hold] Accel
`;

// User defined text characters
characters = [];

// Game options
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let balls;
let walls;

// 'update()' is called per frame (1 frame = 1/60 second)
function update() {
  // 'ticks' counts the number of frames from the start of the game
  if (!ticks) {
    // Initialize variables at the first frame (ticks === 0)
    balls = [];
    // 'vec()' creates a 2d vector instance
    walls = times(5, (i) => vec(i * -29, -9));
  }
  if (!(ticks % 99)) {
    // 'rnd()' returns a random number
    balls.push({ p: vec(rnd(50), 0), v: 0 });
  }
  // 'color()' sets a drawing color
  color("blue");
  walls.map((w) => {
    // 'input.isPressed' returns true if
    // a mouse button, a key or a touch screen is pressed
    w.x -= input.isPressed ? 2 : 1;
    // 'box()' draws a rectangle
    box(w, 36, 3);
    if (w.x < -19) {
      w.x += rnd(130, 150);
      w.y = rnd(50, 90);
    }
  });
  color("purple");
  balls.map((b) => {
    if ((b.p.y += b.v += 0.03) > 99) {
      // 'play()' plays a sound effect
      play("explosion");
      // A game is over when 'end()' is called
      end();
    }
    // 'box()' returns a collision status
    if (box(b.p, 5).isColliding.rect.blue) {
      play("select");
      // 'score' represents the score of the game
      score++;
      b.p.y += (b.v *= -1) * 2;
    }
  });
}
