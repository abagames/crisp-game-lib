title = "SLASHES";

description = `
[Tap] Turn
`;

characters = [];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 3,
};

/** @type { {pos: Vector, angle: number, width: number, isAppearing: boolean}[]} */
let slashes;
let slashAddTicks;
let playerAngle;
let speed;
let addingScore;

function update() {
  if (!ticks) {
    slashes = [
      {
        pos: vec(22, 50),
        angle: PI / 4,
        width: 30,
        isAppearing: false,
      },
    ];
    slashAddTicks = 0;
    playerAngle = 1;
    speed = 1;
    addingScore = 0;
  }
  if (input.isJustPressed) {
    play("select");
    playerAngle *= -1;
  }
  speed += (difficulty - speed) * 0.03;
  const scroll = vec(speed * playerAngle, speed);
  slashAddTicks -= difficulty;
  if (slashAddTicks < 0) {
    const w = rndi(20, 50) + 20;
    slashes.push({
      pos: vec(rndi(-99, 199), -w),
      angle: rnd() < 0.5 ? -PI / 4 : PI / 4,
      width: w,
      isAppearing: true,
    });
    slashAddTicks += rnd(10, 15);
  }
  slashes.forEach((s) => {
    color("light_purple");
    bar(s.pos, s.width, 22, s.angle);
  });
  slashes = slashes.filter((s) => {
    color("purple");
    const c = bar(s.pos, s.width, s.isAppearing ? 20 : 4, s.angle).isColliding
      .rect;
    if (s.isAppearing) {
      if (c.purple) {
        return false;
      }
      s.isAppearing = false;
      s.width -= 20;
    }
    s.pos.add(scroll);
    return s.pos.y < 99 + s.width;
  });
  color("black");
  const pa = -(playerAngle * PI) / 4 + PI / 2;
  const c = bar(50, 90, 4, 3, pa, 0.9).isColliding.rect;
  if (c.purple) {
    play("explosion");
    end();
  } else if (c.light_purple) {
    play("laser");
    speed += 0.03 * difficulty;
    addingScore += speed;
    particle(50, 90, 3, speed * 2, pa, 0.3);
  } else {
    particle(50, 90, 1, speed, pa, 0);
    if (addingScore > 0) {
      play("powerUp");
      addScore(addingScore, 50, 90);
      addingScore = 0;
    }
  }
}
