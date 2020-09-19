title = "SURVIVOR";

description = `
[Tap] Jump
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  ll
 l  
  `,
  `
llllll
ll l l
ll l l
llllll
ll  l
    l
  `,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
};

let players;
let downedPlayers;
const playersCount = 9;
let barrel;

function update() {
  if (!ticks) {
    players = [];
    downedPlayers = [];
    barrel = undefined;
  }
  if (barrel == null) {
    addPlayers();
    const r = rnd(5, 25);
    barrel = {
      pos: vec(120 + r, 93 - r),
      vx: rnd(1, 2) / sqrt(r * 0.3 + 1),
      r,
      angle: rnd(PI * 2),
    };
  }
  barrel.pos.x -= barrel.vx * difficulty;
  arc(
    barrel.pos,
    barrel.r,
    3 + barrel.r * 0.1,
    barrel.angle,
    barrel.angle + PI
  );
  arc(
    barrel.pos,
    barrel.r,
    3 + barrel.r * 0.1,
    barrel.angle + PI,
    barrel.angle + PI + PI
  );
  barrel.angle -= (barrel.vx / barrel.r) * 1;
  particle(
    barrel.pos.x,
    barrel.pos.y + barrel.r,
    barrel.r * 0.05,
    barrel.vx * 5,
    -0.1,
    0.2
  );
  barrel.ticks++;
  rect(0, 93, 99, 7);
  let addingPlayerCount = 0;
  players = players.filter((p) => {
    p.ticks++;
    if (p.underFoot == null) {
      players.forEach((ap) => {
        if (p !== ap && p.isOnFloor && p.pos.distanceTo(ap.pos) < 4) {
          play("select");
          let bp = p;
          for (let i = 0; i < 99; i++) {
            if (bp.underFoot == null) {
              break;
            }
            bp = bp.underFoot;
          }
          let tp = ap;
          for (let i = 0; i < 99; i++) {
            if (tp.onHead == null) {
              break;
            }
            tp = tp.onHead;
          }
          tp.onHead = bp;
          bp.underFoot = tp;
          let rp = p;
          for (let i = 0; i < 99; i++) {
            rp.isJumped = rp.isOnFloor = false;
            if (rp.onHead == null) {
              break;
            }
            rp = rp.onHead;
          }
          rp = p;
          for (let i = 0; i < 99; i++) {
            rp.isJumped = rp.isOnFloor = false;
            if (rp.underFoot == null) {
              break;
            }
            rp = rp.underFoot;
          }
        }
      });
    }
    if (
      input.isJustPressed &&
      (p.isOnFloor || (p.underFoot != null && p.underFoot.isJumped))
    ) {
      play("jump");
      p.vel.set(0, -1.5);
      particle(p.pos, 10, 2, PI / 2, 0.5);
      p.isOnFloor = false;
      p.isJumping = true;
      if (p.underFoot != null) {
        p.underFoot.onHead = undefined;
        p.underFoot = undefined;
      }
    }
    if (p.underFoot != null) {
      p.pos.set(p.underFoot.pos).add(0, -6);
      p.vel.set();
    } else {
      p.pos.add(p.vel.x * difficulty, p.vel.y * difficulty);
      p.vel.x *= 0.95;
      if ((p.pos.x < 7 && p.vel.x < 0) || (p.pos.x >= 77 && p.vel.x > 0)) {
        p.vel.x *= -0.5;
      }
      if (p.pos.x < 50) {
        p.vel.x += 0.01 * sqrt(50 - p.pos.x + 1);
      } else {
        p.vel.x -= 0.01 * sqrt(p.pos.x - 50 + 1);
      }
      if (p.isOnFloor) {
        if (p.pos.x < barrel.pos.x) {
          p.vel.x -= (0.1 * sqrt(barrel.r)) / sqrt(barrel.pos.x - p.pos.x + 1);
        }
      } else {
        p.vel.y += 0.1;
        if (p.pos.y > 90) {
          p.pos.y = 90;
          p.isOnFloor = true;
          p.isJumped = false;
          p.vel.y = 0;
        }
      }
      if (p.pos.y < 0 && p.vel.y < 0) {
        p.vel.y *= -0.5;
      }
    }
    if (
      char(addWithCharCode("a", floor(p.ticks / 30) % 2), p.pos).isColliding
        .rect.black
    ) {
      if (p.onHead != null) {
        p.onHead.underFoot = undefined;
        p.onHead.isJumping = true;
      }
      if (p.underFoot != null) {
        p.underFoot.onHead = undefined;
      }
      play("hit");
      downedPlayers.push({
        pos: vec(p.pos),
        vel: vec(p.vel).add(-barrel.vx * 2, 0),
      });
      return false;
    }
    if (!p.pos.isInRect(0, -50, 100, 150)) {
      addingPlayerCount++;
      return false;
    }
    return true;
  });
  times(addingPlayerCount, addPlayer);
  players.forEach((p) => {
    if (p.isJumping) {
      p.isJumped = true;
      p.isJumping = false;
    }
  });
  if (players.length <= 0) {
    play("lucky");
    end();
  }
  downedPlayers = downedPlayers.filter((p) => {
    p.pos.add(p.vel);
    p.vel.y += 0.2;
    char("a", p.pos, { mirror: { y: -1 } });
    return p.pos.y < 105;
  });
  if (barrel.pos.x < -barrel.r) {
    barrel = undefined;
    addScore(players.length, 10, 50);
  }
}

function addPlayers() {
  play("powerUp");
  while (players.length < playersCount) {
    addPlayer();
  }
}

function addPlayer() {
  players.push({
    pos: vec(rnd(10, 40), rnd(-9, 0)),
    vel: vec(rnds(1), rnd(1)),
    isOnFloor: false,
    isJumping: false,
    isJumped: false,
    underFoot: undefined,
    onHead: undefined,
    ticks: rndi(60),
  });
}
