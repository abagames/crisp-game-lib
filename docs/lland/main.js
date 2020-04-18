title = "LLAND";

description = `
[Hold] Thrust up
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isMinifying: true,
};

let mountains;
let shipY, shipV;
let offset;
let mountainAppDist;
let mountainIndex;
let landingIndex;
let landing;
let landZ;
let shipCollision;
let m;

function update() {
  if (!ticks) {
    mountains = times(9, (i) => {
      return { y: 90 - i, c: "red" };
    });
    shipY = shipV = offset = mountainAppDist = mountainIndex = landingIndex = landing = 0;
  }
  mountains.map((m, i) => {
    color(m.c);
    rect(wrap(i * 13 + offset - 13, -13, 104), m.y, 13, 99);
  });
  color("green");
  shipCollision = box(25, shipY, 5, 5);
  if (landing) {
    if (input.isPressed) {
      landing = 0;
    } else {
      return;
    }
  }
  offset -= difficulty;
  if ((mountainAppDist -= difficulty) < 0) {
    m = mountains[wrap(mountainIndex, 0, 9)];
    m.y =
      landingIndex > 7 || landingIndex === 1
        ? rnd(70, 90)
        : landingIndex === 0
        ? (landZ = rnd(40, 70))
        : rnd(40, 90);
    landingIndex--;
    if (landingIndex < 0) {
      m.c = "cyan";
      landingIndex = 9;
    } else {
      m.c = "red";
    }
    mountainIndex++;
    mountainAppDist += 13;
  }
  if (input.isJustPressed) {
    play("hit");
    shipV -= 0.4;
  }
  if (input.isPressed) {
    shipV -= 0.2;
  }
  shipV += 0.1;
  shipV *= 0.99;
  if (shipY < 0 && shipV < 0) {
    shipV *= -1;
  }
  shipY += shipV * difficulty;
  if (shipCollision.isColliding.rect.cyan) {
    play("select");
    landing = ++score;
    shipV = 0;
    shipY = landZ - 3;
    mountains.map((n) => (n.c = "red"));
  }
  if (
    shipCollision.isColliding.rect.red ||
    rect(-1, 0, 1, 99).isColliding.rect.cyan
  ) {
    play("explosion");
    end();
  }
}
