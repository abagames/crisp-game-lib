title = "BUBBLE POP!";

description = `
[SPACE] SHOOT
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
  isPlayingBgm: true,
  isReplayEnabled: true,
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
    enemies.forEach(enemy=> enemy.posX--); 
    dilate(); 
  }

  playerShoot()
}

function playerMovement() {
  char((ticks % 20 < 10) ? "a":"b", player.pos.x, player.pos.y)
}

function drawEnemy() {
  for (const enemy of enemies){
    color(enemy.color)
    arc(enemy.posX, enemy.posY, enemy.radius); 
  }
}

function resetEnemy() {
  for (const enemy of enemies){
    if (enemy.posX < 0 - 20) {
      enemy.posX = options.viewSize.x + 10; 
      enemy.posY = rnd(20, 60);
      enemy.radius = rnd(5, 15);
    }
  }
}

function dilate() {
  for (const enemy of enemies){
    if (enemy.grow == 0) {
      enemy.radius--; 
      if (enemy.radius <= 5) {
        enemy.grow = 1; 
      }
    }
    else if (enemy.grow == 1) {
      enemy.radius++; 
      if (enemy.radius > 15) {
        enemy.grow = 0; 
      }
    }
    if (enemy.radius < 8) {
      enemy.color = "purple"; 
    }
    else {
      enemy.color = "black"; 
    }
  }
}

function playerShoot() {
  if(input.isJustReleased){
    console.log("shoot")

    // select control

    // shoot ( quick press)
    console.log(enemies.length)
    for (const enemy of enemies) {
      if (enemy.radius < 8){ // box is damagable.
        console.log("shoot");
        // add laser
        color("blue")
        line(player.pos.x, player.pos.y, enemy.posX, enemy.posY, 3);
        // remove target
        enemy.posX = -100
        // increase score
        addScore(1);
        break
      }
    }

    // shield ( long press)
    // if (timer > 10 && player.shieldDuration <= 0){
    //   console.log("add shield");
    //   player.shieldDuration = 100;
    //   player.shieldsLeft--;

    // }


    // timer = 0;
  }
}
