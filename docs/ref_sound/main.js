title = "";

description = `
`;

characters = [];

options = {
  isShowingScore: false,
  seed: 6
};

let playingButtons;
let currentPlay;

function update() {
  if (ticks === 0) {
    playingButtons = [
      "coin",
      "laser",
      "explosion",
      "powerUp",
      "hit",
      "jump",
      "select",
      "lucky"
    ].map((p, i) =>
      getButton({
        pos: vec(5, 5 + i * 9),
        size: vec(56, 7),
        text: p,
        isToggle: false,
        onClick: () => {
          // @ts-ignore
          play(p);
          currentPlay = p;
        }
      })
    );
  }
  playingButtons.forEach(pb => {
    updateButton(pb);
  });
  color("black");
  if (currentPlay != null) {
    text(`play("${currentPlay}");`, 5, 90);
  }
}

function getButton({ pos, size, text, isToggle, onClick }) {
  return {
    pos,
    size,
    text,
    isToggle,
    onClick,
    isPressed: false,
    isSelected: false,
    toggleGroup: []
  };
}

function updateButton(button) {
  const o = vec(input.pos).sub(button.pos);
  const isHovered = o.isInRect(0, 0, button.size.x, button.size.y);
  if (input.isJustPressed && isHovered) {
    button.isPressed = true;
  }
  if (button.isPressed && !isHovered) {
    button.isPressed = false;
  }
  if (button.isPressed && input.isJustReleased) {
    button.onClick();
    button.isPressed = false;
    if (button.isToggle) {
      if (button.toggleGroup.length === 0) {
        button.isSelected = !button.isSelected;
      } else {
        button.toggleGroup.forEach(b => {
          b.isSelected = false;
        });
        button.isSelected = true;
      }
    }
  }
  color(button.isPressed ? "blue" : "light_blue");
  rect(button.pos.x, button.pos.y, button.size.x, button.size.y);
  if (button.isToggle && !button.isSelected) {
    color("white");
    rect(
      button.pos.x + 1,
      button.pos.y + 1,
      button.size.x - 2,
      button.size.y - 2
    );
  }
  color(isHovered ? "black" : "blue");
  text(button.text, button.pos.x + 3, button.pos.y + 3);
}
