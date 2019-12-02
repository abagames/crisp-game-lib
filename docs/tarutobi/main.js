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
  color(input.isPressed ? "red" : "blue");
  rect(input.pos.x, 20, 30, 40);
  if (input.isJustPressed) {
    play("laser");
  }
}
