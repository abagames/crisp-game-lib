title = "DINO'S DESERT DASH";

description = `
[Tap]        Jump
[Double Tap] Crush Cactus
`;

characters = [
  "./dinos/images/background.png",
  "./dinos/images/ground.png",
  "./dinos/images/cactus.png",
  "./dinos/images/trex.png",
  "./dinos/images/trex2.png",
  "./dinos/images/trex3.png",
];

audioFiles = {
  bgm: "./dinos/audios/bgm.mp3",
  jump: "./dinos/audios/jump.mp3",
  stomp: "./dinos/audios/stomp.mp3",
  attack: "./dinos/audios/attack.mp3",
  powerup: "./dinos/audios/powerup.mp3",
  hit: "./dinos/audios/hit.mp3",
};

options = {
  viewSize: { x: 150, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  isDrawingParticleFront: true,
  colorPalette: [
    [86, 109, 78],
    [255, 238, 192],
    [32, 68, 75],
    [38, 80, 75],
    [42, 95, 87],
    [54, 76, 105],
    [62, 68, 90],
    [68, 66, 86],
    [119, 181, 188],
    [128, 176, 114],
    [160, 165, 70],
    [179, 187, 85],
    [181, 157, 161],
    [212, 198, 74],
    [237, 186, 173],
    [246, 149, 108],
  ],
  textEdgeColor: {
    score: "white",
    floatingScore: "white",
    title: "yellow",
    gameOver: "red",
  },
  bgmVolume: 4,
  audioTempo: 150,
};

/**
 * @type
 * {{pos: Vector, vel: Vector, gravity: -1 | 1, jumpPhase: number, animIndex: number,
 * multiplier: number, powerUpTicks: number}}
 */
let player;
/** @type {{pos: Vector, gravity: -1 | 1, vel: Vector}[]} */
let cactuses;
let nextCactusDist;
let nextCactusCount;
let backgroundX;
let groundX;
let groundY;
let groundVy;

function update() {
  if (!ticks) {
    player = {
      pos: vec(15, 75),
      vel: vec(1),
      gravity: 1,
      jumpPhase: 0,
      animIndex: 0,
      multiplier: 0,
      powerUpTicks: 0,
    };
    cactuses = [];
    nextCactusDist = [0, 0];
    nextCactusCount = [9, 9];
    backgroundX = [0, 103];
    groundX = [0, 37];
    groundY = [0, 0];
    groundVy = [0, 0];
  }
  const sd = sqrt(difficulty);
  color("black");
  updateBackground(player.vel.x * sd);
  if (player.powerUpTicks > 0) {
    color("white");
    const w = floor(player.powerUpTicks * 0.5);
    rect(0, 94, w + 2, 6);
    color(player.powerUpTicks < 60 ? "yellow" : "red");
    rect(1, 95, w, 4);
    color("black");
  }
  if (player.powerUpTicks < 60 && player.vel.x > 2) {
    player.vel.x = 2;
  }
  if (player.jumpPhase === 0) {
    let targetSpeed =
      player.powerUpTicks > 60 && player.multiplier > 0
        ? 2 + player.multiplier * 0.3
        : 1;
    player.vel.x += (targetSpeed - player.vel.x) * 0.1;
    player.powerUpTicks--;
    player.animIndex += player.vel.x;
    if (input.isJustPressed) {
      play("jump");
      player.jumpPhase = 1;
      player.vel.y = -2 * player.gravity;
    }
  } else if (player.jumpPhase === 1) {
    player.vel.y += player.gravity * (input.isPressed ? 0.05 : 0.1);
    player.pos.y += player.vel.y;
    if (player.pos.y > 75 && player.gravity > 0) {
      player.pos.y = 75;
      player.jumpPhase = 0;
    } else if (player.pos.y < 23 && player.gravity < 0) {
      player.pos.y = 23;
      player.jumpPhase = 0;
    }
    if (input.isJustPressed) {
      play("jump");
      player.jumpPhase = 2;
      player.gravity *= -1;
    }
  } else if (player.jumpPhase === 2) {
    player.vel.y += player.gravity * 0.3;
    player.pos.y += player.vel.y;
    if (
      (player.pos.y > 75 && player.gravity > 0) ||
      (player.pos.y < 23 && player.gravity < 0)
    ) {
      play("stomp", { volume: 9 });
      player.jumpPhase = 0;
      player.pos.y = player.pos.y < 50 ? 23 : 75;
      particle(player.pos.x, player.pos.y + 8 * (player.pos.y < 50 ? -1 : 1), {
        count: 25,
        speed: 1.5,
        angle: player.pos.y < 50 ? PI / 2 : -PI / 2,
        angleWidth: PI * 0.7,
      });
      if (player.gravity > 0) {
        groundY[0] = 5;
      } else {
        groundY[1] = -5;
      }
    }
  }
  if (player.powerUpTicks > 0) {
    player.powerUpTicks--;
    if (player.powerUpTicks <= 0) {
      player.multiplier = 0;
      if (player.jumpPhase > 0) {
        player.powerUpTicks = 1;
      }
    }
  }
  const isPowerUp =
    player.powerUpTicks > 0 ||
    (player.jumpPhase === 2 &&
      ((player.gravity === 1 && player.pos.y > 50) ||
        (player.gravity === -1 && player.pos.y < 50)));
  char(
    addWithCharCode("d", [0, 1, 2, 1][floor(player.animIndex * 0.1) % 4]),
    player.pos,
    {
      edgeColor: isPowerUp
        ? player.powerUpTicks < 45
          ? "yellow"
          : "red"
        : "white",
      mirror: { y: player.gravity },
    }
  );
  for (let i = 0; i < 2; i++) {
    nextCactusDist[i] -= player.vel.x * sd;
    if (nextCactusDist[i] < 0) {
      cactuses.push({
        pos: vec(155, i == 0 ? 75 : 25),
        gravity: i == 0 ? 1 : -1,
        vel: undefined,
      });
      nextCactusCount[i]--;
      if (nextCactusCount[i] <= 0) {
        if (rnd() < 0.3) {
          nextCactusCount[i] = rndi(3, 8);
        }
        nextCactusDist[i] = rnd(99, 150);
      } else {
        nextCactusDist[i] = 9;
      }
    }
  }
  remove(cactuses, (c) => {
    c.pos.x -= player.vel.x * sd;
    if (c.vel != null) {
      c.pos.add(c.vel);
      c.vel.y += c.gravity * 0.1;
      char("c", c.pos, { mirror: { y: c.gravity } });
      return c.pos.y < -5 || c.pos.y > 105;
    }
    const cc = box(c.pos.x, c.pos.y + groundY[c.gravity > 0 ? 0 : 1], 3, 9)
      .isColliding.char;
    char("c", c.pos.x, c.pos.y + groundY[c.gravity > 0 ? 0 : 1], {
      edgeColor: "blue",
      mirror: { y: c.gravity },
    }).isColliding.char;
    if (cc.d || cc.e || cc.f) {
      if (isPowerUp) {
        if (player.jumpPhase === 2 && player.gravity === c.gravity) {
          play("powerup", { volume: 2 });
          if (player.powerUpTicks < 160) {
            player.multiplier++;
          }
          player.powerUpTicks = 180;
          c.vel = vec(rnd(3), c.gravity * 2);
          particle(c.pos, { count: 30, speed: 2, edgeColor: "red" });
        } else {
          play("attack", { volume: 3 });
          c.vel = vec(rnd(5, 8), rnds(1));
          particle(c.pos, {
            count: 20,
            speed: 2,
            angle: 0,
            angleWidth: 1,
          });
          if (player.multiplier > 0) {
            addScore(player.multiplier, c.pos);
          }
          if (player.powerUpTicks < 30) {
            player.powerUpTicks = 30;
          }
        }
      } else {
        play("hit", { volume: 2 });
        end();
      }
    }
    return c.pos.x < -5;
  });
}

function updateBackground(scr) {
  for (let i = 0; i < 2; i++) {
    backgroundX[i] -= scr / 3;
    if (backgroundX[i] < -200 / 2) {
      backgroundX[i] += 200;
    }
    groundX[i] -= scr;
    if (groundX[i] < -123 / 2) {
      groundX[i] += 123;
    }
    groundVy[i] -= groundY[i] * 0.1;
    groundVy[i] *= 0.8;
    groundY[i] += groundVy[i];
    if (abs(groundVy[i]) < 0.1 && abs(groundY[i]) < 2) {
      groundY[i] = groundVy[i] = 0;
    }
  }
  char("a", backgroundX[0], 65);
  char("a", backgroundX[0] + 200, 65);
  char("a", backgroundX[1], 35, { mirror: { y: -1 } });
  char("a", backgroundX[1] + 200, 35, { mirror: { y: -1 } });
  char("b", groundX[0], 95 + groundY[0]);
  char("b", groundX[0] + 123, 95 + groundY[0]);
  char("b", groundX[0] + 123 * 2, 95 + groundY[0]);
  char("b", groundX[1], 5 + groundY[1], { mirror: { y: -1 } });
  char("b", groundX[1] + 123, 5 + groundY[1], { mirror: { y: -1 } });
  char("b", groundX[1] + 123 * 2, 5 + groundY[1], { mirror: { y: -1 } });
}
