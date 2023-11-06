title = "";

description = `
`;

characters = [];

options = {
  theme: "dark",
  isPlayingBgm: true,
  viewSize: { x: 200, y: 80 },
};

let stars;

function update() {
  if (!ticks) {
    // stars pooling
    stars = times(20, () => {
      return { pos: vec(rnd(200), rnd(80)), vy: rnd(1, 2) };
    });
  }

  // star manager
  let scr = sqrt(difficulty) * 0.5;
  color("black");
  stars.forEach((s) => {
    s.pos.x -= scr / s.vy;
    if (s.pos.x < 0) {
      s.pos.set(200, rnd(80));
      s.vy = rnd(1, 2);
    }
    rect(s.pos, 1, 1);
  });

  // ground
  color("red");
  rect(0, 70, 200, 10);
}
