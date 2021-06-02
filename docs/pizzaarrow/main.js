title = "PIZZA ARROW";

description = `
[Hold]
 Pull
[Release]
 Release
`;

characters = [
  `
 r   r
rrllll
 r   r
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

/** @type {{from: number, to: number, angle: number, angleVel: number, y: number}} */
let pizza;
/** @type {{from: number, to: number, angle: number, pos: Vector}} */
let pizzaPart;
/** @type {{x: number, vx: number}} */
let arrow;
let arrowCount;
let nextArrowCount;
let nextPizzaTicks;
let gameSpeed;
let multiplier;

function update() {
  if (!ticks) {
    pizza = undefined;
    arrow = undefined;
    arrowCount = nextArrowCount = 1;
    nextPizzaTicks = 16;
    gameSpeed = 1;
    multiplier = 1;
  }
  nextPizzaTicks--;
  if (nextPizzaTicks >= 0) {
    if (nextPizzaTicks <= 15) {
      if (nextPizzaTicks === 15) {
        pizza = {
          from: PI / 4,
          to: (PI / 4) * 7,
          angle: rnd(PI / 2),
          angleVel: 0.2,
          y: 0,
        };
      }
      pizza.y = 50 - nextPizzaTicks * 5;
      multiplier = 1;
    } else {
      pizza.y = (30 - nextPizzaTicks) * 5 + 50;
    }
  }
  color("yellow");
  const c = vec(30, pizza.y);
  const f = pizza.from + pizza.angle;
  const t = pizza.to + pizza.angle;
  arc(c, 20, 4, f, t);
  const lf = vec(c);
  const lt = vec(c);
  line(lf.addWithAngle(f, 5), lt.addWithAngle(f, 20), 4);
  lf.set(c);
  lt.set(c);
  line(lf.addWithAngle(t, 5), lt.addWithAngle(t, 20), 4);
  color("red");
  arc(30, pizza.y, 5, 4, f, t - PI * 2);
  pizza.angle += pizza.angleVel * gameSpeed;
  if (nextPizzaTicks < 0 && arrow == null && input.isPressed) {
    play("select");
    arrow = { x: 80, vx: 1 };
    arrowCount--;
  }
  if (nextPizzaTicks < 0) {
    color("black");
    times(arrowCount, (i) => {
      char("a", 95, 40 - i * 3);
    });
    text(`x${multiplier}`, 3, 10);
  }
  if (arrow != null) {
    if (input.isPressed) {
      gameSpeed += (0.05 - gameSpeed) * 0.1;
    }
    if (input.isJustReleased || arrow.x > 90) {
      play("laser");
      arrow.vx = -5;
    }
    if (arrow.vx < 0) {
      gameSpeed += (1 - gameSpeed) * 0.2;
    }
    if (arrow.x > 70) {
      color("light_black");
      line(80, 30, arrow.x + 4, 51, 2);
      line(80, 70, arrow.x + 4, 51, 2);
    }
    arrow.x += arrow.vx * gameSpeed;
    color("black");
    const c = char("a", arrow.x, 50).isColliding.rect;
    if (c.yellow) {
      play("hit");
      const a = wrap(-pizza.angle, 0, PI * 2);
      if (a > pizza.from && a < pizza.to) {
        let sa;
        if (a - pizza.from > pizza.to - a) {
          sa = pizza.to - a;
          pizzaPart = {
            from: a,
            to: pizza.to,
            angle: pizza.angle,
            pos: vec(30, 50),
          };
          pizza.to = a;
        } else {
          sa = a - pizza.from;
          pizzaPart = {
            from: pizza.from,
            to: a,
            angle: pizza.angle,
            pos: vec(30, 50),
          };
          pizza.from = a;
        }
        play("coin");
        addScore(ceil(sa * 100 * multiplier), 40, 50);
        multiplier++;
      }
      arrow = undefined;
      if (arrowCount === 0) {
        play("powerUp");
        nextArrowCount++;
        arrowCount = nextArrowCount;
        nextPizzaTicks = 30;
      }
    } else if (c.red) {
      play("explosion");
      arrow = undefined;
      end();
    }
  }
  if (pizzaPart != null) {
    pizzaPart.pos.add(-5, 3);
    color("light_yellow");
    const c = vec(pizzaPart.pos);
    const f = pizzaPart.from + pizzaPart.angle;
    const t = pizzaPart.to + pizzaPart.angle;
    arc(c, 20, 4, f, t);
    const lf = vec(c);
    const lt = vec(c);
    line(lf.addWithAngle(f, 5), lt.addWithAngle(f, 20), 4);
    lf.set(c);
    lt.set(c);
    line(lf.addWithAngle(t, 5), lt.addWithAngle(t, 20), 4);
    if (pizzaPart.pos.x < -20) {
      pizzaPart = undefined;
    }
  }
}
