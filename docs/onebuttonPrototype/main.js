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
const MIN_HEIGHT = windowLen.y - 30;
const MAX_HEIGHT = 20;
const MID_HEIGHT = (MIN_HEIGHT + MAX_HEIGHT)/2;
const MIN_RADIUS = 5;
const MAX_RADIUS = 15;
const enemyDefaultColor = "black";
const enemyHighlightColor = "purple";
const powerUpSpawnProbability = 0.2
const radiusOffset = 1;

options = {
  theme: "dark",
  viewSize: windowLen,
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let stars;

let player;
let playerPos = {x: windowLen.x - 100, y: windowLen.y - 13}

let enemies; 

//returns true with [powerUpSpawnProbability] pobability, otherwise false
function hasPowerup(){
  return rndi() < powerUpSpawnProbability;
}
//returns a random radius between MIN_RADIUS and MAX_RADIUS
function randRad(){
  return rnd(MIN_RADIUS, MAX_RADIUS);
}
//returns a random height between MIN_HEIGHT and MAX_HEIGHT
function randHeight(){
  return rnd(MAX_HEIGHT, MIN_HEIGHT);
}
// 50 / 50 probability returns true or false
function randBool(){
  return rndi(0, 1) == 0;
}


function update() {
  if (!ticks) {
    // stars pooling
    stars = times(20, () => {
      return { pos: vec(rnd(200), rnd(80)), vy: rnd(1, 2) };
    });
    player = {pos: vec(playerPos.x, playerPos.y)}

    // enemies
    enemies = [
      {posX: windowLen.x + 10, posY: randHeight(), body: null, radius: randRad(), isGrowning: randBool(), hasPowerup: hasPowerup(), color: enemyDefaultColor}, 
      {posX: windowLen.x + 60, posY: randHeight(), body: null, radius: randRad(), isGrowning: randBool(), hasPowerup: hasPowerup(), color: enemyDefaultColor}, 
      {posX: windowLen.x + 110, posY: randHeight(), body: null, radius: randRad(), isGrowning: randBool(), hasPowerup: hasPowerup(), color: enemyDefaultColor}
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
      enemy.posY = rnd(MAX_HEIGHT, MIN_HEIGHT);
      enemy.radius = rnd(MIN_RADIUS, MAX_RADIUS);
    }
  }
}

function dilate() {
  for (const enemy of enemies){
    if (enemy.isGrowing) {
      enemy.radius++; 
      if (enemy.radius >= MAX_RADIUS) {
        enemy.isGrowing = false; 
      }
    }
    else{
      enemy.radius--; 
      if (enemy.radius <= MIN_RADIUS) {
        enemy.isGrowing = true; 
      }
    }
    if (enemy.radius < MIN_RADIUS + radiusOffset) {
      enemy.color = enemyHighlightColor; 
    }
    else {
      enemy.color = enemyDefaultColor; 
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
