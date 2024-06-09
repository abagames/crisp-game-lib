title = "";

description = `
`;

characters = [];

options = {
  isShowingScore: false,
};

function update() {
  if (ticks === 0) {
  }
  color("black");
  text("input.", 5, 5, { isSmallText: true });
  text("pos", 5, 12, { isSmallText: true });
  text("isPressed", 5, 26, { isSmallText: true });
  text("isJustPressed", 5, 40, { isSmallText: true });
  text("isJustReleased", 5, 54, { isSmallText: true });
  color("blue");
  text(`{x:${floor(input.pos.x)},y:${floor(input.pos.y)}}`, 5, 19, {
    isSmallText: true,
  });
  text(`${input.isPressed}`, 5, 33, { isSmallText: true });
  text(`${input.isJustPressed}`, 5, 47, { isSmallText: true });
  text(`${input.isJustReleased}`, 5, 61, { isSmallText: true });
}
