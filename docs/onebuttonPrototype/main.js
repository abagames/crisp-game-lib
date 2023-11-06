title = "";

description = `
`;

characters = [
  `
   ll  
  l  l
   ll
  l  l
  `,
  `
   ll 
  l  l
   ll
   ll
  `
];

// view constants
const windowLen= {x: 120, y: 100}
const leftMargin = 20;
const MIN_HEIGHT = windowLen.y - 20;
const MAX_HEIGHT = 20;
const MID_HEIGHT = (MIN_HEIGHT + MAX_HEIGHT)/2;

options = {
  theme: "dark",
  viewSize: windowLen,
};

let stars;

let player;
let playerPos = {x: options.viewSize.x - 100, y: options.viewSize.y - 50}

function update() {
  if (!ticks) {
    // stars pooling
    stars = times(20, () => {
      return { pos: vec(rnd(200), rnd(80)), vy: rnd(1, 2) };
    });
    player = {pos: vec(playerPos.x, playerPos.y)}
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

  // player spawn
  color("black")
  playerMovement()
}

function playerMovement() {
  char((ticks % 20 < 10) ? "a":"b", player.pos.x, player.pos.y)
}
