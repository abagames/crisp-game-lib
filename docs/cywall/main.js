title = "CYWALL";

description = `
[Tap] Move
`;

characters = [];

options = {
  isPlayingBgm: true,
  seed: 27,
  isReplayEnabled: true,
  theme: "shape",
};

let circles;
let circleAddDist;
let lastCircle;
let playerCircle;

function update() {
  if (ticks === 0) {
    circles = [];
    circleAddDist = 0;
    lastCircle = undefined;
    playerCircle = undefined;
  }
  if (circleAddDist <= 0) {
    addCircle();
    circleAddDist += rnd(20, 40);
  }
  let sc = difficulty * 0.1;
  const py = playerCircle.p.y;
  if (py < 50) {
    sc += (50 - py) * 0.05;
  }
  circleAddDist -= sc;
  addScore(sc);
  if (playerCircle.p.y > 99) {
    play("explosion");
    end();
  }
  circles = circles.filter((c) => {
    c.p.y += sc;
    if (c.p.y > 99 + c.r) {
      return false;
    }
    color(c === playerCircle || c === playerCircle.next ? "cyan" : "red");
    box(c.p, 3, 3);
    color("red");
    c.a += c.v;
    range(c.num).forEach((i) => {
      const a = c.a + (i * PI * 2) / c.num;
      bar(vec(c.p).addWithAngle(a, c.r), c.l, 3, a + PI / 2);
    });
    return true;
  });
  color("cyan");
  if (playerCircle.next != null && input.isJustPressed) {
    if (line(playerCircle.p, playerCircle.next.p, 3).isColliding.rect["red"]) {
      play("explosion");
      end();
    } else {
      play("coin");
      const p = vec(playerCircle.p);
      const o = vec(playerCircle.next.p).sub(playerCircle.p).div(9);
      const a = o.angle;
      times(9, (i) => {
        particle(p, 4, 2, a + PI, 0.5);
        p.add(o);
      });
    }
    playerCircle = playerCircle.next;
  } else {
    box(playerCircle.p, 5, 5).isColliding.rect;
  }
}

function addCircle() {
  const r = rnd(20, 30);
  const c = {
    p: vec(rnd(20, 80), -r),
    r,
    num: rndi(1, 4),
    a: rnd(PI * 2),
    v: rnds(0.02, 0.05) * difficulty,
    l: rnd(10, 20),
    next: undefined,
  };
  if (lastCircle != null) {
    lastCircle.next = c;
  }
  if (playerCircle == null) {
    playerCircle = c;
  }
  lastCircle = c;
  circles.push(c);
}
