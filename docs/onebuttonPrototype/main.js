
// Game: BUBBLE POP!
// Group Members: 

//---------------------------------- Global vars ------------------------------------------------------


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
const enemySpawnLocationX = windowLen.x + 50;

const powerUpSpawnProbability = 0.2
const radiusOffset = 2;



let stars;
let player;
let playerPos = {x: windowLen.x - 100, y: windowLen.y - 13}
let enemies; 

//---------------------------------- Crisp game setup ------------------------------------------------------


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

options = {
  theme: "dark",
  viewSize: windowLen,
  isPlayingBgm: true,
  isReplayEnabled: true,
};

//---------------------------------- Helper functions ------------------------------------------------------
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
function playerMovement() {
  char((ticks % 20 < 10) ? "a":"b", player.pos.x, player.pos.y)
}

function drawEnemy() {
  for (const enemy of enemies){
    
    //check if enemy contains a power up
    if (enemy.hasPowerup)

    color(enemy.color)
    arc(enemy.posX, enemy.posY, enemy.radius); 
  }
}

function resetEnemy() {
  for (const enemy of enemies){
    if (enemy.posX < 0) {
      enemy.posX = windowLen.x + 10; 
      enemy.posY = randHeight();
      enemy.radius = randRad();

      console.log("bubble hit ship")
      // subtract a point if score > 0
      addScore((score <= 0)? 0: -1)
      play("select");
    }
  }
}

function dilate() {
  for (const enemy of enemies){
    //change enemy color when radius is smallest
    enemy.color = (enemy.radius <= MIN_RADIUS + radiusOffset)? enemyHighlightColor: enemyDefaultColor; 

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
  }
}

function playerShoot() {
  if(input.isJustReleased){
    //sort enemies - closest enemy to player is first
    const sortedEnemies = enemies.sort(enemy=> enemy.posX);

    for (const enemy of sortedEnemies) {
      if (enemy.color == enemyHighlightColor && enemy.posX <=  windowLen.x){ // bubble is popable and in view
  
        // add laser
        color("green")
        line(player.pos.x, player.pos.y, enemy.posX, enemy.posY, 3);
        color("black");
        // respawn enemy
        enemy.posX = enemySpawnLocationX;
        // increase score
        addScore(1);
        play("coin");
        break
      }
    }
  }
}

//---------------------------------- Update loop ------------------------------------------------------

function update() {
  if (!ticks) {
    // stars pooling
    stars = times(20, () => {
      return { pos: vec(rnd(200), rnd(80)), vy: rnd(1, 2) };
    });
    player = {pos: vec(playerPos.x, playerPos.y)}

    // enemies
    enemies = [
      {posX: enemySpawnLocationX - 20, posY: randHeight(), radius: randRad(), isGrowing: randBool(), hasPowerup: hasPowerup(), color: enemyDefaultColor}, 
      {posX: enemySpawnLocationX + 20, posY: randHeight(), radius: randRad(), isGrowing: randBool(), hasPowerup: hasPowerup(), color: enemyDefaultColor}, 
      {posX: enemySpawnLocationX + 80, posY: randHeight(), radius: randRad(), isGrowing: randBool(), hasPowerup: hasPowerup(), color: enemyDefaultColor}
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

  if (ticks%2 ) {
    enemies.forEach(enemy=> enemy.posX--); 
    dilate(); 
  }

  playerShoot();
}
