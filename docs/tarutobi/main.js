title = "";

description = "";

characters = [
  `
`
];

options = {};

function update() {
  if (ticks === 0) {
  }
  color("green");
  rect(80, 40, 10, 40);
  color("transparent");
  const c = rect(input.pos.x, 20, 30, 40);
  color(c.rect.green ? "green" : input.isPressed ? "red" : "blue");
  rect(input.pos.x, 20, 30, 40);
  if (input.isJustPressed) {
    play("laser");
  }
}
