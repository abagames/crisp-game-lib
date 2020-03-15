title = "";

description = `
`;

characters = [];

options = {
  isShowingScore: false
};

function update() {
  if (ticks === 0) {
  }
  color("black");
  text("input.", 5, 5);
  text("pos", 5, 12);
  text("isPressed", 5, 26);
  text("isJustPressed", 5, 40);
  text("isJustReleased", 5, 54);
  color("blue");
  text(`{x:${floor(input.pos.x)},y:${floor(input.pos.y)}}`, 5, 19);
  text(`${input.isPressed}`, 5, 33);
  text(`${input.isJustPressed}`, 5, 47);
  text(`${input.isJustReleased}`, 5, 61);
}
