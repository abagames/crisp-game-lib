export type Collision = {
  rect?: {
    transparent?: boolean;
    white?: boolean;
    red?: boolean;
    blue?: boolean;
    green?: boolean;
    purple?: boolean;
    cyan?: boolean;
    black?: boolean;
    light_red?: boolean;
    light_blue?: boolean;
    light_green?: boolean;
    light_purple?: boolean;
    light_cyan?: boolean;
    light_black?: boolean;
  };
  text?: { [k: string]: boolean };
  char?: { [k: string]: boolean };
};
export type HitBox = {
  pos: VectorLike;
  size: VectorLike;
  collision: Collision;
};
export let hitBoxes: HitBox[];
export let tmpHitBoxes: HitBox[];

export function clear() {
  hitBoxes = [];
  tmpHitBoxes = [];
}

export function concatTmpHitBoxes() {
  hitBoxes = hitBoxes.concat(tmpHitBoxes);
  tmpHitBoxes = [];
}

export function checkHitBoxes(box: HitBox) {
  const collision: Collision = { rect: {}, text: {}, char: {} };
  hitBoxes.forEach(r => {
    if (testCollision(box, r)) {
      Object.assign(collision, r.collision);
    }
  });
  return collision;
}

function testCollision(r1: HitBox, r2: HitBox) {
  const ox = r2.pos.x - r1.pos.x;
  const oy = r2.pos.y - r1.pos.y;
  return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
}