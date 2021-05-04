title = "PHOTON LINE";

description = `
[Tap]  Turn
[Hold] Flick
`;

characters = [
  `
rllllr
lrllrl
ll lll 
llllll
lrllrl
rllllr
`,
  `
r pprr
 ppprr
pp ppp
pppppp
rrppp
rrpp r
`,
  `
r yyrr
 yyyrr
yy yyy
yyyyyy
rryyy
rryy r
`,
  `
r ccrr
 cccrr
cc ccc
cccccc
rrccc
rrcc r
`,
  `
r ggrr
 gggrr
gg ggg
gggggg
rrggg
rrgg r
`,
  `
r    b
 r  b
  rb
  br
 b  r
b    r
`,
  `
   l
llllll
l    l
 llll
 ll
l llll
`,
  `
   l l
llllll
l   l
lll ll
l l ll
l l ll
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
};

/** @type {{angle: number, isRotating: boolean, ta: number, hands:number[][] }} */
let player;
/** @type {number[][]}} */
let target;
/**
 * @type {{
 * x: number, vx: number, index: number, w: number, isReflected: boolean
 * }[]}
 */
let photons;
let nextPhotonTicks;
let appWidth;
let world;
let step;
let nextStepTicks;
let colorCount;
let nextPhotons;

function update() {
  if (!ticks) {
    player = {
      angle: 0,
      isRotating: false,
      ta: 0,
      hands: [[0], [1]],
    };
    target = [[0], [1]];
    photons = [];
    nextPhotonTicks = 0;
    world = step = 1;
    nextStepTicks = 0;
    appWidth = 30;
    colorCount = 2;
    nextPhotons = [];
  }
  if (nextStepTicks === 0) {
    if (step > clamp(world + 1, 1, 5)) {
      step = 1;
      world++;
      colorCount = clamp(rndi(2, world + 2), 2, 4);
      target = [[rndi(colorCount)], [rndi(colorCount)]];
      player.hands = [[target[0][0]], [target[1][0]]];
    }
    const prevTarget = [[], []];
    times(2, (i) =>
      target[i].forEach((c) => {
        prevTarget[i].push(c);
      })
    );
    target[0].splice(4);
    target[1].splice(4);
    const cr = 3 / colorCount;
    const ac = round(rnd(1, world) * cr);
    let dc = round(clamp(rnd(world) - 1, 0, 2) * cr);
    if (ac === dc) {
      dc--;
    }
    times(dc, () => {
      const h = target[rndi(2)];
      if (h.length > 0) {
        h.pop();
      }
    });
    times(ac + dc, () => {
      const h = target[rndi(2)];
      h.push(rndi(colorCount));
    });
    target[0].splice(5);
    target[1].splice(5);
    let isSame =
      target[0].length === prevTarget[0].length &&
      target[1].length === prevTarget[1].length;
    if (isSame) {
      times(2, (i) =>
        target[i].forEach((c, j) => {
          if (prevTarget[i][j] !== c) {
            isSame = false;
          }
        })
      );
    }
    if (isSame) {
      target[0][target[0].length - 1] = wrap(
        target[0][target[0].length - 1] + 1,
        0,
        colorCount
      );
    }
    step++;
    nextPhotonTicks = 60;
    appWidth = 30;
    nextPhotons = [];
  }
  if (nextStepTicks < 0 && nextStepTicks > -100) {
    text(`WORLD ${world}   STEP ${step - 1}`, 50, 20);
  }
  if (nextStepTicks > 0) {
    char("g", 80, 50);
    char("h", 120, 50);
    if (appWidth > -3) {
      appWidth--;
      addScore(world);
    }
  }
  nextStepTicks--;
  nextPhotonTicks--;
  if (nextPhotonTicks < 0) {
    if (nextPhotons.length === 0) {
      times(colorCount, (i) => {
        nextPhotons.push(i);
        nextPhotons.push(i);
      });
      times(ceil(colorCount * 0.4), () => {
        nextPhotons.push(4);
      });
      const nl = nextPhotons.length;
      times(99, () => {
        let i1 = rndi(nl);
        let i2 = rndi(nl);
        let t = nextPhotons[i1];
        nextPhotons[i1] = nextPhotons[i2];
        nextPhotons[i2] = t;
      });
    }
    const w = rnd() < 0.5 ? 1 : -1;
    const s = sqrt(difficulty) * 0.4;
    photons.push({
      x: w > 0 ? appWidth : 200 - appWidth,
      vx: w * s,
      w,
      index: nextPhotons.pop(),
      isReflected: false,
    });
    nextPhotonTicks = rnd(60, 90) / sqrt(difficulty);
  }
  remove(photons, (p) => {
    p.x += p.vx;
    char(addWithCharCode("b", p.index), p.x, 60);
    if (p.isReflected) {
      return p.x < appWidth || p.x > 200 - appWidth;
    }
    const hi = wrap(
      (p.w > 0 ? 0 : 1) +
        (player.angle < PI / 2 || player.angle > (PI / 2) * 3 ? 0 : 1),
      0,
      2
    );
    const hl = player.hands[hi].length * 7 + 6;
    const x = 100 - hl * p.w;
    if ((p.w === 1 && p.x > x) || (p.w === -1 && p.x < x)) {
      if (player.isRotating) {
        play("laser");
        p.isReflected = true;
        p.vx *= -5;
      } else {
        const h = player.hands[hi];
        if (p.index === 4) {
          if (h.length > 0) {
            play("hit");
            particle(p.x, 60);
            h.pop();
          }
        } else {
          play("select");
          h.push(p.index);
          if (h.length > 9) {
            appWidth /= 2;
          }
        }
        let isMatching = true;
        times(2, (i) => {
          const t = target[i];
          if (t.length !== player.hands[i].length) {
            isMatching = false;
          } else {
            times(t.length, (j) => {
              if (t[j] !== player.hands[i][j]) {
                isMatching = false;
              }
            });
          }
        });
        if (isMatching && player.angle > PI / 2) {
          player.isRotating = true;
          player.ta += PI;
        }
        if (!isMatching) {
          isMatching = true;
          times(2, (i) => {
            const t = target[i];
            if (t.length !== player.hands[1 - i].length) {
              isMatching = false;
            } else {
              times(t.length, (j) => {
                if (t[j] !== player.hands[1 - i][j]) {
                  isMatching = false;
                }
              });
            }
          });
          if (isMatching && player.angle < PI / 2) {
            player.isRotating = true;
            player.ta += PI;
          }
        }
        if (isMatching) {
          play("powerUp");
          photons = [];
          nextStepTicks = 60;
          nextPhotonTicks = 9999;
        }
        return true;
      }
    }
  });
  char("a", 100, 30);
  const p = vec();
  target.forEach((is, w) => {
    p.set(100, 30);
    is.forEach((i) => {
      p.x += 7 * (w * 2 - 1);
      char(addWithCharCode("b", i), p);
    });
  });
  if (!player.isRotating && nextStepTicks < 0 && input.isJustPressed) {
    play("coin");
    player.isRotating = true;
    player.ta += PI;
  }
  if (player.isRotating) {
    player.angle += 0.2;
    if (player.angle >= player.ta) {
      if (!input.isPressed) {
        player.angle = player.ta;
        player.isRotating = false;
      } else {
        player.ta += PI;
      }
    }
    if (player.angle >= PI * 2) {
      player.angle -= PI * 2;
      player.ta -= PI * 2;
    }
  }
  char("a", 100, 60);
  player.hands.forEach((is, w) => {
    p.set(100, 60);
    is.forEach((i) => {
      p.addWithAngle(player.angle, 7 * (w * 2 - 1));
      char(addWithCharCode("b", i), p);
    });
  });
  appWidth -= 0.02;
  rect(0, 56, appWidth + 3, 8).isColliding.char;
  rect(200, 56, -appWidth - 3, 8).isColliding.char;
  if (nextStepTicks < 0 && appWidth < -3) {
    play("lucky");
    end();
  }
}
