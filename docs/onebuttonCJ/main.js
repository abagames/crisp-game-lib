var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

title = "ONE BUTTON";

description = `
[Tap]  Climb out
[Hold] Throw
`;

characters = [
  `
  ll
  l
 llll
 ll
  llll
ll   l
`,
  `
ll
l  ll
 ll
ll
  llll
ll   
`,
  `
  ll
  l
 lllll
l l
  llll
ll 
`,
  `
   ll
ll l
  lll
   l l
llll
    l
`,
  `
  ll
llll
  lll
 llll
l l ll
 llll
`,
  `
 llll
llll
 llll
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};

/** @type { {x: number}[] } */
let holes;
/** @type { {x: number, vx: number, fireTicks: number, fireInterval: number, fireSpeed: number}[] } */
let tanks;
let tankAddTicks;
/** @type { {x: number, vx: number}[] } */
let bullets;
let px;
/** @type { "in_hole" | "throwing" | "running"} */
let pState;
let pAngle;
/** @type { {pos: Vector, vel: Vector}[] } */
let grenades;
let speedRatio;

function update() {
  if (!ticks) {
    holes = [{ x: 10 }];
    tanks = [];
    bullets = [];
    grenades = [];
    px = 10;
    pState = "in_hole";
    tankAddTicks = 0;
    speedRatio = 1;
  }
  const scr = (px - 10) * 0.05;
  color("black");
  rect(0, 70, 200, 9);
  color("white");
  holes = holes.filter((h) => {
    h.x -= scr;
    if (box(h.x, 70, 6, 10).isColliding.char.e) {
      return false;
    }
    return h.x > -4;
  });
  color("red");
  /*tanks.forEach((t) => {
    char("e", t.x, 67);
  });*/
  color("black");
  grenades = grenades.filter((g) => {
    g.pos.add(g.vel);
    g.vel.y += 0.1 * difficulty;
    if (text("o", g.pos).isColliding.char.e) {
      return false;
    }
    if (g.pos.y > 68) {
      play("hit");
      particle(g.pos, 10, 1, -PI / 2, PI * 0.7);
      //holes.push({ x: g.pos.x });
      return false;
    }
    return true;
  });
  tankAddTicks--;
  /*if (tankAddTicks < 0) {
    const sd = rnd(sqrt(difficulty) - 1) + 1;
    const fi = 300 / (rnd(sqrt(difficulty)) + 1);
    const fs = rnd(sqrt(sqrt(difficulty)) - 1) + 1;
    tanks.push({
      x: 203,
      vx: 0.08 * sd,
      fireTicks: rnd(fi),
      fireInterval: fi,
      fireSpeed: 0.4 * fs,
    });
    tankAddTicks = 200 / (rnd(sqrt(difficulty)) + 1);
  }
  tanks = tanks.filter((t) => {
    t.x -= t.vx * speedRatio + scr;
    color("transparent");
    if (box(t.x, 67, 6, 6).isColliding.text.o) {
      play("explosion");
      color("red");
      particle(t.x, 67, 20, 2, -PI / 2, PI * 1.2);
      addScore(t.x, t.x, 67);
      return false;
    }
    t.fireTicks--;
    if (t.x > 150 && pState !== "in_hole" && t.fireTicks < 0) {
      play("laser");
      t.fireTicks = t.fireInterval;
      bullets.push({ x: t.x - 5, vx: t.fireSpeed });
    }
    return t.x > -4;
  });*/
  color("red");
  bullets = bullets.filter((b) => {
    b.x -= b.vx * speedRatio + scr;
    char("f", b.x, 65);
    return b.x > -4;
  });
  if (tanks.length === 0) {
    tankAddTicks *= 0.7;
  }
  color("transparent");
  holes = holes.filter((h) => {
    return !box(h.x, 70, 7, 10).isColliding.char.e;
  });
  color("black");
  px -= scr;
  if (pState === "in_hole") {
    speedRatio += 0.05;
    if (input.isJustPressed) {
      pState = "running";
      px += 6;
    } else {
      if (char("a", px, 72).isColliding.char.e) {
        play("lucky");
        end();
      }
      color("transparent");
      if (box(px + 5, 72, 6, 6).isColliding.rect.white) {
        px++;
      }
    }
  } else if (pState === "running") {
    speedRatio += (1 - speedRatio) * 0.1;
    px += 0.8 * sqrt(difficulty);
    const c = char(addWithCharCode("c", floor(ticks / 30) % 2), px, 67)
      .isColliding;
    if (c.char.e || c.char.f) {
      play("lucky");
      end();
    }
    if (c.rect.white) {
      pState = "in_hole";
    } else if (input.isJustPressed) {
      pState = "throwing";
      pAngle = 0;
    }
  } else if (pState === "throwing") {
    speedRatio += (1 - speedRatio) * 0.1;
    const p = vec(px, 67);
    if (input.isJustReleased || pAngle < -1) {
      play("powerUp");
      grenades.push({
        pos: vec(p),
        vel: vec((4 - pAngle * 0.5) * sqrt(difficulty), 0).rotate(pAngle),
      });
      pState = "running";
    } else {
      const c = char("b", p).isColliding.char;
      if (c.e || c.f) {
        play("lucky");
        end();
      }
      line(p, vec(p).add(vec(10, 0).rotate(pAngle)), 2);
      pAngle -= 0.02 * sqrt(difficulty);
    }
  }
}


}
/*
     FILE ARCHIVED ON 15:45:04 Oct 02, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 05:26:25 Nov 04, 2023.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 93.96
  exclusion.robots: 0.073
  exclusion.robots.policy: 0.062
  cdx.remote: 0.069
  esindex: 0.011
  LoadShardBlock: 40.029 (3)
  PetaboxLoader3.datanode: 48.689 (4)
  load_resource: 162.229
  PetaboxLoader3.resolve: 134.015
*/