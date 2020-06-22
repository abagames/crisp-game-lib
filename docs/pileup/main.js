title = "PILEUP";

description = `
[Slide] Move
`;

characters = [];

options = {
  isPlayingBgm: true,
  seed: 3,
  isReplayEnabled: true,
  theme: "crt",
};

let board;
let boxes;
let boxAddTicks;
let pp;

function update() {
  if (ticks === 0) {
    boxes = [];
    boxAddTicks = 0;
    pp = vec();
    board = undefined;
  }
  if (board != null) {
    board.vy += difficulty * 0.1;
    board.p.y += board.vy;
    color("red");
    box(board.p, 20, 5);
    if (board.p.y > 99) {
      board = undefined;
      play("select");
      addScore(99 - pp.y, pp);
    }
  } else {
    board = {
      p: vec(rnd(99), 0),
      vy: 0,
    };
  }
  let by = 80;
  color("black");
  rect(0, 95, 99, 5);
  boxes = boxes.filter((b) => {
    if (b.isFixed) {
      if (b.p.y - 9 < by) {
        by = b.p.y - 9;
      }
    } else {
      b.p.y += difficulty;
    }
    color(b.isFixed ? "black" : "light_black");
    const bc = box(b.p, 7, 7);
    if (!b.isFixed) {
      if (bc.isColliding.rect.black) {
        b.isFixed = true;
      }
    }
    if (bc.isColliding.rect.red) {
      play("hit");
      return false;
    }
    return true;
  });
  color("green");
  pp.set(clamp(input.pos.x, 0, 99), by);
  if (box(pp, 7, 7).isColliding.rect.red || pp.y < 0) {
    play("lucky");
    end();
  }
  boxAddTicks--;
  if (boxAddTicks < 0) {
    boxes.push({
      p: vec(pp),
      isFixed: false,
    });
    boxAddTicks += 10 / difficulty;
  }
}
