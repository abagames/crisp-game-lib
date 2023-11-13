title = "";

description = `
`;

characters = [
  `
 ll
 ll
 l
lll
l l
  `,
  `
  ll
  ll
  l
  l
  l
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
  isPlayingBgm: true
};

let stars;

let player;
let playerPos = {x: options.viewSize.x - 100, y: options.viewSize.y - 13}

let enemies; 

function update() {
  if (!ticks) {
    // stars pooling
    stars = times(20, () => {
      return { pos: vec(rnd(200), rnd(80)), vy: rnd(1, 2) };
    });
    player = {pos: vec(playerPos.x, playerPos.y)}

    // enemies
    enemies = [
      {posX: options.viewSize.x + 10, posY: rnd(20, 60), body: null, radius: rnd(5, 15), grow: rndi(0, 1), color: "black"}, 
      {posX: options.viewSize.x + 60, posY: rnd(20, 60), body: null, radius: rnd(5, 15), grow: rndi(0, 1), color: "black"}, 
      {posX: options.viewSize.x + 110, posY: rnd(20, 60), body: null, radius: rnd(5, 15), grow: rndi(0, 1), color: "black"}
    ];
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
  rect(0, 90, 200, 10);

  // player spawn
  color("black")
  playerMovement()

  // enemies
  drawEnemy(); 
  resetEnemy();

  if (ticks % 2) {
    enemies[0].posX--; 
    enemies[1].posX--; 
    enemies[2].posX--; 
    dilate(); 
  }
}

function playerMovement() {
  char((ticks % 20 < 10) ? "a":"b", player.pos.x, player.pos.y)
}

function drawEnemy() {
  color(enemies[0].color)
  arc(enemies[0].posX, enemies[0].posY, enemies[0].radius); 
  color(enemies[1].color)
  arc(enemies[1].posX, enemies[1].posY, enemies[1].radius);
  color(enemies[2].color) 
  arc(enemies[2].posX, enemies[2].posY, enemies[2].radius); 
}

function resetEnemy() {
  if (enemies[0].posX < 0 - 20) {
    enemies[0].posX = options.viewSize.x + 10; 
    enemies[0].posY = rnd(20, 60);
    enemies[0].radius = rnd(5, 15);
  }

  if (enemies[1].posX < 0 - 20) {
    enemies[1].posX = options.viewSize.x + 10; 
    enemies[1].posY = rnd(20, 60);
    enemies[1].radius = rnd(5, 15);
  }

  if (enemies[2].posX < 0 - 20) {
    enemies[2].posX = options.viewSize.x + 10; 
    enemies[2].posY = rnd(20, 60);
    enemies[2].radius = rnd(5, 15);
  }
}

function dilate() {
  if (enemies[0].grow == 0) {
    enemies[0].radius--; 
    if (enemies[0].radius <= 5) {
      enemies[0].grow = 1; 
    }
  }
  else if (enemies[0].grow == 1) {
    enemies[0].radius++; 
    if (enemies[0].radius > 15) {
      enemies[0].grow = 0; 
    }
  }
  if (enemies[0].radius < 8) {
    enemies[0].color = "purple"; 
  }
  else {
    enemies[0].color = "black"; 
  }

  if (enemies[1].grow == 0) {
    enemies[1].radius--; 
    if (enemies[1].radius < 5) {
      enemies[1].grow = 1; 
    }
  }
  else if (enemies[1].grow == 1) {
    enemies[1].radius++; 
    if (enemies[1].radius > 15) {
      enemies[1].grow = 0; 
    }
  }
  if (enemies[1].radius < 8) {
    enemies[1].color = "purple"; 
  }
  else {
    enemies[1].color = "black"; 
  }

  if (enemies[2].grow == 0) {
    enemies[2].radius--; 
    if (enemies[2].radius < 5) {
      enemies[2].grow = 1; 
    }
  }
  else if (enemies[2].grow == 1) {
    enemies[2].radius++; 
    if (enemies[2].radius > 15) {
      enemies[2].grow = 0; 
    }
  }
  if (enemies[2].radius < 8) {
    enemies[2].color = "purple"; 
  }
  else {
    enemies[2].color = "black"; 
  }
}
