title = "HIT BLOW UP";

description = `
[Tap]
 Select color
`;

characters = [
  `
 ll
llll
llll
 ll
`,
  `
 ll
l  l
l  l
 ll
`,
];

options = {
  isPlayingBgm: true,
  seed: 4,
};

let isGoingNextStage;
let stageCount;
let loopCount;
/** @type { number[] } */
let selectorBase;
/** @type { number[] } */
let selector;
let selectorY;
/** @type { number[] } */
let target;
/** @type { number[] } */
let current;
let currentIndex;
/** @type { { colors: number[], hit: number, blow: number}[] } */
let hist;
let hitBlowTicks;
let nextStageTicks;
let hitCount;
let blowCount;
/** @type { Color[] } */
const colors = ["red", "green", "blue", "yellow", "cyan", "purple"];

function update() {
  if (!ticks) {
    isGoingNextStage = true;
    stageCount = 0;
  }
  if (isGoingNextStage) {
    loopCount = floor(stageCount / 6);
    const s = stageCount % 6;
    if (s === 0) {
      selectorBase = times(6, (i) => i);
      times(99, () => {
        const n1 = rndi(6);
        const n2 = rndi(6);
        const t = selectorBase[n1];
        selectorBase[n1] = selectorBase[n2];
        selectorBase[n2] = t;
      });
    }
    let sc = 3 + floor((s + 1) / 2);
    selector = times(sc, (i) => selectorBase[i]);
    let tc = 2 + floor(s / 2);
    target = times(sc, (i) => selector[i]);
    times(99, () => {
      const n1 = rndi(selector.length);
      const n2 = rndi(selector.length);
      const t = target[n1];
      target[n1] = target[n2];
      target[n2] = t;
    });
    target.splice(tc);
    hist = [];
    selectorY = 90;
    isGoingNextStage = false;
    current = times(target.length, () => -1);
    currentIndex = 0;
    hitBlowTicks = -1;
    nextStageTicks = -1;
  }
  if (nextStageTicks < 0) {
    selectorY -=
      (pow(2, loopCount) / (target.length * target.length + selector.length)) *
      0.05;
  }
  color("light_black");
  rect(0, selectorY, 99, 99 - selectorY);
  let sx = 50 - ((selector.length - 1) / 2) * 10;
  selector.forEach((s) => {
    color(colors[s]);
    char("a", sx, selectorY + 3);
    sx += 10;
  });
  if (nextStageTicks < 0 && input.isJustPressed) {
    const i = floor((input.pos.x - 50) / 10 + selector.length / 2);
    if (i >= 0 && i < selector.length) {
      play("select");
      current[currentIndex] = selector[i];
      currentIndex++;
      if (currentIndex === target.length) {
        let hit = 0;
        let blow = 0;
        target.forEach((t, i) => {
          if (t === current[i]) {
            hit++;
          } else if (current.indexOf(t) > -1) {
            blow++;
          }
        });
        hist.push({ colors: current, hit, blow });
        hitBlowTicks = 60;
        current = times(target.length, () => -1);
        currentIndex = 0;
        if (hit === target.length) {
          addScore(
            (selectorY - hist.length * 6) * (loopCount + 1),
            70,
            (selectorY - hist.length * 6) / 2 + 9
          );
          nextStageTicks = 60;
        }
        hitCount = hit;
        blowCount = blow;
      }
    }
  }
  let hy = selectorY - 3;
  hist.forEach((hs) => {
    let hx = 50 - ((target.length - 1) / 2) * 7;
    hs.colors.forEach((h) => {
      color(colors[h]);
      char("a", hx, hy);
      hx += 7;
    });
    color("black");
    text(`${hs.hit}`, 3, hy);
    text(`${hs.blow}`, 96, hy);
    hy -= 6;
  });
  hitBlowTicks--;
  if (hitBlowTicks > 0) {
    text("HIT", 10, hy + 6);
    text("BLOW", 70, hy + 6);
    if (hitBlowTicks % 10 === 0) {
      if (hitCount > 0) {
        play("powerUp");
        hitCount--;
      } else if (blowCount > 0) {
        play("coin");
        blowCount--;
      }
    }
  }
  nextStageTicks--;
  if (nextStageTicks >= 0) {
    color("black");
    rect(50, 0, 1, hy + 3);
    rect(48, 0, 5, 1);
    rect(48, hy + 2, 5, 1);
    drawAnswer();
    if (nextStageTicks === 0) {
      stageCount++;
      isGoingNextStage = true;
    }
    return;
  }
  let cx = 50 - ((target.length - 1) / 2) * 7;
  current.forEach((c) => {
    if (c < 0) {
      color("light_black");
      char("b", cx, hy);
    } else {
      color(colors[c]);
      char("a", cx, hy);
    }
    cx += 7;
  });
  if (nextStageTicks < 0 && hy < 3) {
    play("lucky");
    drawAnswer();
    end();
  }

  function drawAnswer() {
    let tx = 50 - ((target.length - 1) / 2) * 7;
    target.forEach((t) => {
      color(colors[t]);
      char("a", tx, selectorY + 8);
      tx += 7;
    });
  }
}
