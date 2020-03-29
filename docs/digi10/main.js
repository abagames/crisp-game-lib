title = "DIGI10";

description = `
[Key1-9] Add num
`;

characters = [];

options = {
  viewSize: { x: 96, y: 18 },
  isPlayingBgm: true,
  seed: 10
};

let digits;
let addTicks;
let fallNum, fallX;
let isErasing, eraseFrom, eraseTo, eraseTicks;
let eraseMsg;
let multi;

function update() {
  if (ticks === 0) {
    digits = [];
    addTicks = 0;
    isErasing = false;
    fallNum = -1;
    multi = 1;
  }
  if (isErasing) {
    eraseTicks -= difficulty;
    if (eraseTicks < 0) {
      digits.splice(eraseFrom, eraseTo - eraseFrom - 1);
      isErasing = false;
      checkTen();
    }
  } else {
    addTicks -= difficulty;
    if (addTicks < 0) {
      digits.push(rndi(1, 10));
      addTicks = 60;
    }
  }
  for (let i = 1; i <= 9; i++) {
    if (
      fallNum < 0 &&
      (keyboard.code[`Digit${i}`].isJustPressed ||
        keyboard.code[`Numpad${i}`].isJustPressed)
    ) {
      fallNum = i;
      fallX = -1;
      digits.push(rndi(1, 10));
    }
  }
  if (fallNum >= 0) {
    fallX++;
    if (fallX > 15 - digits.length) {
      play("select");
      digits.unshift(fallNum);
      addTicks = 60;
      if (!isErasing) {
        checkTen();
      } else {
        eraseFrom++;
        eraseTo++;
      }
      fallNum = -1;
    } else {
      text(fallNum.toString(), fallX * 6 + 3, 15);
    }
  }
  digits.forEach((d, i) => {
    let p = vec(99 - (digits.length - i) * 6, 15);
    if (isErasing && i >= eraseFrom && i <= eraseTo) {
      color("black");
      box(p, 6, 6);
      if (d >= 0) {
        color("white");
        text(d.toString(), p);
      }
    } else {
      color("black");
      text(d.toString(), p);
    }
  });
  if (digits.length >= 16) {
    play("lucky");
    end();
    return;
  }
  if (isErasing) {
    color("black");
    text(eraseMsg, 99 - eraseMsg.length * 6, 9);
  }
}

function checkTen() {
  let s = 0;
  for (let i = 0; i < digits.length; i++) {
    s += digits[i];
    if (s % 10 === 0) {
      play("coin");
      isErasing = true;
      eraseFrom = 0;
      eraseTo = i;
      eraseTicks = 60;
      eraseMsg = "";
      for (let j = eraseFrom; j <= eraseTo; j++) {
        eraseMsg += `${digits[j]}${j < eraseTo ? "+" : "="}`;
      }
      eraseMsg += s;
      if (multi > 1) {
        eraseMsg += `x${multi}`;
      }
      eraseMsg = eraseMsg.substring(eraseMsg.length - 16);
      addScore(s * multi);
      multi++;
      for (let j = eraseFrom; j <= eraseTo - 2; j++) {
        digits[j] = -1;
      }
      digits[eraseTo - 1] = clamp(s / 10, 1, 9);
      digits[eraseTo] = 0;
      return;
    }
  }
  multi = 1;
}
