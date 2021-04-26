title = "C NODES";

description = `
[Tap] Cut
`;

characters = [];

options = {
  theme: "shape",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6,
};

/** @type {{pos: Vector, vel: Vector, color: "black" | "red" | "blue"}[]} */
let nodes;
let nextNodeDist;
/** @type {{node1: any, node2: any, length: number}[]} */
let lines;
let maxY;
let scr;
let pressedScr;
let multiplier = 1;
const fixedY = 20;

function update() {
  if (!ticks) {
    nodes = [];
    nextNodeDist = 0;
    lines = [];
    scr = 0;
    pressedScr = 0;
  }
  color("light_red");
  rect(0, 0, 100, fixedY);
  color("light_black");
  if (input.isJustPressed && input.pos.y > fixedY) {
    play("hit");
    box(input.pos, 7);
    multiplier = 1;
    pressedScr = 1;
  }
  scr = difficulty * 0.03 + pressedScr;
  pressedScr *= 0.7;
  if (maxY < fixedY + 9) {
    scr += (fixedY + 9 - maxY) * 0.1;
  }
  nextNodeDist -= scr;
  if (nextNodeDist < 0) {
    let nn = { pos: vec(rnd(10, 90), 0), vel: vec(), color: "black" };
    nodes.forEach((n) => {
      if (
        n.color === "black" &&
        abs(nn.pos.x - n.pos.x) / 2 + abs(nn.pos.y - n.pos.y) < 30 &&
        rnd() < 0.7
      ) {
        lines.push({
          node1: nn,
          node2: n,
          length: nn.pos.distanceTo(n.pos),
        });
      }
    });
    // @ts-ignore
    nodes.push(nn);
    play("laser");
    nextNodeDist = 4;
  }
  color("black");
  remove(lines, (l) => {
    const d = l.node1.pos.distanceTo(l.node2.pos) - l.length;
    const a = l.node1.pos.angleTo(l.node2.pos);
    l.node1.vel.addWithAngle(a, d * 0.02);
    l.node2.vel.addWithAngle(a, -d * 0.02);
    if (line(l.node1.pos, l.node2.pos, 2).isColliding.rect.light_black) {
      play("select");
      return true;
    }
    return l.node1.pos.y > 100 && l.node2.pos.y > 100;
  });
  maxY = 0;
  remove(nodes, (n) => {
    n.pos.y += scr;
    if (maxY < n.pos.y) {
      maxY = n.pos.y;
    }
    if (n.pos.y > fixedY) {
      if (n.color === "black") {
        n.color = "blue";
        checkRedNodes();
      }
      n.pos.add(n.vel);
      n.vel.y += 0.03;
      n.vel.mul(0.95);
    } else {
      n.vel.set();
    }
    color(n.color);
    box(n.pos, 5);
    if (n.pos.y > 100 && n.color === "red") {
      play("explosion");
      color("red");
      text("X", n.pos.x, 95);
      end();
    }
    if (n.pos.y > 140) {
      play("powerUp");
      addScore(multiplier, n.pos.x - 1, 99);
      if (multiplier < 64) {
        multiplier *= 2;
      }
      return true;
    }
  });
  if (input.isPressed) {
    checkRedNodes();
  }

  function checkRedNodes() {
    nodes.forEach((n) => {
      if (n.color === "red") {
        n.color = "blue";
      }
    });
    for (let i = 0; i < 9; i++) {
      let isAddingRed = false;
      lines.forEach((l) => {
        if (
          l.node1.color === "black" ||
          l.node1.color === "red" ||
          l.node2.color === "black" ||
          l.node2.color === "red"
        ) {
          if (l.node1.color === "blue") {
            l.node1.color = "red";
            isAddingRed = true;
          }
          if (l.node2.color === "blue") {
            l.node2.color = "red";
            isAddingRed = true;
          }
        }
      });
      if (!isAddingRed) {
        break;
      }
    }
  }
}
