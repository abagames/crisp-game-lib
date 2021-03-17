title = "TWIN P";

description = `
[Hold] Stretch
[Release] Pin
`;

characters = [];

options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
};

/** @type {Vector} */
let pos;
let angle;
let len;
let targetLen;
let colorFlag;
/** @type {{pos:Vector, vel: Vector, type: "o" | "x", isIn: boolean}[]} */
let objs;
let objAddTicks;
let crossAddCount;
let multiplier;

function update() {
  if (!ticks) {
    pos = vec(40, 50);
    angle = 0;
    len = targetLen = 15;
    colorFlag = true;
    objs = [];
    objAddTicks = 0;
    crossAddCount = 9;
    multiplier = 1;
  }
  const np = vec(pos).addWithAngle(angle, len);
  color("black");
  line(pos, np, 2);
  color(colorFlag ? "red" : "blue");
  text("P", pos.x + 3, pos.y - 3);
  color(colorFlag ? "blue" : "red");
  text("P", np.x + 3, np.y - 3);
  if (!pos.isInRect(0, 0, 99, 99) && !np.isInRect(0, 0, 99, 99)) {
    play("lucky");
    color("red");
    text("X", pos);
    text("X", np);
    end();
  }
  if (input.isJustReleased) {
    play("select");
    colorFlag = !colorFlag;
    pos.set(np);
    angle += PI;
    targetLen = 15;
  } else if (input.isPressed) {
    play("laser");
    if (targetLen < 99) {
      targetLen += difficulty * 0.2;
    }
  }
  angle += difficulty * 0.05;
  len += (targetLen - len) * 0.2;
  objAddTicks--;
  if (objAddTicks < 0) {
    const type = crossAddCount === 0 ? "x" : "o";
    const pos = vec(50, 50).addWithAngle(rnd(PI * 2), 80);
    objs.push({
      pos,
      vel: vec().addWithAngle(
        pos.angleTo(rnd(20, 80), rnd(20, 80)),
        rnd(1, difficulty) * 0.2
      ),
      type,
      isIn: false,
    });
    crossAddCount--;
    if (crossAddCount < 0) {
      crossAddCount = rndi(8, 12);
    }
    objAddTicks = rnd(60, 90) / difficulty;
  }
  objs = objs.filter((o) => {
    o.pos.add(o.vel);
    if (o.pos.isInRect(-5, -5, 110, 110)) {
      o.isIn = true;
    } else if (o.isIn) {
      if (o.type === "o") {
        if (multiplier > 1) {
          play("hit");
          multiplier--;
        }
      }
      return false;
    }
    if (o.type === "o") {
      color("yellow");
      if (box(o.pos, 4).isColliding.rect.black) {
        play("coin");
        addScore(multiplier, o.pos);
        multiplier++;
        return false;
      }
    } else {
      color("purple");
      const c1 = bar(o.pos, 4, 2, PI / 4).isColliding.rect.black;
      const c2 = bar(o.pos, 4, 2, -PI / 4).isColliding.rect.black;
      if (c1 || c2) {
        play("lucky");
        end();
      }
    }
    return true;
  });
}
