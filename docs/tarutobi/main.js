title = "";

description = "";

characters = [
  `
  l
 lll
  l
`,
  `
 l l
lllll
lllll
 lll
  l
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
  char("b", 50, 80);
  if (char("a", input.pos.x, input.pos.y).char.b) {
    text("hit", 10, 90);
  }
}
