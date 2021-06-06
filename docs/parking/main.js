title = "PARKING";

description = `
[Hold]
 Turn right
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 3,
};

/** @type {{pos: Vector, color: Color}[]} */
let cars;
let carAngle;
let carCount;
let nextCarDist;
/** @type {{pos: Vector, angle: number, color: Color}[]} */
let parkedCars;
let nextParkedCarDist;
let gold;
let roadY;
let multiplier;

function update() {
  if (!ticks) {
    cars = [];
    carAngle = -PI / 2;
    nextCarDist = 0;
    carCount = 1;
    parkedCars = [];
    nextParkedCarDist = 0;
    gold = undefined;
    roadY = 0;
    multiplier = 1;
  }
  const carSpeed = difficulty;
  let scr = carSpeed * 1.05;
  if (cars.length > 0) {
    const cy = cars[0].pos.y;
    if (cy < 50) {
      scr += (50 - cy) * 0.1;
    }
  } else {
    nextCarDist--;
  }
  roadY -= scr;
  color("light_black");
  rect(0, 0, 11, 100);
  rect(89, 0, 11, 100);
  times(3, (x) => {
    const lx = 30 + x * 20;
    times(6, (y) => {
      const ly = y * 20 - (roadY % 20) - 10;
      box(lx, ly, 3, 10);
    });
  });
  color("light_yellow");
  rect(82, (-roadY % 93) + 6, 7, 90);
  rect(82, (-roadY % 93) - 88, 7, 90);
  color("white");
  box(93, (-roadY % 200) - 50, 7, 44);
  color("light_black");
  let ly = (-roadY % 200) - 69;
  ["P", "A", "R", "K", "I", "N", "G"].forEach((c) => {
    text(c, 92, ly);
    ly += 6;
  });
  if (gold == null) {
    gold = vec(rnd(40, 70), rnd(-50, -20));
  }
  color("yellow");
  box(gold, 8);
  color("white");
  text("$", gold);
  gold.y += scr;
  if (gold.y > 103) {
    if (multiplier > 1) {
      multiplier--;
    }
    gold = undefined;
  }
  nextParkedCarDist -= scr;
  if (nextParkedCarDist < 0) {
    play("laser");
    parkedCars.push({
      pos: vec(rnd(80, 84), -5),
      angle: rnd((-PI / 8) * 3, -PI / 8),
      // @ts-ignore
      color: ["red", "blue", "cyan", "purple"][rndi(4)],
    });
    nextParkedCarDist = rnd() < 0.7 ? rnd(8, 12) : rnd(100, 200);
  }
  remove(parkedCars, (c) => {
    c.pos.y += scr;
    drawCar(c.pos, c.angle, c.color);
    return c.pos.y > 105;
  });
  nextCarDist -= scr - carSpeed;
  if (cars.length < carCount && nextCarDist < 0) {
    play("hit");
    cars.push({
      pos: vec(rnd(20, 60), -5),
      // @ts-ignore
      color: ["red", "blue", "cyan", "purple"][rndi(4)],
    });
    nextCarDist = 15 * sqrt(difficulty);
  }
  carAngle += (input.isPressed ? 1 : -1) * sqrt(difficulty) * 0.1;
  carAngle = clamp(carAngle, -PI / 2, 0);
  remove(cars, (c) => {
    const ca = c.pos.y < 3 ? -PI / 2 : carAngle;
    c.pos.addWithAngle(ca, carSpeed);
    c.pos.y += scr;
    const cl = drawCar(c.pos, ca, c.color).rect;
    if (cl.red || cl.blue || cl.cyan || cl.purple) {
      play("explosion");
      color("light_red");
      text("X", c.pos);
      end();
    }
    if (cl.light_yellow) {
      play("powerUp");
      addScore(multiplier * 10, c.pos);
      parkedCars.push({ pos: c.pos, angle: carAngle, color: c.color });
      carCount += 1 / carCount;
      return true;
    }
    if (cl.yellow) {
      if (gold.y > -3) {
        play("coin");
        addScore(multiplier, gold);
        multiplier++;
      }
      gold = undefined;
    }
    if (c.pos.y > 103) {
      play("explosion");
      color("light_red");
      text("X", c.pos.x, 96);
      end();
    }
  });

  function drawCar(p, a, c) {
    const o = vec();
    color("black");
    o.set(p).addWithAngle(a + PI / 4, 3);
    box(o, 3);
    o.set(p).addWithAngle(a + (PI / 4) * 3, 3);
    box(o, 3);
    o.set(p).addWithAngle(a + (PI / 4) * 5, 3);
    box(o, 3);
    o.set(p).addWithAngle(a + (PI / 4) * 7, 3);
    box(o, 3);
    color(c);
    return bar(p, 4, 4, a).isColliding;
  }
}
