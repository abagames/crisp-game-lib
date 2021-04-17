title = "TWO LANE";

description = `
[Tap]
 Change Lane
[Hold] 
 Accel
`;

characters = [
  `
ll  ll
llrrll
  rr
 rppr
llrrll
ll  ll
`,
  `
 yyyy
yyYYyy
yyYYyy
yyYYyy
yyYYyy
 yyyy
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 10,
};

/**
 * @type {{
 * y: number, type: "left" | "right" | "both", coin: "left" | "right"| "none",
 * index: number
 * }[]}
 */
let roads;
let speed;
let x;
let targetX;
let currentType;
let lastScore;
let multiplier;
let lastMultiplier;
let isOutOfCourse;

function update() {
  if (!ticks) {
    roads = times(12, (i) => {
      return {
        y: i * 10 - 10,
        type: "both",
        coin: "none",
        index: i,
      };
    });
    speed = 1;
    x = targetX = 30;
    currentType = "both";
    lastScore = 0;
    multiplier = lastMultiplier = 1;
    isOutOfCourse = false;
  }
  color("light_green");
  rect(0, 0, 100, 100);
  if (input.isJustPressed) {
    play("laser");
    targetX = targetX === 30 ? 70 : 30;
  }
  if (isOutOfCourse) {
    speed *= 1 - 0.1 * sqrt(difficulty);
    if (speed < 0.1) {
      play("lucky");
      end();
    }
  } else if (input.isPressed) {
    speed += difficulty * 0.02;
  } else {
    speed += (difficulty - speed) * 0.1;
  }
  const sl = clamp(difficulty * 3, 1, 9);
  if (speed > sl) {
    speed = sl;
  }
  x += (targetX - x) * (0.15 * sqrt(speed));
  color("black");
  char("a", x, 90);
  roads.forEach((r) => {
    const py = r.y;
    r.y = wrap(r.y + speed, -10, 110);
    if (r.y < py) {
      if (rnd() < 0.1) {
        r.type =
          currentType === "both" ? (rnd() < 0.5 ? "left" : "right") : "both";
        currentType = r.type;
      } else {
        r.type = currentType;
      }
      if (r.coin !== "none") {
        if (multiplier > 1) {
          multiplier--;
        }
      }
      if (rnd() < 0.2) {
        r.coin = r.type === "both" ? (rnd() < 0.5 ? "left" : "right") : r.type;
      } else {
        r.coin = "none";
      }
    }
    color("light_black");
    rect(r.type === "right" ? 50 : 10, r.y, r.type === "both" ? 80 : 40, 10);
    color("white");
    if (r.index % 2 === 0) {
      if (r.type === "left" || r.type === "both") {
        rect(11, r.y, 5, 10);
      }
      if (r.type === "right" || r.type === "both") {
        rect(84, r.y, 5, 10);
      }
    } else {
      rect(r.type === "right" ? 50 : 47, r.y, r.type === "both" ? 6 : 3, 10);
    }
    if (r.coin !== "none") {
      color("black");
      const x = r.coin === "left" ? 30 : 70;
      if (char("b", x, r.y + 5).isColliding.char.a) {
        play("coin");
        lastScore = floor(speed * speed + 1);
        lastMultiplier = multiplier;
        addScore(lastScore * multiplier);
        if (multiplier < 32) {
          multiplier++;
        }
        r.coin = "none";
      }
    }
  });
  color("black");
  const c = char("a", x, 90).isColliding.rect;
  if (!c.light_black && !c.white) {
    play("hit");
    isOutOfCourse = true;
    multiplier = 1;
  } else {
    isOutOfCourse = false;
  }
  if (lastScore > 0) {
    color("black");
    text(`+${lastScore}x${lastMultiplier}`, 3, 9);
  }
}
