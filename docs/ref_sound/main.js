title = "";

description = `
`;

characters = [];

let seed = 1;

options = {
  isShowingScore: false,
};

let playingButtons;
let currentPlay;

function update() {
  if (ticks === 0) {
    playingButtons = [
      "coin",
      "jump",
      "powerUp",
      "laser",
      "select",
      "hit",
      "click",
      "explosion",
      "random",
    ].map((p, i) =>
      getButton({
        pos: vec(5, 2 + i * 9),
        size: vec(56, 7),
        text: p,
        isToggle: false,
        onClick: () => {
          // @ts-ignore
          play(p);
        },
      })
    );
    sss.setSeed(seed);
    playBgm();
  }
  playingButtons.forEach((pb) => {
    updateButton(pb);
  });
  const bp = vec(5, 92);
  color("light_blue");
  rect(bp.x, bp.y, 90, 5);
  color("white");
  rect(bp.x + 1, bp.y + 1, 88, 3);
  if (input.pos.isInRect(bp.x + 1, bp.y + 1, 88, 3)) {
    let nextSeed = input.pos.x - bp.x;
    color("blue");
    rect(bp.x + nextSeed, bp.y + 1, 1, 3);
    text(`${nextSeed}`, 85, bp.y - 3);
    if (input.isJustPressed) {
      seed = nextSeed;
      stopBgm();
      sss.setSeed(seed);
      playBgm();
    }
  }
  color("black");
  rect(bp.x + seed, bp.y + 1, 1, 3);
  text(`seed: ${seed}`, 5, bp.y - 3);
}
