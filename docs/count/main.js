title = "COUNT";

description = `
[Tap]
Stop counter
`;

characters = [
  `
  rr
 rRRr
rRRRRr
rRRRRr
 rRRr
  rr
`,
  `
  gg
 gGGg
gGGGGg
gGGGGg
 gGGg
  gg
`,
  `
  bb
 bBBb
bBBBBb
bBBBBb
 bBBb
  bb
`,
  `
rrrrrr
rRRRRr
rRRRRr
rRRRRr
rRRRRr
rrrrrr
`,
  `
gggggg
gGGGGg
gGGGGg
gGGGGg
gGGGGg
gggggg
`,
  `
bbbbbb
bBBBBb
bBBBBb
bBBBBb
bBBBBb
bbbbbb
`,
  `
  rr
  rr
 rRRr
 rRRr
rRRRRr
rrrrrr
`,
  `
  gg
  gg
 gGGg
 gGGg
gGGGGg
gggggg
`,
  `
  bb
  bb
 bBBb
 bBBb
bBBBBb
bbbbbb
`,
];

options = {
  isPlayingBgm: true,
};

let objs,
  count,
  countTicks,
  targets,
  targetCount,
  turn,
  isPressed,
  nextTurnTicks;

function update() {
  if (ticks === 0) {
    objs = [];
    turn = 1;
    isPressed = false;
  }
  if (objs.length === 0) {
    function checkNearest(obj) {
      let isColliding = false;
      objs.forEach((o) => {
        if (o.p.distanceTo(obj.p) < (o.scale + obj.scale) * 3) {
          isColliding = true;
        }
      });
      return isColliding;
    }
    objs = [];
    const scaleMax = rnd() > wrap(sqrt(turn) * 0.1, 0, 0.5) ? 1 : 3;
    let isRandType = rnd() > wrap(sqrt(turn) * 0.2, 0.5, 1) ? false : true;
    let isRandColor = rnd() > wrap(sqrt(turn) * 0.2, 0.5, 1) ? false : true;
    if (!isRandType && !isRandColor) {
      if (rnd() < 0.5) {
        isRandType = true;
      } else {
        isRandColor = true;
      }
    }
    let isTypeTarget = isRandType;
    let isColorTarget = isRandColor;
    if (isTypeTarget && isColorTarget) {
      if (rnd() < 0.5) {
        isTypeTarget = false;
      } else {
        isColorTarget = false;
      }
    }
    const ty = rndi(3);
    const cl = rndi(3);
    range(3 + floor(sqrt(turn) + rndi(turn))).forEach(() => {
      const o = {
        p: vec(rnd(10, 90), rnd(30, 90)),
        type: isRandType ? rndi(3) : ty,
        color: isRandColor ? rndi(3) : cl,
        scale: rnd(1, scaleMax),
        isTarget: false,
      };
      if (!checkNearest(o)) {
        objs.push(o);
      }
    });
    const target = objs[rndi(objs.length)];
    targetCount = 0;
    const targetObjs = {};
    objs.forEach((o) => {
      if (
        (!isTypeTarget || o.type === target.type) &&
        (!isColorTarget || o.color === target.color)
      ) {
        o.isTarget = true;
        const to = { type: o.type, color: o.color };
        targetObjs[JSON.stringify(to)] = true;
        targetCount++;
      }
    });
    targets = Object.keys(targetObjs).map((to) => JSON.parse(to));
    count = 0;
    countTicks = 79;
    isPressed = false;
  }
  text("How many", 4, 12);
  let x = 56;
  targets.forEach((o) => {
    char(addWithCharCode("a", o.type * 3 + o.color), x, 12, {});
    x += 7;
  });
  text(`? ${count}`, x, 12);
  if (!isPressed) {
    objs.forEach((o) => {
      char(addWithCharCode("a", o.type * 3 + o.color), o.p, {
        scale: { x: o.scale, y: o.scale },
      });
    });
    countTicks -= difficulty;
    if (input.isJustPressed || count > targetCount) {
      isPressed = true;
      nextTurnTicks = 0;
      if (count === targetCount) {
        addScore(1);
        play("powerUp");
      } else {
        play("lucky");
      }
    } else if (countTicks < 0) {
      play("select");
      count++;
      countTicks = 60;
    }
  } else {
    if (count === targetCount) {
      text("OK!", 80, 20);
    } else {
      text("ERROR", 70, 20);
    }
    nextTurnTicks++;
    if (nextTurnTicks > 90) {
      if (count === targetCount) {
        turn++;
        objs = [];
      } else {
        end();
        return;
      }
    }
    text(`${targetCount}`, 50, 50, { scale: { x: 3, y: 3 } });
    objs.forEach((o) => {
      if (o.isTarget) {
        char(addWithCharCode("a", o.type * 3 + o.color), o.p, {
          scale: { x: o.scale, y: o.scale },
        });
      }
    });
  }
}
