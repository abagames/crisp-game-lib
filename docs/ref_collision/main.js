title = "";

description = `
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
];

options = {
  isShowingScore: false,
};

function update() {
  if (ticks === 0) {
  }
  const params = [50, 50, floor(input.pos.x - 50), floor(input.pos.y - 50)];
  color("cyan");
  box(50, 80, 15, 10);
  text("a", 80, 50);
  char("a", 70, 70);
  color("red");
  const cl = rect.apply(this, params);
  color("black");
  text(`rect(`, 5, 5, { isSmallText: true });
  const l = params
    .map((p, i) => `${p}${i < params.length - 1 ? ", " : ""}`)
    .join("");
  text(`${l}`, 12, 12, { isSmallText: true });
  text(").isColliding", 5, 19, { isSmallText: true });
  color("blue");
  text("{", 5, 26, { isSmallText: true });
  text(`rect:${JSON.stringify(cl.isColliding.rect)}`, 9, 33, {
    isSmallText: true,
  });
  text(`text:${JSON.stringify(cl.isColliding.text)}`, 9, 40, {
    isSmallText: true,
  });
  text(`char:${JSON.stringify(cl.isColliding.char)}`, 9, 47, {
    isSmallText: true,
  });
  text("}", 5, 54, { isSmallText: true });
}
