title = "";

description = `
`;

characters = [];

options = {
  isShowingScore: false,
  seed: 6,
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
      "lucky",
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
        },
      })
    );
  }
  playingButtons.forEach((pb) => {
    updateButton(pb);
  });
  color("black");
  if (currentPlay != null) {
    text(`play("${currentPlay}");`, 5, 90);
  }
}
