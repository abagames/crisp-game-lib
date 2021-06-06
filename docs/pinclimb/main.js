title = "PIN CLIMB";

description = `
[Hold] Stretch
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 400,
};

/** @type {{angle: number, length: number, pin: any}} */
let cord;
/** @type {Vector[]} */
let pins;
let nextPinDist;
const cordLength = 7;

function update() {
  if (!ticks) {
    pins = [vec(50, 0)];
    nextPinDist = 10;
    cord = { angle: 0, length: cordLength, pin: pins[0] };
  }
  let scr = difficulty * 0.02;
  if (cord.pin.y < 80) {
    scr += (80 - cord.pin.y) * 0.1;
  }
  nextPinDist -= scr;
  if (input.isJustPressed) {
    play("select");
  }
  if (input.isPressed) {
    cord.length += difficulty;
  } else {
    cord.length += (cordLength - cord.length) * 0.1;
  }
  cord.angle += difficulty * 0.05;
  line(cord.pin, vec(cord.pin).addWithAngle(cord.angle, cord.length));
  if (cord.pin.y > 98) {
    play("explosion");
    end();
  }
  let nextPin;
  remove(pins, (p) => {
    p.y += scr;
    const c = box(p, 3).isColliding;
    if (p !== cord.pin && c.rect.black) {
      nextPin = p;
    }
    return p.y > 102;
  });
  if (nextPin != null) {
    play("powerUp");
    addScore(ceil(cord.pin.distanceTo(nextPin)), nextPin);
    cord.pin = nextPin;
    cord.length = cordLength;
  }
  while (nextPinDist < 0) {
    pins.push(vec(rnd(10, 90), -2 - nextPinDist));
    nextPinDist += rnd(5, 15);
  }
}
