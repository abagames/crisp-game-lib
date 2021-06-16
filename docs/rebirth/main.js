title = "REBIRTH";

description = `
[Tap] Jump / Land
`;

characters = [
  `
 ll
lll l
lll ll
lll ll
llllll
 l  l
`,
  `
   ll
  l
 lll
 l
l l
   l
`,
  `
  ll
l l
 llll
  l  
 l ll
l
`,
  `
  ll
l l l
 lll
  l
 l ll
l  
`,
  `
  ll
  l 
 lll
l l l
 l ll
ll  l
`,
  `
  ll
 l 
ll
l l 
 l l
  l l
`,
  `
 llll
ll  ll
l ll l
 llll
  ll
`,
];

options = {
  theme: "dark",
  viewSize: { x: 200, y: 50 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 2000,
};

/** @type {{x: number, vx: number, world: -1 | 1}[]} */
let tracks;
let nextTrackTicks;
let trackCount;
/** @type {{pos: Vector, vx: number, world: -1 | 1}[]} */
let dias;
let nextDiaTicks;
let diaWorld;
let diaCount;
/**
 * @type {{
 * pos: Vector, ox: number, vel: Vector, world: -1 | 1,
 * state: "run" | "jump" | "land" | "hit"
 * }}
 */
let player;
let multiplier;

function update() {
  if (!ticks) {
    tracks = [];
    nextTrackTicks = 0;
    trackCount = 0;
    dias = [];
    nextDiaTicks = 60;
    diaWorld = 1;
    diaCount = 1;
    player = { pos: vec(110, 37), ox: 10, vel: vec(), world: 1, state: "run" };
    multiplier = 1;
  }
  color("black");
  rect(100, 40, 100, 10);
  color("light_black");
  rect(0, 0, 100, 40);
  nextTrackTicks--;
  if (nextTrackTicks < 0) {
    const world = trackCount % 2 === 0 ? 1 : -1;
    tracks.push({
      x: world > 0 ? 203 : -3,
      vx: rnd(1, sqrt(difficulty)) * (world > 0 ? -1 : 1),
      world,
    });
    trackCount++;
    nextTrackTicks = rnd(50, 60) / sqrt(difficulty);
  }
  remove(tracks, (t) => {
    t.x += t.vx;
    color(t.world > 0 ? "black" : "white");
    char("a", t.x, 37, { mirror: { x: t.world > 0 ? -1 : 1 } });
    return t.world > 0 ? t.x < 103 : t.x > 97;
  });
  player.pos.add(player.vel);
  player.vel.mul(0.99);
  player.vel.x *= 0.8;
  let pc;
  if (player.state === "run") {
    player.pos.x += (100 + player.world * player.ox - player.pos.x) * 0.05;
    player.ox = clamp(player.ox + sqrt(difficulty) * 0.3, 10, 80);
    if (input.isJustPressed) {
      play("jump");
      player.state = "jump";
      player.vel.y = -2 * sqrt(difficulty);
    }
    pc = addWithCharCode("b", floor(ticks / 10) % 2);
  } else if (player.state === "jump") {
    player.vel.y += (input.isPressed ? 0.07 : 0.14) * difficulty;
    if (player.pos.y > 37) {
      player.pos.y = 37;
      player.vel.y = 0;
      player.state = "run";
    }
    if (input.isJustPressed) {
      play("laser");
      player.state = "land";
      player.vel.y = 4 * sqrt(difficulty);
    }
    pc = "d";
  } else if (player.state === "land") {
    if (player.pos.y > 37) {
      player.pos.y = 37;
      player.vel.y = 0;
      player.state = "run";
    }
    pc = "e";
  }
  if (abs(player.vel.x) > 1) {
    pc = "f";
  }
  const pw = player.pos.x < 100 ? -1 : 1;
  color(pw > 0 ? "black" : "white");
  const c = char(pc, player.pos, { mirror: { x: pw } }).isColliding.char;
  if (c.a && abs(player.vel.x) < 2) {
    play("hit");
    player.vel.x =
      (player.world > 0 ? -1 : 1) * player.ox * 0.2 * sqrt(difficulty);
    player.world = player.world > 0 ? -1 : 1;
    player.ox = 10;
    if (multiplier > 1) {
      multiplier--;
    }
  }
  nextDiaTicks--;
  if (nextDiaTicks < 0) {
    diaCount--;
    if (diaCount < 0) {
      diaWorld = diaWorld > 0 ? -1 : 1;
      diaCount = rndi(4);
    }
    dias.push({
      pos: vec(diaWorld > 0 ? 203 : -3, rnd() < 0.5 ? 37 : rnd(20, 30)),
      vx: (rnd(1, sqrt(difficulty)) * (diaWorld > 0 ? -1 : 1)) / 3,
      world: diaWorld,
    });
    nextDiaTicks = rnd(120, 150) / sqrt(difficulty);
  }
  remove(dias, (d) => {
    d.pos.x += d.vx;
    color("yellow");
    const c = char("g", d.pos, { mirror: { x: d.world > 0 ? -1 : 1 } })
      .isColliding.char;
    if (c.b || c.c || c.d || c.e || c.f) {
      play("coin");
      addScore(multiplier, d.pos);
      multiplier++;
      return true;
    }
    if (d.world > 0 ? d.pos.x < 103 : d.pos.x > 97) {
      play("explosion");
      color("red");
      text("X", 100, d.pos.y);
      end();
    }
  });
}
