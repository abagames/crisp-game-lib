title = "CHARGE BEAM";

description = `
[Tap]     Shot
[Hold]    Charge
[Release] Fire
`;

characters = [
  `
rllbb
lllccb
llyl b
`,
  `
  r rr
rrrrrr
  grr
  grr
rrrrrr
  r rr
`,
  `
 LLLL
LyyyyL
LyyyyL
LyyyyL
LyyyyL
 LLLL
`,
  `
   bbb
  bccb
bbllcb
bcllcb
  bccb
   bbb
`,
  `
l llll
l llll
`,
];

options = {
  viewSize: { x: 200, y: 60 },
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/** @type {{x: number, size: number, type: "enemy" | "coin"}[]} */
let objs;
let nextObjDist;
let inhalingCoins;
let coinMultiplier;
let coinPenaltyMultiplier;
let enemyMultiplier;
let shotX;
let shotSize;
let charge;
let penaltyVx;
let prevType;

function update() {
  if (!ticks) {
    objs = [{ x: 150, size: 1, type: "enemy" }];
    for (let i = 0; i < 3; i++) {
      objs.push({ x: 160 + i * 10, size: 1, type: "coin" });
    }
    nextObjDist = 30;
    inhalingCoins = [];
    coinMultiplier = enemyMultiplier = coinPenaltyMultiplier = 1;
    shotX = shotSize = undefined;
    charge = 0;
    penaltyVx = 0;
    prevType = "coin";
  }
  if (shotX == null) {
    text("BEAM", 30, 55);
    if (input.isPressed && charge < 99) {
      play("hit");
      charge += difficulty * 1.5;
      color("cyan");
      let c = charge;
      let x = 60;
      if (c < 25) {
        rect(x, 53, c, 5);
        shotSize = 1;
      } else {
        rect(x, 53, 25, 5);
        c -= 25;
        x += 27;
        shotSize = 1;
        while (c > 9) {
          rect(x, 53, 9, 5);
          x += 11;
          c -= 9;
          shotSize++;
        }
        rect(x, 53, c, 5);
        shotSize++;
      }
      color("black");
    } else if (charge > 0) {
      play("laser");
      shotX = 10;
      charge = 0;
      coinMultiplier = enemyMultiplier = coinPenaltyMultiplier = 1;
    }
  }
  if (shotX != null) {
    shotX += difficulty * 2.5;
    let x = shotX;
    if (shotSize === 1) {
      char("e", shotX, 30);
    } else {
      for (let i = 0; i < shotSize; i++) {
        if (shotSize % 2 === 1 && i === 0) {
          char("d", x, 30);
          x += 6;
        } else {
          if (i % 2 === shotSize % 2) {
            char("d", x, 27);
          } else {
            char("d", x, 33);
            x += 6;
          }
        }
      }
    }
    if (shotX > 203) {
      shotX = undefined;
    }
  }
  penaltyVx -= 0.02;
  if (penaltyVx < 0) {
    penaltyVx = 0;
  }
  const vx = (-difficulty - penaltyVx) * 0.5;
  color("red");
  for (let i = 0; i < ceil(penaltyVx * 2 + 0.1); i++) {
    text("<", i * 6 + 3, 48);
  }
  color("black");
  nextObjDist += vx;
  if (nextObjDist < 0) {
    const type = prevType !== "coin" && rnd() < 0.5 ? "coin" : "enemy";
    prevType = type;
    const c = rndi(3, 9);
    let x = 200;
    if (type === "coin") {
      for (let i = 0; i < c; i++) {
        objs.push({ x, size: 1, type: "coin" });
        x += 10;
      }
    } else {
      for (let i = 0; i < c; i++) {
        const size = rnd() < 0.3 ? rndi(2, 6) : 1;
        objs.push({
          x,
          size,
          type: "enemy",
        });
        x += 10 + ceil((size - 1) / 2) * 6;
      }
    }
    x += 10;
    nextObjDist = x - 200;
  }
  let minCoinX = 999;
  let minEnemyX = 999;
  objs = objs.filter((o) => {
    o.x += vx;
    if (o.type === "coin") {
      if (o.x < minCoinX) {
        minCoinX = o.x;
      }
    } else {
      if (o.x < minEnemyX) {
        minEnemyX = o.x;
      }
    }
    if (o.type === "coin") {
      const c = char("c", o.x, 30).isColliding.char;
      if (c.d || c.e) {
        addCoinPenalty(o, c);
        return false;
      }
      if (c.b || c.c) {
        return false;
      }
    } else {
      let x = o.x;
      let c = {};
      for (let i = 0; i < o.size; i++) {
        if (o.size % 2 === 1 && i === 0) {
          c = { ...c, ...char("b", x, 30).isColliding.char };
          x += 6;
        } else {
          if (i % 2 === o.size % 2) {
            c = { ...c, ...char("b", x, 27).isColliding.char };
          } else {
            c = { ...c, ...char("b", x, 33).isColliding.char };
            x += 6;
          }
        }
      }
      if (c.d || c.e) {
        play("explosion");
        if (c.e) {
          shotX = undefined;
        }
        if (o.size <= shotSize) {
          particle(o.x, 30, o.size * 3);
          addScore(enemyMultiplier * o.size, o.x, 30);
          enemyMultiplier++;
          if (o.size > 1) {
            shotSize -= o.size;
            if (shotSize <= 0) {
              shotX = undefined;
            }
          }
          return false;
        } else {
          o.size -= shotSize;
          shotX = undefined;
        }
      }
      if (c.b || c.c) {
        return false;
      }
    }
    return true;
  });
  if (minCoinX > 200 && minEnemyX > 200) {
    nextObjDist = 0;
  }
  if (minCoinX < minEnemyX) {
    objs = objs.filter((o) => {
      if (o.type === "coin" && o.x < minEnemyX) {
        inhalingCoins.push({ x: o.x, vx: -1 });
        return false;
      }
      return true;
    });
  }
  if (char("a", 10, 30).isColliding.char.b) {
    play("lucky");
    end();
  }
  inhalingCoins = inhalingCoins.filter((o) => {
    o.x += o.vx;
    o.vx -= 0.1;
    const c = char("c", o.x, 30).isColliding.char;
    if (c.d || c.e) {
      addCoinPenalty(o, c);
      return false;
    }
    if (o.x < 10) {
      play("coin");
      addScore(coinMultiplier, 10 + sqrt(coinMultiplier) * 4, 30);
      if (coinMultiplier < 64) {
        coinMultiplier *= 2;
      }
      return false;
    }
    return true;
  });

  function addCoinPenalty(o, c) {
    play("powerUp");
    particle(o.x, 30, 9, 5);
    if (c.e) {
      shotX = undefined;
    }
    addScore(-coinPenaltyMultiplier, o.x + sqrt(coinPenaltyMultiplier) * 4, 50);
    if (coinPenaltyMultiplier < 64) {
      coinPenaltyMultiplier *= 2;
    }
    penaltyVx += 0.5;
  }
}
