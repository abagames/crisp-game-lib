title = "FUTURE WAKE";

description = `
[Slide] Move
`;

characters = [];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7,
};

/** @type {{pos: Vector, vel: Vector, speed: number}} */
let ballRoot;
/** @type {{pos: Vector, vel: Vector}} */
let ballWake;
let ballDist;
/** @type {Color}} */
let wakeColor;
let wakeDist;
let wakeCount;
let ballPos;
let isHittingRacket;
let multiplier;
const ballSize = 3;

function update() {
  if (!ticks) {
    ballRoot = {
      pos: vec(50, 50),
      vel: vec().addWithAngle(PI / 4, ballSize),
      speed: 1,
    };
    ballWake = {
      pos: vec(),
      vel: vec(),
    };
    wakeColor = "light_black";
    ballDist = wakeDist = wakeCount = 0;
    ballPos = vec();
    multiplier = 1;
    isHittingRacket = false;
  }
  color("light_blue");
  rect(0, 0, 7, 100);
  rect(93, 0, 7, 100);
  const rx = clamp(input.pos.x, 17, 83);
  color("blue");
  box(rx, 5, 20, 5);
  box(rx, 95, 20, 5);
  wakeColor = "light_black";
  wakeDist = 0;
  wakeCount = 99;
  ballDist += ballRoot.speed;
  ballWake.pos.set(ballRoot.pos);
  ballWake.vel.set(ballRoot.vel);
  isHittingRacket = false;
  while (wakeCount > 0) {
    updateBall();
    wakeCount--;
  }
  // @ts-ignore
  if (wakeColor === "light_green") {
    ballRoot.speed += difficulty;
  } else {
    ballRoot.speed = difficulty;
  }
  color("black");
  box(ballPos, ballSize);
  if (ballPos.y < 0 || ballPos.y > 99) {
    play("explosion");
    end();
  }
  if (isHittingRacket) {
    ballDist = 0;
    addScore(floor(multiplier), ballPos.x, clamp(ballPos.y, 30, 80));
    multiplier += 10;
    if (multiplier > 100) {
      ballRoot.vel.x += rnds(1);
      ballRoot.vel.normalize().mul(3);
    }
  }
  multiplier = clamp(multiplier * 0.99, 1, 100.99);
  text(`x${floor(multiplier)}`, 3, 9);

  function updateBall() {
    wakeDist += ballSize;
    if (wakeColor === "light_black" && wakeDist >= ballDist) {
      const r = (wakeDist - ballDist) / ballSize;
      ballPos.set(
        ballWake.pos.x + ballWake.vel.x * (1 - r),
        ballWake.pos.y + ballWake.vel.y * (1 - r)
      );
      wakeColor = "light_cyan";
    }
    if (
      wakeColor === "light_cyan" &&
      (ballWake.pos.y < 7 || ballWake.pos.y > 93)
    ) {
      wakeColor = "light_red";
      wakeCount = 5;
    }
    ballWake.pos.add(ballWake.vel);
    color(wakeColor);
    const c = box(ballWake.pos, ballSize).isColliding.rect;
    if (c.light_blue) {
      if (
        (ballWake.pos.x < 50 && ballWake.vel.x < 0) ||
        (ballWake.pos.x > 50 && ballWake.vel.x > 0)
      ) {
        ballWake.vel.x *= -1;
      }
    }
    if (
      c.blue &&
      ((ballWake.pos.y < 50 && ballWake.vel.y < 0) ||
        (ballWake.pos.y > 50 && ballWake.vel.y > 0))
    ) {
      const d = (ballWake.pos.x - rx) / 10;
      if (abs(d) < 0.6) {
        ballWake.vel.y *= -1;
      } else {
        let a = d > 0 ? PI / 4 + (1 - d) : (PI / 4) * 3 - (1 + d);
        if (ballWake.pos.y > 50) {
          a *= -1;
        }
        ballWake.vel.set().addWithAngle(a, ballSize);
      }
      if (wakeDist < ballDist) {
        play("hit");
        ballRoot.pos.set(ballWake.pos);
        ballRoot.vel.set(ballWake.vel);
        ballPos.set(ballWake.pos);
        isHittingRacket = true;
      }
      wakeColor = "light_green";
      wakeCount = 9;
    }
  }
}
