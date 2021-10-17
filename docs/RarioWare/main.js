title = " Rar.ioWare";

description = 
` Beat each 
 minigame!
 `;

characters = [
`
 l  l 
 llll 
 lyyl
rllllb
 llll
 l  l
`,

`
  bbb 
  bbb 
   b  
  bbb 
   b  
  b b
`,

`
RR  RR
RRRRLR
RRRrrR
RRRRRR
 RRRR 
  RR  
`,

`
RllllR
lRllRl
lRllRl
lRllRl
lRllRl
RllllR
`,

`
BBgggB
Bggggg
BgBlBg
bbblbb
YYYlYY
YYYYYY
`,

`
 RRRRR
RRR  R
RRRRRR
RRRRRR
 R  R 
 RR RR
`,

`
      
    y 
y   yy
 yyyyy
  yyy 
  y y 
`,//bubble for bubbleFly
`
 bbbb
bBBbbb
bBbbbb
bbbbbb
bbbbBb
 bbbb
`, //straw for bubbleFly
`
 l  l
  ll
  ll
  ll
`, // findIt guy
`
rrrrrr
rlrrlr
rrrrrr
rllllr
rrrrrr
rr  rr
`
];
  

const G = {
  WIDTH: 75,
  HEIGHT: 75,

  RANDOM_START: false,
  STARTING_GAME: 2, // FIRST GAME INDEX IF RANDOM IS FALSE
  GAME_TIMES: [8, 8, 6, 8, 8],  // Measured in seconds

  // ICON MINIGAME
  STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,
  JUMP_HEIGHT: 4,
  MIN_CHARACTERS: 3,
  MAX_CHARACTERS: 8,
  PLAYER_SECONDS: 0,
  ICON_CHOOSER: 0,
  PLAYER_ICON: 3,
};

// magnet collect variables
const MC = {
  PLAYER_MOVE_SPEED: 0.65,
	PLAYER_FRICTION: 0.9,
	PLAYER_PULL_RANGE: 20,
	PLAYER_PULL_SPEED: 0.1,

  DEBRIS_NUMBER: 15,
	DEBRIS_SIZE_MIN: 4,
	DEBRIS_SIZE_MAX: 7,
	DEBRIS_ATTACH_DISTANCE: 5,
	DEBRIS_FRICTION: 0.95,
	DEBRIS_SPAWN_SPACING: 15,
  DEBRIS_SPAWN_OFFSET: 5,
}

options = {
  theme: 'pixel',
  isPlayingBgm: true,
  seed:1124, //4,7,9,11,65, 1124
  viewSize: {x: G.WIDTH, y: G.HEIGHT}
};


/** @type  { number } */
let arrayIndex;

/** @type  { number } */
let gameIndex;

// a storage for unplayed games
/** @typedef {{trueIndex: number}} Games */
/** @type  { Games[] } */
let games;

/** @type  { number } */
let gameTimer = 0;

/** @type  { boolean } */
let gameStarted = false;

/** @typedef {{pos: Vector, speed: number}} rain */
/** @type  { rain[] } */
let rain;

/** @typedef {{pos: Vector, speed: number}} press_me */
/** @type  { press_me[] } */
let press_me;

/** @typedef {{pos: Vector}} NPC */
/** @type { NPC } */
let npc;

/** @typedef {{pos: Vector}} Player */
/** @type { Player } */
let player;

// magnet collect stuff
/**
 * @typedef {{
 * pos: Vector
 * moveSpeed: number
 * velocity: Vector
 * isPulling: boolean
 * pullCount: number
 * }} McPlayer
 */

/**
 * @type { McPlayer }
 */
let mcPlayer;

/**
 * @typedef {{
 * pos: Vector
 * size: number
 * velocity: Vector
 * isPulled: boolean
 * }} McDebris
 */

/**
 * @type { McDebris [] }
 */
let mcDebris;


/////bubbleFly variables//////
/**
 * @type { {
 * pos: Vector, width: number
 * }[] }
 */
 let floors;
 let nextFloorDist;

/**
 * @typedef {{
 * pos: Vector,
 * vy: number
 * }} Bubble
 */

/**
 * @type { Bubble }
 */
let bubble;
let breath;
let breathBlock = false;
/////bubbleFly variables//////

//--------findIt Variable---------
let charPosX;
let charPosY;
let timerUIlength;
let gameComplete;
let gameFailed;
let successPlayed;
//---------------------------------

function update() {
  if (!ticks) {
    initialize()
  }
  
  individualInit(); // initializes for the individual game

  switch(gameIndex) {
    case 0: 
      tileMatcher();
      break;

    case 1:
      dontPressIt();
      break;

    case 2: 
      magnetCollect();
      break;

    case 3:
      bubbleFly();
      break;
    case 4:
      findIt();
      break;

  }

  timerManager();
  //??
}

//~~~~~~~Main game utility functions~~~~~~~
function initialize()
{
  games = [];
  fillGames();

  if (G.RANDOM_START) {
    arrayIndex = floor(rnd(0, games.length));
  } else {
    arrayIndex = G.STARTING_GAME;
  }
  gameIndex = games[arrayIndex].trueIndex;

  rain = times(20, () => {
    const posX = rnd(0, G.WIDTH);
    const posY = rnd(0, G.HEIGHT);
    return {
      pos: vec(posX, posY),
      speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
    };
  });

  npc = {
    pos: vec(43, 72), 
  };

  player = {
    pos: vec(32, 72),
  };
}

function individualInit() 
{
  if (!gameStarted) {
    gameStarted = true;

    // starts at 0
    switch(gameIndex) {
      case 0: 
        break;

      case 1:
        dontPressItInit();
        break;

      case 2: 
        magnetInit();
        break;
      
      case 3:
        bubbleFlyInit();
        break;

      case 4:
        findItInit();
        break;
    }
  }
}

function fillGames() {
  for (let index = 0; index < G.GAME_TIMES.length; index++) {
    games.push({
      trueIndex: index
    });
  }
}

function timerManager() {
  gameTimer += 1/60;
  var currentGame = games[arrayIndex];
  color("green");
  let barLength =  ((G.GAME_TIMES[currentGame.trueIndex] - gameTimer)/G.GAME_TIMES[currentGame.trueIndex]) * G.WIDTH;
  bar(0,G.HEIGHT - 1, barLength, 4.5,0,0);
  if (gameTimer > G.GAME_TIMES[currentGame.trueIndex]) {
    transitionGame();
  }
}

// switches to next index and resets timer
function transitionGame() {
  if (games.length > 1) {
    games.splice(arrayIndex, 1);
  } else {
    games.pop();
    fillGames();
  }
  arrayIndex = floor(rnd(0, games.length - 1));
  gameIndex = games[arrayIndex].trueIndex;
  gameStarted = false;

  gameTimer = 0;
}

//~~~~~~~Microgames~~~~~~~
function dontPressIt() {

  var flag = 1;

  if(ticks % 75  <= 35)
    flag = -flag;
  
  if(flag == -1)
    color("yellow");
  else
    color("red");
  rect( 18, 19, 38, 35 );
  color("black");
  text("DONT", 27, 30);
  text("PRESS", 24, 40);

  color("transparent");

  //color("red");
  if(input.isJustPressed &&  rect(input.pos.x, input.pos.y, 1, 1).isColliding.rect.red) {
    addScore(-10 * difficulty);
    transitionGame();
  }

  if(flag == -1)
    color("green");
  else
    color("black");

  particle(18, 19);
  particle(56, 19);
  particle(18, 57);
  particle(56, 57);
  


    press_me.forEach((s) => {
      // Move the text downwards
      s.pos.y += s.speed;
      // Bring the text back to top once it's past the bottom of the screen
      s.pos.wrap(0, G.WIDTH, -55, G.HEIGHT);

  
      // Choose a color to draw
      color("cyan");
      // Draw the text
      text("PRESS ME!!!", s.pos);

      color("yellow");

    });

    color("transparent");

}

function dontPressItInit() {
  press_me = times(24, () => {
    const posX = rnd(0, 15);
    const posY = rnd(-55, G.HEIGHT);
    return {
      pos: vec(posX, posY),
      speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
    };
  });
}

function tileMatcher() {
  rain.forEach((s) => {
    // Move the rain downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_blue");
    // Draw the rain as a square of size 1
    box(s.pos, 1);
  });

  text("MATCH TILES", 6, (G.HEIGHT / 2) - 15);

  color ("green");
  box((G.WIDTH / 2) + 10, (G.HEIGHT / 2), 10, 10);

  color ("blue");
  box((G.WIDTH / 2) + 10, (G.HEIGHT / 2), 8, 8);

  color ("green");
  box((G.WIDTH / 2) - 10, (G.HEIGHT / 2), 10, 10);

  color ("blue");
  box((G.WIDTH / 2) - 10, (G.HEIGHT / 2), 8, 8);

  // CHOOSING ICON AT START OF GAME
  if (G.ICON_CHOOSER == 0) {
    G.ICON_CHOOSER = rndi(G.MIN_CHARACTERS, G.MAX_CHARACTERS - 2);
  }

  if (G.ICON_CHOOSER == 3) {
    color("black");
    char("c", (G.WIDTH / 2) + 10, (G.HEIGHT / 2))
  }
  else if (G.ICON_CHOOSER == 4) {
    color("black");
    char("d", (G.WIDTH / 2) + 10, (G.HEIGHT / 2))
  }
  else if (G.ICON_CHOOSER == 5) {
    color("black");
    char("e", (G.WIDTH / 2) + 10, (G.HEIGHT / 2))
  }
  else if (G.ICON_CHOOSER == 6) {
    color("black");
    char("f", (G.WIDTH / 2) + 10, (G.HEIGHT / 2))
  }
  else if (G.ICON_CHOOSER == 7) {
    color("black");
    char("g", (G.WIDTH / 2) + 10, (G.HEIGHT / 2))
  }

  // UPDATING AND DRAWING THE PLAYER
  if (G.PLAYER_SECONDS > 45) {
    G.PLAYER_ICON = rndi(G.MIN_CHARACTERS, G.MAX_CHARACTERS - 2);
    G.PLAYER_SECONDS = 0;
  }
  G.PLAYER_SECONDS++;
  if (G.PLAYER_ICON == 3) {
    color("black");
    char("c", (G.WIDTH / 2) - 10, (G.HEIGHT / 2))
  }
  else if (G.PLAYER_ICON == 4) {
    color("black");
    char("d", (G.WIDTH / 2) - 10, (G.HEIGHT / 2))
  }
  else if (G.PLAYER_ICON == 5) {
    color("black");
    char("e", (G.WIDTH / 2) - 10, (G.HEIGHT / 2))
  }
  else if (G.PLAYER_ICON == 6) {
    color("black");
    char("f", (G.WIDTH / 2) - 10, (G.HEIGHT / 2))
  }
  else if (G.PLAYER_ICON == 7) {
    color("black");
    char("g", (G.WIDTH / 2) - 10, (G.HEIGHT / 2))
  }

  // INPUT_DETECTION
  if (input.isJustPressed) {
    if (G.PLAYER_ICON == G.ICON_CHOOSER) {
      color("green");
      particle(vec((G.WIDTH / 2 - 10), G.HEIGHT / 2), 40, 4, 20, 20);
      play('coin');
      addScore(10 * difficulty);
    }
    else {
      color("red");
      particle(vec((G.WIDTH / 2 - 10), G.HEIGHT / 2), 40, 4, 90, 10);
      play('explosion');
      addScore(-10 * difficulty);
    }
  }
}

function magnetCollect() {
  color("light_blue");
  text("COLLECT", 19,15);
  text(String(mcDebris.length), 37, 25);
  if (input.isPressed) {
		if (mcPlayer.pos.distanceTo(input.pos) > mcPlayer.moveSpeed) {
			if (mcPlayer.pullCount < 0) {
				// Backup big fix
				mcPlayer.pullCount = 0;
			}
			mcPlayer.velocity.x = mcPlayer.moveSpeed * Math.cos(mcPlayer.pos.angleTo(input.pos)) / (mcPlayer.pullCount / 5 + 1);
			mcPlayer.velocity.y = mcPlayer.moveSpeed * Math.sin(mcPlayer.pos.angleTo(input.pos)) / (mcPlayer.pullCount / 5 + 1);
			//clamp and add if anything else moves the player
		} else {
			mcPlayer.velocity = vec(0, 0);
		}
		mcPlayer.isPulling = true;
		//color("black");
		//char(addWithCharCode("a", floor(ticks / 4) % 2), mcPlayer.pos);
	} else {
		mcPlayer.velocity.div(1.05);
		mcPlayer.isPulling = false;
	}
  color("black");
	char("a", mcPlayer.pos);
	mcPlayer.pos.add(mcPlayer.velocity);
	mcPlayer.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

  //debris
	color("light_blue");
	mcDebris.forEach((d) => {
    if (mcPlayer.isPulling && d.pos.distanceTo(mcPlayer.pos) < MC.PLAYER_PULL_RANGE) {
      // set pulled to true
      if (d.pos.distanceTo(mcPlayer.pos) < MC.DEBRIS_ATTACH_DISTANCE && !d.isPulled) {
        d.isPulled = true;
        d.velocity = vec(0, 0);
        mcPlayer.pullCount += 1;
        play("hit");
      }
      // circle around player
      if (d.isPulled) {
        var posX = mcPlayer.pos.x;
        var posY = mcPlayer.pos.y;
        d.pos = vec(posX, posY);
      } else {
        // grab object
        var distancePower = MC.PLAYER_PULL_SPEED * MC.PLAYER_PULL_RANGE / (d.pos.distanceTo(mcPlayer.pos) + MC.PLAYER_PULL_RANGE) + 0.01;
        d.velocity.x += distancePower * Math.cos(d.pos.angleTo(mcPlayer.pos));
        d.velocity.y += distancePower * Math.sin(d.pos.angleTo(mcPlayer.pos));
      }
    }
    
    if (d.velocity.length > 0.2 || d.isPulled) {
      color("yellow");
    } else {
      color("light_blue");
    }
    d.velocity = d.velocity.mul(MC.DEBRIS_FRICTION);
    if (!d.isPulled)
    {
      box(d.pos, d.size);
    }
      
    d.pos.add(d.velocity);
    
	}) 

  // Debris
	remove(mcDebris, (d) => {
    const outOfBounds = !d.pos.isInRect(0, 0, G.WIDTH + d.size, G.HEIGHT + d.size);
    if (d.isPulled) {
      mcPlayer.pullCount--;
      // add score
    }

    if (d.velocity.length > 0.2) {
			color("yellow");
		} else {
			color("light_blue");
		}
    box(d.pos, d.size);

    return (outOfBounds || d.isPulled);
    });
    if (mcDebris.length == 0) {
      transitionGame();
    }
}

function magnetInit() {
  mcPlayer = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    moveSpeed: MC.PLAYER_MOVE_SPEED,
    velocity: vec(0, 0),
    isPulling: false,
    pullCount: 0
  };

  mcDebris = times(MC.DEBRIS_NUMBER, () => {
    return {
      pos: ExcludeArea(player.pos, MC.DEBRIS_SPAWN_SPACING, MC.DEBRIS_SPAWN_SPACING),
      size: rnd(MC.DEBRIS_SIZE_MIN, MC.DEBRIS_SIZE_MAX),
      velocity: vec(0, 0),
      isPulled: false,
    };
  });
}

function ExcludeArea(pos, width, height) {
  var posX = rnd(0, 1) < 0.5 ? rnd(MC.DEBRIS_SPAWN_OFFSET, pos.x - width) : rnd(pos.x + width, G.WIDTH - MC.DEBRIS_SPAWN_OFFSET);
  var posY = rnd(0, 1) < 0.5 ? rnd(MC.DEBRIS_SPAWN_OFFSET, pos.y - height) : rnd(pos.y + height, G.HEIGHT - (MC.DEBRIS_SPAWN_OFFSET + 5000));
  const vector = vec(posX, posY);
  return vector;
}

function bubbleFly() {
  color("black");
  char("i", G.WIDTH/2, 65);
  breathBlock = false;
  floors.forEach( f => {
    if (f.pos.x - (f.width/2) < G.WIDTH/2 && f.pos.x + (f.width/2) > G.WIDTH/2) {
      console.log("true: f.pos.x - f.width/2 = " + (f.pos.x - f.width/2) + " G.WIDTH/2 = " + G.WIDTH/2);
      console.log("f.pos.x + f.width/2 = " + (f.pos.x + f.width/2));
      breathBlock = true;
      return;
    }
  });

  if(input.isJustPressed) {
    if (breath >= 2 && !breathBlock) {
      play("jump");
      color("black");
      particle(G.WIDTH/2, 64, 4, 1, -PI/2, PI/4);
      bubble.vy = -0.1*sqrt(1);
      breath -= 2;
    }
    else {
      bubble.vy += 0.009 * 1;
      bubble.pos.y += bubble.vy;
      
    }
  } 
  if(input.isPressed) {
    if(breath >= 1 && !breathBlock) {
      play("laser");
      bubble.vy -= 0.06 * 1;
      bubble.pos.y += bubble.vy;
      breath--;
    }
    else {
      bubble.vy += 0.009 * 1;
      bubble.pos.y += bubble.vy;
    }
  } else {
    bubble.vy += 0.009 * 1;
    bubble.pos.y += bubble.vy;
    if (breath < 10 && ticks%10 == 0) {
      breath++;
    }
  }
  color("black");
  char("h", bubble.pos);

  nextFloorDist -= 1;
 // generate moving floor
  if (nextFloorDist < 0) {
    const width = rnd(20, 50);
    floors.push({
      pos: vec(150 + width / 2, rndi(35, 65)),
      width
    });
    nextFloorDist += width + rnd(20, 50);
  }
  remove(floors, (f) => {
    f.pos.x -= 1;
    color("light_black");
    const c = box(f.pos, f.width, 1).isColliding.char;
    if (c.h) {
      play("explosion");
      addScore(-10 * difficulty);
      transitionGame();
      return true;
    }
    if(f.pos.x < -f.width / 2) {
      play("coin");
      addScore(f.width * 0.2, vec(10, f.pos.y));
    }
    return f.pos.x < -f.width / 2;
  });

  if(bubble.pos.y >= 75 || bubble.pos.y < -3) {
    play("hit");
    addScore(-10 * difficulty);
    transitionGame();
  }

  var y = 65;
  for( var i = 0; i < breath; i++) {
    rect(3, y, 3, 4);
    y -= 5;
  }
}

function bubbleFlyInit() {
  bubble = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    vy: 0
  };
  floors = [];
  nextFloorDist = 0;
  breath = 10;
}

function findItInit(){
  charPosX = rnd(15, G.WIDTH);
  charPosY = rnd(15, G.HEIGHT - 5);
  timerUIlength = 18;
  gameComplete = false;
  gameFailed = false;
  successPlayed = false;
}

function findIt(){
  color("light_cyan");
  text("FIND IT", 20,15);
  arc(input.pos, 10.9, 4);
  bar(input.pos.x + 15, input.pos.y + 15, 20, 4.5, .7);

  if(!gameComplete){
    if(input.pos.x <= charPosX + 8  && input.pos.x >= charPosX - 8 && 
      input.pos.y <= charPosY + 8  && input.pos.y >= charPosY - 8){
      if(timerUIlength > 0){
        timerUIlength -= 0.25;
        color("yellow");
        bar(input.pos.x, input.pos.y - 15, timerUIlength, 3, 0)
        color("black");
      }else{
        gameComplete = true;
      }
    }else{
      timerUIlength = 18;
      color("transparent");
    }
    if(successPlayed){
      successPlayed = false;
    }
  }else{
    color("black");
    text("YOU WIN", 20,28);
    addScore(30);
    particle(charPosX, charPosY, 1.2, 2);
    if(!successPlayed){
      play("coin");
      successPlayed = true;
    }
  }

  // if the game was lost, subtract 20 points
  if(!gameComplete && gameTimer >= 4.99){
    play("explosion");
    addScore(-20);
  }

  char("j", charPosX, charPosY);
  
}