title = "";

description = "";

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
  `,
  `
llllll
ll l l
ll l l
llllll
ll  ll
  `
];

options = {};

let p, v;

function update() {
  if (ticks === 0) {
    p = vec(50, 50);
    v = vec();
  }
  char(String.fromCharCode("a".charCodeAt(0) + (floor(ticks / 30) % 2)), p);
}
