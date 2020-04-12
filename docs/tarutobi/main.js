title = "TARUTOBI";

description = `
[Slide] Move
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
  `,
  `
llllll
ll l l
ll l l
llllll
ll  ll
  `,
  `
  ll
 llll
l    l
l    l
 l  l
  ll
  `,
];

options = {
  viewSize: { x: 120, y: 60 },
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let p, v, isJumping, ts, addedScore;

function update() {
  if (ticks === 0) {
    p = vec(30, 30);
    v = vec();
    isJumping = true;
    addedScore = 1;
    ts = [];
  }
  if (rnd() < 0.01 * difficulty) {
    ts.push({
      p: vec(123, 47),
      v: vec(-rnd(0.4, 0.8 * difficulty), 0),
      t: 0,
      isScoreAdded: false,
    });
  }
  ts = ts.filter((t) => {
    t.p.add(t.v);
    if (isJumping) {
      text("*", t.p.x, t.p.y, { rotation: floor(t.t / 10) });
    } else {
      char("c", t.p.x, t.p.y, { rotation: floor(t.t / 10) });
    }
    t.t += t.v.x;
    if (!t.isScoreAdded && t.p.x < p.x) {
      play("coin");
      addScore(addedScore, t.p);
      addedScore++;
      t.isScoreAdded = true;
    }
    return t.p.x > 0;
  });
  rect(0, 50, 120, 9);
  if (isJumping) {
    v.y += 0.1;
    if (p.y > 47) {
      isJumping = false;
      p.y = 47;
      v.y = 0;
    }
  } else {
    v.mul(0.95);
    addedScore = 1;
  }
  if (p.x < 0 || p.x > 120) {
    p.x = clamp(p.x, 0, 120);
    v.x = 0;
  }
  v.x += clamp(input.pos.x - p.x, -7, 7) * (isJumping ? 0.004 : 0.01);
  p.add(v);
  const c = char(
    String.fromCharCode("a".charCodeAt(0) + (floor(ticks / 30) % 2)),
    p
  );
  if (c.isColliding.char.c) {
    play("jump");
    isJumping = true;
    p.y = 42;
    v.y = -1.2 - Math.abs(v.x);
  }
  if (c.isColliding.text["*"]) {
    play("explosion");
    end();
  }
}
