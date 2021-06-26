title = "CROSS LINE";

description = `
[Tap]
 Connect line
`;

characters = [];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

/** @type {{pos: Vector, vy: number}[]} */
let points;
let nextPointDist;
let selectedPoint;
let pointMaxY;
let pointCount;
/** @type {{from: Vector, to: Vector, fromVy: number, toVy: number, addedCount: number}[]} */
let lines;

function update() {
  if (!ticks) {
    points = [{ pos: vec(70, 1), vy: 1 }];
    nextPointDist = 0;
    selectedPoint = points[0];
    pointMaxY = 0;
    pointCount = 0;
    lines = [
      {
        from: vec(30, 99),
        to: vec(70, 1),
        fromVy: -1,
        toVy: 1,
        addedCount: 2,
      },
    ];
  }
  let scr = sqrt(difficulty) * 0.03;
  if (pointMaxY < 40) {
    scr += (40 - pointMaxY) * 0.1;
  }
  nextPointDist -= scr;
  while (nextPointDist < 0) {
    const vy = pointCount % 2 === 0 ? -1 : 1;
    let pc = floor(pointCount / 2) % 7;
    points.push({
      pos: vec(
        pc == 3 ? rnd(10, 30) : pc === 6 ? rnd(70, 90) : rnd(10, 90),
        vy > 0 ? -nextPointDist - 19 : 119 + nextPointDist
      ),
      vy,
    });
    nextPointDist += 4;
    pointCount++;
  }
  color("light_red");
  if (input.isJustPressed) {
    box(input.pos, 5);
  }
  pointMaxY = 0;
  let isSelected = false;
  remove(points, (p) => {
    if (p.pos.x > 99) {
      return true;
    }
    p.pos.y += scr * p.vy;
    color("transparent");
    const c = box(p.pos, 4).isColliding.rect;
    if (p !== selectedPoint && !isSelected && c.light_red) {
      play("select");
      isSelected = true;
      if (selectedPoint == null) {
        selectedPoint = p;
      } else {
        color("red");
        const a = p.pos.angleTo(selectedPoint.pos);
        line(p.pos, selectedPoint.pos);
        lines.forEach((l) => {
          l.addedCount--;
        });
        lines.push({
          from: vec(selectedPoint.pos),
          to: vec(p.pos),
          fromVy: selectedPoint.vy,
          toVy: p.vy,
          addedCount: 2,
        });
        selectedPoint.pos.x = 999;
        selectedPoint = p;
      }
    }
    const my = p.vy > 0 ? p.pos.y : 100 - p.pos.y;
    if (my > pointMaxY) {
      pointMaxY = my;
    }
  });
  let multiplier = 1;
  remove(lines, (l) => {
    l.from.y += scr * l.fromVy;
    l.to.y += scr * l.toVy;
    color("black");
    if (line(l.from, l.to).isColliding.rect.red) {
      if (l.addedCount <= 0) {
        addLineParticle(l.from, l.to);
        addScore(multiplier, l.from.add(l.to).div(2));
        if (multiplier === 1) {
          play("powerUp");
          const ll = lines[lines.length - 1];
          color("red");
          addLineParticle(ll.from, ll.to);
        }
        multiplier *= 2;
        return true;
      }
    }
    color(l.fromVy > 0 ? "light_blue" : "light_cyan");
    box(l.from, 3);
    color(l.toVy > 0 ? "light_blue" : "light_cyan");
    box(l.to, 3);
    color("red");
    if (l.from.y < 0 || l.from.y > 99) {
      play("explosion");
      text("X", l.from);
      end();
    }
    if (l.to.y < 0 || l.to.y > 99) {
      play("explosion");
      text("X", l.to);
      end();
    }
  });
  points.forEach((p) => {
    color(selectedPoint === p ? "purple" : p.vy > 0 ? "blue" : "cyan");
    box(p.pos, 4);
  });

  function addLineParticle(from, to) {
    const d = from.distanceTo(to);
    let p = vec(from);
    let o = vec(7).rotate(from.angleTo(to));
    times(floor(d / 7), () => {
      particle(p, 5, 0.5);
      p.add(o);
    });
  }
}
