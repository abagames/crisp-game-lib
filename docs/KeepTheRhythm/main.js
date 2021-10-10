title = " First Date";

description = `
  [TAP]
 to talk
 `;

characters = [
`
  bbb 
  bbb 
   b  
  bbb 
   b  
  b b
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
`
];
  

const G = {
  WIDTH: 75,
  HEIGHT: 75,

  STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

  JUMP_HEIGHT: 4,

  MIN_CHARACTERS: 3,
  MAX_CHARACTERS: 8,
  NPC_SECONDS: 0,
  PLAYER_SECONDS: 0,
  ICON_CHOOSER: 3,
  PLAYER_ICON: 3,
  PLAYER_HEALTH: 80
};

options = {
  theme: 'pixel',
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed:1124, //4,7,9,11,65, 1124
  viewSize: {x: G.WIDTH, y: G.HEIGHT}
};

/** @typedef {{pos: Vector, speed: number}} rain */
/** @type  { rain[] } */
let rain;

/** @typedef {{pos: Vector, charType: number}} icons */
/** @type  { icons[] } */
let icons;

/** @typedef {{pos: Vector}} NPC */
/** @type { NPC } */
let npc;

/** @typedef {{pos: Vector}} Player */
/** @type { Player } */
let player;

function update() {
  if (!ticks) {
    rain = times(20, () => {
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      return {
        pos: vec(posX, posY),
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
    });

    icons = times(100, () => {
      return {
        pos: vec(50, 63),
        charType: rndi(3, 5)
      };
    });

    npc = {
      pos: vec(43, 72), 
    };

    player = {
      pos: vec(32, 72),
    };
  }

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

  color ("green");
  box(50, 63, 10, 10);
  
  color ("blue");
  box(50, 63, 8, 8);

  color ("green");
  box(32, 63, 10, 10);
  
  color ("blue");
  box(32, 63, 8, 8);

  // UPDATING AND DRAWING THE NPC
  if (G.NPC_SECONDS > (420 - (difficulty * 120))) {
    G.ICON_CHOOSER = rndi(G.MIN_CHARACTERS, G.MAX_CHARACTERS);
    G.NPC_SECONDS = 0;
  }
  G.NPC_SECONDS++;

  if (G.ICON_CHOOSER == 3) {
    color("black");
    char("c", 50, 63)
  }
  else if (G.ICON_CHOOSER == 4) {
    color("black");
    char("d", 50, 63)
  }
  else if (G.ICON_CHOOSER == 5) {
    color("black");
    char("e", 50, 63)
  }
  else if (G.ICON_CHOOSER == 6) {
    color("black");
    char("f", 50, 63)
  }
  else if (G.ICON_CHOOSER == 7) {
    color("black");
    char("g", 50, 63)
  }

  npc.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  color ("red");
  char("b", npc.pos);

  // UPDATING AND DRAWING THE PLAYER
  if (G.PLAYER_SECONDS > 60) {
    G.PLAYER_ICON = rndi(G.MIN_CHARACTERS, G.MAX_CHARACTERS);
    G.PLAYER_SECONDS = 0;
    G.PLAYER_HEALTH--;
  }
  G.PLAYER_SECONDS++;
  if (G.PLAYER_ICON == 3) {
    color("black");
    char("c", 32, 63)
  }
  else if (G.PLAYER_ICON == 4) {
    color("black");
    char("d", 32, 63)
  }
  else if (G.PLAYER_ICON == 5) {
    color("black");
    char("e", 32, 63)
  }
  else if (G.PLAYER_ICON == 6) {
    color("black");
    char("f", 32, 63)
  }
  else if (G.PLAYER_ICON == 7) {
    color("black");
    char("g", 32, 63)
  }

  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT - 3);
  color ("black");
  char("a", player.pos);

  // INPUT_DETECTION
  if (input.isJustPressed) {
    player.pos.y -= G.JUMP_HEIGHT;
    if (G.PLAYER_ICON == G.ICON_CHOOSER) {
      play('coin');
      addScore(10 * difficulty);
      G.PLAYER_HEALTH += 2;
    }
    else {
      play('explosion');
      addScore(-10 * difficulty);
      G.PLAYER_HEALTH -= 2;
    }
  }
  else if (input.isJustReleased || input.isPressed) {
    player.pos.y += G.JUMP_HEIGHT;
  }
  
  text("Interest: " + G.PLAYER_HEALTH.toString(), 4, 40);
  if (G.PLAYER_HEALTH <= 0) {
    G.PLAYER_HEALTH = 80;
    end();
  }
  if (score <= 0) {
    score = 0;
  }
}
