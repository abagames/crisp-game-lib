// Write the game name to 'title'.
title = "PIN CLIMB";

// 'description' is displayed on the title screen.
description = `
[Hold] Stretch
`;

// User-defined characters can be written here.
characters = [];

// Configure game options.
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  // If you want to play a different BGM or SE,
  // you can try changing the 'seed' value.
  seed: 400,
};

// (Optional) Defining the types of variables is useful for
// code completion and error detection.
/** @type {{angle: number, length: number, pin: Vector}} */
let cord;
/** @type {Vector[]} */
let pins;
let nextPinDist;
const cordLength = 7;

// 'update()' is called every frame (60 times per second).
function update() {
  // 'ticks' counts the number of frames from the start of the game.
  if (!ticks) {
    // Initialize the game state here. (ticks === 0)
    pins = [vec(50, 0)]; // 'vec()' creates a 2d vector instance.
    nextPinDist = 10;
    cord = { angle: 0, length: cordLength, pin: pins[0] };
  }
  // 'difficulty' represents the difficulty of the game.
  // The value of this variable is 1 at the beginning of the game and
  // increases by 1 every minute.
  let scr = difficulty * 0.02;
  if (cord.pin.y < 80) {
    scr += (80 - cord.pin.y) * 0.1;
  }
  // 'input.isJustPressed' is set to true the moment the button is pressed.
  if (input.isJustPressed) {
    // 'play()' plays the SE.
    play("select");
  }
  // 'input.isPressed' is set to true while the button is pressed.
  if (input.isPressed) {
    cord.length += difficulty;
  } else {
    cord.length += (cordLength - cord.length) * 0.1;
  }
  cord.angle += difficulty * 0.05;
  // Draw a line connecting the coordinates of
  // the first argument and the second argument.
  line(cord.pin, vec(cord.pin).addWithAngle(cord.angle, cord.length));
  if (cord.pin.y > 98) {
    play("explosion");
    // Call 'end()' to end the game. (Game Over)
    end();
  }
  let nextPin;
  // 'remove()' passes the elements of the array of the first argument to
  // the function of the second argument in order and executes it.
  // If the function returns true, the element will be removed from the array.
  remove(pins, (p) => {
    p.y += scr;
    // Draw a box and check if it collides with other black rectangles or lines.
    if (box(p, 3).isColliding.rect.black && p !== cord.pin) {
      nextPin = p;
    }
    return p.y > 102;
  });
  if (nextPin != null) {
    play("powerUp");
    // Add up the score.
    // By specifying the coordinates as the second argument,
    // the added score is displayed on the screen.
    addScore(ceil(cord.pin.distanceTo(nextPin)), nextPin);
    cord.pin = nextPin;
    cord.length = cordLength;
  }
  nextPinDist -= scr;
  while (nextPinDist < 0) {
    // 'rnd()' returns a random value.
    pins.push(vec(rnd(10, 90), -2 - nextPinDist));
    nextPinDist += rnd(5, 15);
  }
}
