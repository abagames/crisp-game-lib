title = "DOSHIN";

description = `
[Tap] Press
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
  lll
ll l l
 llll
 l  l
ll  ll
`,
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
];

options = {
  isPlayingBgm: true,
  viewSize: { x: 200, y: 100 },
  isReplayEnabled: true,
  theme: "shapeDark",
};

let hms, dss, bt;

function update() {
  if (ticks === 0) {
    hms = [];
    dss = range(4).map((i) => {
      return {
        x: 50 * (0.5 + i),
        t: -1,
      };
    });
    bt = 0;
  }
  if (rnd() < 0.03 * difficulty) {
    bt--;
    const type = bt < 0 ? 0 : 1;
    if (bt < 0) {
      bt = rndi(10, 20);
    }
    hms.push({
      p: vec(0, 87),
      v: vec(
        (type === 0 ? rndi(2) * 0.2 + 0.6 : rndi(4) * 0.2 + 0.1) * difficulty,
        0
      ),
      t: 0,
      type,
      ft: -1,
    });
  }
  color("light_black");
  rect(0, 90, 199, 1);
  dss.forEach((ds, i) => {
    if (
      ds.t < 0 &&
      input.isJustPressed &&
      input.pos.x > i * 50 &&
      input.pos.x < (i + 1) * 50
    ) {
      play("hit");
      ds.t = 0;
    }
    const y = ds.t < 0 ? 30 : 90 - ds.t;
    color(ds.t === 0 ? "red" : ds.t === -1 ? "purple" : "light_purple");
    rect(ds.x - 15, y - 90, 30, 90);
    if (ds.t >= 0) {
      ds.t += difficulty;
    }
    if (ds.t > 60) {
      ds.t = -1;
    }
    color("light_red");
    rect(ds.x - 20, 0, 40, 20);
  });
  let sc = 1;
  hms = hms.filter((hm) => {
    hm.p.add(hm.v);
    color(hm.type === 0 ? "blue" : "red");
    if (hm.ft < 0) {
      hm.t++;
      if (
        char(
          addWithCharCode("a", hm.type * 2 + (Math.floor(hm.t / 30) % 2)),
          hm.p
        ).isColliding.rect.red
      ) {
        hm.ft = 0;
        hm.v.y = -1;
        if (hm.type === 0) {
        }
      }
      if (hm.p.x > 199) {
        if (hm.type === 0) {
          play("coin");
          addScore(10, 190, hm.p.y);
        } else {
          play("lucky");
          color("red");
          text("X", hm.p.x - 6, hm.p.y);
          end();
        }
        return false;
      }
    } else {
      hm.v.y += 0.1;
      char(addWithCharCode("a", hm.type * 2), hm.p, { mirror: { y: -1 } });
      if (hm.p.y > 99) {
        if (hm.type === 0) {
          play("lucky");
          color("red");
          text("X", hm.p.x, hm.p.y - 6);
          end();
        } else {
          play("select");
          addScore(sc, hm.p);
          sc++;
        }
        return false;
      }
    }
    return true;
  });
}
