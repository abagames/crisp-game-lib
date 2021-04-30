title = "PAIRS DROP";

description = `
[Tap] Open
`;

characters = [
  `
l  l
l l l
l l l
l l l
l  l
`,
  `
l l l
 l l 
l l l
 l l 
l l l
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 101,
};

/** @type {{pos: Vector, n: number, isOpen: boolean, vy: number}[]} */
let cards;
/** @type {Vector} */
let nextCardPos;
let scr;
let openedCards;
let openedTicks;
let multiplier;

function update() {
  if (!ticks) {
    cards = [];
    nextCardPos = vec(20, -6);
    scr = 0;
    openedCards = [];
    openedTicks = 0;
    multiplier = 1;
  }
  let minY = 99;
  let maxY = 0;
  openedTicks--;
  if (openedTicks === 0) {
    remove(openedCards, (c) => {
      c.isOpen = false;
      return true;
    });
  }
  let isOpening = false;
  remove(cards, (c) => {
    const cl = c.isOpen ? (openedTicks > 0 ? "green" : "cyan") : "blue";
    color(cl);
    rect(c.pos.x - 4, c.pos.y - 5, 9, 11);
    color("white");
    rect(c.pos.x - 3, c.pos.y - 4, 7, 9);
    color(cl);
    c.pos.y += scr + c.vy;
    if (c.vy > 0) {
      c.vy += 0.1;
    }
    if (c.isOpen) {
      if (c.n === 0) {
        text("A", c.pos);
      } else if (c.n < 9) {
        text(`${c.n + 1}`, c.pos);
      } else if (c.n === 9) {
        char("a", c.pos);
      } else {
        text(`${["J", "Q", "K"][c.n - 10]}`, c.pos);
      }
    } else {
      char("b", c.pos);
      if (
        c.vy === 0 &&
        input.isJustPressed &&
        abs(c.pos.x - input.pos.x) < 5 &&
        abs(c.pos.y - input.pos.y) < 6
      ) {
        play("hit");
        if (openedTicks >= 0) {
          remove(openedCards, (c) => {
            c.isOpen = false;
            return true;
          });
          openedTicks = 0;
        }
        isOpening = true;
        c.isOpen = true;
        openedCards.push(c);
      }
    }
    if (c.pos.y < minY) {
      minY = c.pos.y;
    }
    if (c.pos.y > maxY) {
      maxY = c.pos.y;
    }
    if (c.vy === 0 && c.pos.y > 95) {
      play("explosion");
      color("red");
      text("X", c.pos);
      end();
    }
    if (c.pos.y > 99) {
      play("coin");
      addScore(multiplier, c.pos);
      multiplier++;
      return true;
    }
  });
  if (openedTicks < 0 && openedCards.length === 2) {
    if (openedCards[0].n === openedCards[1].n) {
      play("powerUp");
      fallCards(openedCards[0]);
      fallCards(openedCards[1]);
      openedCards = [];
      multiplier = 1;
    } else {
      play("laser");
    }
    openedTicks = 60;
  }
  nextCardPos.y += scr;
  scr += (difficulty * 0.0015 - scr) * 0.2 + (isOpening ? 0.15 : 0);
  if (maxY < 50) {
    scr += (50 - maxY) * 0.01;
  }
  if (minY > -6) {
    addCards();
  }

  function fallCards(rc) {
    let p = rc.pos;
    cards.forEach((c) => {
      if (c.pos.x === p.x && c.pos.y >= p.y) {
        c.vy = 1;
      }
    });
  }

  function addCards() {
    let ns = times(26, (i) => i % 13);
    times(99, () => {
      let i1 = rndi(26);
      let i2 = rndi(26);
      let tn = ns[i1];
      ns[i1] = ns[i2];
      ns[i2] = tn;
    });
    ns.forEach((n) => {
      cards.push({ pos: vec(nextCardPos), n, isOpen: false, vy: 0 });
      nextCardPos.x += 10;
      if (nextCardPos.x > 80) {
        nextCardPos.x = 20;
        nextCardPos.y -= 12;
      }
    });
  }
}
