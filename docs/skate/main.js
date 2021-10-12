title = `Skate 4`;

description = `
    [HOLD] to
  perform tricks!
`;

characters = [
// SKATEBOARD TOP
`
  rr
lrrrrl
lrrrrl
 rrrr 
 rrrr 
 rrrr 
`,

`
 rrrr 
 rrrr 
 rrrr 
lrrrrl
lrrrrl
  rr
`,

`
bbbbbb
bbbbbb
bbbbbb
bbbbbb
 bbbb
  bb
`,

`
  yr
llyr
llyr
  yr
  yr
  yr
`,

`
  yr
  yr
  yr
llyr
llyr
  yr
`,

`
lrrl
 rr
 rr
`,
`
 rr
 rr
lrrl
`,

`
  ry
  ryll
  ryll
  ry
  ry
  ry
`,

`
  ry
  ry
  ry
  ryll
  ryll
  ry
`,
`
  yy
lyyyyl
lyyyyl
 yyyy 
 yyyy 
 yyyy 
`,

`
 yyyy 
 yyyy 
 yyyy 
lyyyyl
lyyyyl
  yy
`
];

const G = {
  WIDTH: 100,
  HEIGHT: 150,

  JUMP_HEIGHT: 6.2,
  SPEED: 1,
  RAMP_COOLDOWN: 250
};

options = {
  theme: 'pixel',
  isPlayingBgm: true,
  seed:1124, //4,7,9,11,65, 1124
  viewSize: {x: G.WIDTH, y: G.HEIGHT}
};

/** @typedef {{pos: Vector, cooldown: number, inAir: boolean, airTime: number}} Player */
/** @type { Player } */
let player;

/** @typedef {{pos: Vector}} PlayerSprite */
/** @type { PlayerSprite } */
let playerSprite;

/** @typedef {{pos: Vector}} Ramp*/
/** @type {Ramp} */
let Ramp;

/**
* @type  { Ramp [] }
*/
let Ramps;

/** @typedef {{pos: Vector, size: number, cooldown: number}} Pit */
/** @type { Pit } */
let Pit;

/**
* @typedef {{
  * pos: Vector,
  * width: number,
  * height: number
  * }} Hole
  */
  
  /**
  * @type  { Hole [] }
  */
  let holes;

let tempTicks;
let rightSideUp;
let upsideDown;
let rampJumped;

let multiplier;

function update() {
  if (!ticks) {
    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5 + 20),
      cooldown: G.RAMP_COOLDOWN,
      inAir: false,
      airTime: G.JUMP_HEIGHT * 10
    };
    playerSprite = {
      pos: vec(player.pos.x, player.pos.y + 6)
    }

    // Ramps = times(3, () => {
    //   const posX = rnd(0, G.WIDTH);
    //   const posY = 0;
    //   return{
    //     pos: vec(posX, posY)
    //   }
    // });

    // holes = times(5, () => {
    //   const posX = rnd(0, G.WIDTH);
    //   const posY = 0;
    //   const wid = rndi(5, 15);
    //   const hei = rndi(10, 20);
    //   return{
    //     pos: vec(posX, posY),
    //     width: wid,
    //     height: hei
    //   }
    // });
    Ramps = [];
    holes = [];


    Pit = {
      pos: vec(0, 0),
      size: rndi (5, 25),
      cooldown: 200
    }
    tempTicks = 0;
    rightSideUp = false;
    upsideDown = false;
    rampJumped = false;

    multiplier = 1;
  }
  player.cooldown --;
  Pit.cooldown --;
  //text("Pit: " + Pit.cooldown.toString(), 4, 30);

  if(Ramps.length == 0)
  {
    if(player.cooldown <= 0){
      var offset = rndi(0, G.WIDTH);
      for(var i = 0; i < rndi(4,12); i++)
      {
        Ramps.push({pos: vec(offset, 0)});
        Ramps.push({pos: vec(offset, 4)});
        offset += 6;
      }
      player.cooldown = rndi(G.RAMP_COOLDOWN / 4, G.RAMP_COOLDOWN);

    }
  }

  if(holes.length == 0)
  {
    console.log(player.cooldown);
    if(player.cooldown <= G.RAMP_COOLDOWN / 2){
      for(var i = 0; i < rndi((2 * difficulty),(6 * difficulty)); i++)
      {
        holes.push({pos: vec(rnd(0, G.WIDTH), 0), width: rndi(10, 25), height: rndi(10, 20)});
      }
     //player.cooldown = G.RAMP_COOLDOWN;
    }
  }

  if(Pit.cooldown < 0)
  {
    color("cyan");
    rect(Pit.pos, G.WIDTH, Pit.size * difficulty);
    Pit.pos.y += G.SPEED * difficulty;

    if(Pit.pos.y >= G.HEIGHT) {
      Pit.pos = vec(0,0);
      Pit.size = rndi(5, 25);
      Pit.cooldown = rndi(100, 200);
    }

  }

  holes.forEach(h => {
    h.pos.y += G.SPEED * difficulty;
    color("black");
    rect(h.pos, h.width, h.height);

    remove(holes, (h) => {
      return h.pos.y > G.HEIGHT;
    });
  });

  Ramps.forEach(r => {
    r.pos.y += G.SPEED * difficulty;
    color("purple");
    char("c", r.pos);

    remove(Ramps, (r) => {
      return r.pos.y > G.HEIGHT;
    });
  });

  if(input.isJustPressed) {
    player.inAir = true;
    if (char("f", player.pos).isColliding.char.c) {
      addScore(1000);
      player.airTime *= 2;
    }
  }
  if(player.inAir) {
    player.airTime--;
    text("Airtime: " + player.airTime.toString(), 2, 15);
  }

  if(player.airTime <= 0) {
    player.inAir = false;
    player.airTime = G.JUMP_HEIGHT * (10 / difficulty);
  }


  // Drawing double sprites
  followCursor();

  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  playerSprite.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  color('black');
  //console.log(player.airTime);
  if(!player.inAir) {
    if(char("f", player.pos).isColliding.rect.cyan || char("f", player.pos).isColliding.rect.black)
      end("Try again!");
    char("g", playerSprite.pos);
    rightSideUp = false;
    upsideDown = false;
    rampJumped = false; // TURN OFF RAMP JUMPED ONCE WE ARE !inAir
    tempTicks = 0;
  }
  else if(input.isPressed){
    if (char("f", player.pos).isColliding.char.c) { // WHEN INPUT IS PRESSED RAMPJUMPED SET TO TRUE IF PLAYER IS HITTING RAMP
      rampJumped = true;
    }
    jumpAnimation();
    text("x" + multiplier, 2, 30);
  }
  else {
    char("a", player.pos);
    char("b", playerSprite.pos);
    text("x" + multiplier, 2, 30);
    multiplier = 1;
  }

  function jumpAnimation(){
    if (rampJumped == true) { // RAMP JUMP
      playerSprite.pos = vec(player.pos.x, player.pos.y + 6);
      tempTicks += 0.4;
      if (tempTicks > 10) {
        tempTicks = 0;
        rightSideUp = !rightSideUp;
        upsideDown = !upsideDown;
      }
      else if (tempTicks < 5 && !upsideDown) {
        char("a", vec(player.pos.x, player.pos.y));
        char("b", playerSprite.pos);
      } else if (tempTicks < 5 && upsideDown) {
        char("j", vec(player.pos.x, player.pos.y));
        char("k", playerSprite.pos);
      } else if (tempTicks < 10 && !rightSideUp) {
        char("d", vec(player.pos.x, player.pos.y));
        char("e", playerSprite.pos);
      } else if (tempTicks < 10) {
        char("h", vec(player.pos.x, player.pos.y));
        char("i", playerSprite.pos);
        score += 10 * multiplier;
        multiplier++;
        player.airTime++;
      }
      else if (upsideDown && player.airTime <= 1)
        end("Trick bailed!");
    }
    else { // NON RAMP JUMP
      playerSprite.pos = vec(player.pos.x, player.pos.y + 6);
      tempTicks += 0.4;
      if (tempTicks > 10) {
        tempTicks = 0;
        rightSideUp = !rightSideUp;
        upsideDown = !upsideDown;
      }
      if (tempTicks < 10) {
        char("a", vec(player.pos.x, player.pos.y));
        char("b", playerSprite.pos);
        score += 10 * multiplier;
        multiplier++;
        player.airTime--; // REGULAR JUMPS ARE VERY SHORT NOW
      }
      else if (upsideDown && player.airTime <= 1)
        end("Trick bailed!");
    }
  }

  function followCursor(){
    if (player.pos.x < input.pos.x && !player.inAir){
      player.pos = vec(player.pos.x + 0.8, player.pos.y);
      playerSprite.pos = vec(player.pos.x, player.pos.y + 2);
    }else if(player.pos.x > input.pos.x && !player.inAir){
      player.pos = vec(player.pos.x - 0.8, player.pos.y)
      playerSprite.pos = vec(player.pos.x, player.pos.y + 2);;
    }else{
      player.pos = vec(player.pos.x, player.pos.y);
      playerSprite.pos = vec(player.pos.x, player.pos.y + 2);
    }
  }

  // if(char("a", player.pos).isColliding.rect.black)
  //   end("Try again!");


}
