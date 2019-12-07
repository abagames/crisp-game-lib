title = "";

description = "";

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
  `
];

options = {
  viewSize: { x: 120, y: 60 }
};

let p, v, isJumping, ts;

function update() {
  if (ticks === 0) {
    p = vec(30, 30);
    v = vec();
    isJumping = true;
    ts = [];
  }
  if (rnd() < 0.01) {
    ts.push({
      p: vec(125, 47),
      v: vec(-rnd(0.3, 0.9), 0),
      t: 0
    });
  }
  ts = ts.filter(t => {
    t.p.add(t.v);
    if (isJumping) {
      text("*", t.p.x, t.p.y, { rotation: floor(t.t / 10) });
    } else {
      char("c", t.p.x, t.p.y, { rotation: floor(t.t / 10) });
    }
    t.t += t.v.x;
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
  }
  if (p.x < 0 || p.x > 120) {
    p.x = clamp(p.x, 0, 120);
    v.x = 0;
  }
  v.x += clamp(input.pos.x - p.x, -10, 10) * (isJumping ? 0.0001 : 0.01);
  p.add(v);
  const c = char(
    String.fromCharCode("a".charCodeAt(0) + (floor(ticks / 30) % 2)),
    p
  );
  if (c.char.c) {
    isJumping = true;
    p.y = 42;
    v.y = -2;
  }
  if (c.text["*"]) {
    end();
  }
}
