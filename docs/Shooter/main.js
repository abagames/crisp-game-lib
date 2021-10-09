title = " Keep it Going";

description = `
  [SPACEBAR] to keep 
the conversation going`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`
];
  

const G = {
  WIDTH: 150,
  HEIGHT: 150,

  STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

  PLAYER_FIRE_RATE: 4,
  PLAYER_GUN_OFFSET: 3,

  FBULLET_SPEED: 5
};

options = {
  theme: 'simple',
  viewSize: {x: G.WIDTH, y: G.HEIGHT}
};

/**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/

/**
* @type  { Star [] }
*/
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;

function update() {
  if (!ticks) {
    stars = times(20, () => {
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      return {
        pos: vec(posX, posY),
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      firingCooldown: G.PLAYER_FIRE_RATE,
      isFiringLeft: true
    };

    fBullets = [];
  }
  
  stars.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_black");
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });

  // Updating and drawing the player
  player.pos = vec(input.pos.x, input.pos.y);
  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  // Cooling down for the next shot
  player.firingCooldown--;
  // Time to fire the next shot
  if (player.firingCooldown <= 0) {
      // Create the bullet
      fBullets.push({
          pos: vec(player.pos.x, player.pos.y)
      });
      // Reset the firing cooldown
      player.firingCooldown = G.PLAYER_FIRE_RATE;
  }
  color ("black");
  char("a", player.pos);

  // Updating and drawing bullets
  fBullets.forEach((fb) => {
      // Move the bullets upwards
      fb.pos.y -= G.FBULLET_SPEED;
      
      // Drawing
      color("yellow");
      box(fb.pos, 2);
  });
}
