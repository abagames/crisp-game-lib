title = "GLOOP";

description = `
[Slide] Move
`;

characters = [
  `
 llll
llllll
ll  ll
ll  ll
`,
  `
 lll
l   l
l l l
l   l
 lll
`,
  `
l l
 l
l l
`,
  `
 l l l
l   l
 l   l
l   l
 l   l
l l l
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let p, v, vya, pis, sps;

function update() {
  if (ticks === 0) {
    p = vec(50, 50);
    v = vec();
    vya = -1;
    pis = [];
    sps = [];
  }
  color("light_cyan");
  for (let x = 0; x < 15; x++) {
    for (let y = 0; y < 18; y++) {
      if ((x + y) % 2 === 0) {
        char("d", x * 6 + 8, y * 6);
      }
    }
  }
  v.y += 0.02 * difficulty * vya;
  v.mul(0.99);
  p.add(v);
  p.x = clamp(input.pos.x, 8, 92);
  p.y = wrap(p.y, 0, 99);
  color("black");
  char("a", p);
  while (pis.length < 7) {
    pis.push({
      p: vec(rnd(10, 90), rnd(10, 90)),
    });
  }
  if (rnd() < 0.02 * difficulty) {
    const pp = vec(rnd(10, 90), rnd(10, 90));
    if (abs(pp.x - p.x) + abs(wrap(pp.y - p.y, -50, 50)) > 25) {
      sps.push({
        p: pp,
        isAlive: true,
      });
    }
  }
  pis = pis.filter((pi) => {
    let isAlive = true;
    if (char("b", pi.p).isColliding.char.a) {
      if (abs(v.y) > 1) {
        play("select");
        isAlive = false;
        sps.map((sp) => {
          if (sp.p.distanceTo(pi.p) < 20) {
            play("coin");
            sp.isAlive = false;
          }
        });
      } else {
        play("hit");
      }
      v.y *= -0.3;
      vya *= -1;
      p.y = pi.p.y + vya * 5;
    }
    return isAlive;
  });
  let sc = 1;
  color("red");
  sps = sps.filter((sp) => {
    if (sp.isAlive) {
      if (char("c", sp.p).isColliding.char.a) {
        play("explosion");
        end();
      }
      return true;
    } else {
      addScore(sc, sp.p);
      sc++;
    }
  });
}
