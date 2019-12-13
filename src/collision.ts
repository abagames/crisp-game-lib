export type Collision = {
  isColliding: {
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
  let collision: Collision = {
    isColliding: { rect: {}, text: {}, char: {} }
  };
  hitBoxes.forEach(r => {
    if (testCollision(box, r)) {
      collision = {
        isColliding: {
          rect: {
            ...collision.isColliding.rect,
            ...r.collision.isColliding.rect
          },
          text: {
            ...collision.isColliding.text,
            ...r.collision.isColliding.text
          },
          char: {
            ...collision.isColliding.char,
            ...r.collision.isColliding.char
          }
        }
      };
    }
  });
  return collision;
}

function testCollision(r1: HitBox, r2: HitBox) {
  const ox = r2.pos.x - r1.pos.x;
  const oy = r2.pos.y - r1.pos.y;
  return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
}
