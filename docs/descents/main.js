title = "DESCENT S";

description = `
[Hold] Thrust up
`;

characters = [
  `
l cc
lllll
llllll
`,
  `
  ll
  ll
  ll
llllll
 llll
  ll
`,
  `
ll
  l
 l
lll
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/**
 * @type {{
 * pos:Vector, vel:Vector, up: number, down: number
 * nextUp: number, nextDown: number
 * }}
 */
let ship;
/** @type {{pos:Vector, width: number}[]} */
let decks;

function update() {
  if (!ticks) {
    ship = {
      pos: vec(9, 9),
      vel: vec(0.2),
      up: -2,
      down: 2,
      nextUp: -3,
      nextDown: 3,
    };
    decks = [
      {
        pos: vec(30, 50),
        width: 40,
      },
      {
        pos: vec(50, 75),
        width: 35,
      },
      {
        pos: vec(70, 99),
        width: 30,
      },
    ];
  }
  ship.vel.y += input.isPressed ? ship.up * 0.005 : ship.down * 0.005;
  if (input.isJustPressed) {
    play("coin");
  }
  if (input.isJustReleased) {
    play("laser");
  }
  ship.pos.y += ship.vel.y;
  color(ship.vel.y > 1 ? "red" : ship.vel.y > 0.6 ? "yellow" : "blue");
  rect(1, 20, 3, ship.vel.y * 20);
  color("red");
  rect(0, 40, 5, 1);
  let scrY = 0;
  if (ship.pos.y > 19) {
    scrY = (19 - ship.pos.y) * 0.2;
  } else if (ship.pos.y < 9) {
    scrY = (9 - ship.pos.y) * 0.2;
  }
  ship.pos.y += scrY;
  decks.forEach((d, i) => {
    color(i === 0 ? "black" : "light_black");
    d.pos.add(-ship.vel.x, scrY);
    rect(d.pos, d.width, 3);
    if (i === 0) {
      color("yellow");
      rect(0, d.pos.y + 3, d.pos.x + d.width, 2);
      rect(d.pos.x + d.width, 0, 1, d.pos.y + 5);
    }
  });
  color("black");
  const c = char("a", ship.pos).isColliding.rect;
  if (c.black) {
    if (ship.vel.y > 1) {
      play("explosion");
      end();
    } else {
      const d = decks.shift();
      play("powerUp");
      addScore(floor(d.pos.x + d.width - ship.pos.x + 1), ship.pos);
      const ld = decks[decks.length - 1];
      decks.push({
        pos: vec(ld.pos.x + ld.width * 0.7 + rnd(30), ld.pos.y + rnd(20, 40)),
        width: rnd(25, 50),
      });
      ship.up = ship.nextUp;
      ship.down = ship.nextDown;
      ship.nextUp = floor(-difficulty * 4 + rnds(difficulty * 3));
      ship.nextDown = floor(difficulty * 4 + rnds(difficulty * 2));
      ship.vel.set(difficulty * 0.2, 0);
    }
  }
  if (c.yellow || ship.pos.y < 0) {
    play("explosion");
    end();
  }
  color(input.isPressed ? "yellow" : "cyan");
  char("b", 60, 10, { mirror: { y: -1 } });
  color("black");
  text(`${-ship.up}m/s`, 76 - (-ship.up > 9 ? 6 : 0), 10);
  char("c", 97, 9);
  color(!input.isPressed ? "yellow" : "cyan");
  char("b", 60, 17);
  color("black");
  text(`${ship.down}m/s`, 76 - (ship.down > 9 ? 6 : 0), 17);
  char("c", 97, 16);
  text("NEXT", 70, 24);
  color("cyan");
  char("b", 60, 31, { mirror: { y: -1 } });
  color("black");
  text(`${abs(ship.nextUp)}m/s`, 76 - (-ship.nextUp > 9 ? 6 : 0), 31);
  char("c", 97, 30);
  color("cyan");
  char("b", 60, 38);
  color("black");
  text(`${ship.nextDown}m/s`, 76 - (ship.nextDown > 9 ? 6 : 0), 38);
  char("c", 97, 37);
}
