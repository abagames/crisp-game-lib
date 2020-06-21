(function (exports, PIXI) {
  'use strict';

  function clamp(v, low = 0, high = 1) {
      return Math.max(low, Math.min(v, high));
  }
  function wrap(v, low, high) {
      const w = high - low;
      const o = v - low;
      if (o >= 0) {
          return (o % w) + low;
      }
      else {
          let wv = w + (o % w) + low;
          if (wv >= high) {
              wv -= w;
          }
          return wv;
      }
  }
  function isInRange(v, low, high) {
      return low <= v && v < high;
  }
  function range(v) {
      return [...Array(v).keys()];
  }
  function times(v, func) {
      return range(v).map((i) => func(i));
  }
  function fromEntities(v) {
      return [...v].reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
      }, {});
  }
  function entries(obj) {
      return Object.keys(obj).map((p) => [p, obj[p]]);
  }
  function addWithCharCode(char, offset) {
      return String.fromCharCode(char.charCodeAt(0) + offset);
  }

  function isVectorLike(v) {
      return v.x != null && v.y != null;
  }
  class Vector {
      constructor(x, y) {
          this.x = 0;
          this.y = 0;
          this.set(x, y);
      }
      set(x = 0, y = 0) {
          if (isVectorLike(x)) {
              this.x = x.x;
              this.y = x.y;
              return this;
          }
          this.x = x;
          this.y = y;
          return this;
      }
      add(x, y) {
          if (isVectorLike(x)) {
              this.x += x.x;
              this.y += x.y;
              return this;
          }
          this.x += x;
          this.y += y;
          return this;
      }
      sub(x, y) {
          if (isVectorLike(x)) {
              this.x -= x.x;
              this.y -= x.y;
              return this;
          }
          this.x -= x;
          this.y -= y;
          return this;
      }
      mul(v) {
          this.x *= v;
          this.y *= v;
          return this;
      }
      div(v) {
          this.x /= v;
          this.y /= v;
          return this;
      }
      clamp(xLow, xHigh, yLow, yHigh) {
          this.x = clamp(this.x, xLow, xHigh);
          this.y = clamp(this.y, yLow, yHigh);
          return this;
      }
      wrap(xLow, xHigh, yLow, yHigh) {
          this.x = wrap(this.x, xLow, xHigh);
          this.y = wrap(this.y, yLow, yHigh);
          return this;
      }
      addWithAngle(angle, length) {
          this.x += Math.cos(angle) * length;
          this.y += Math.sin(angle) * length;
          return this;
      }
      swapXy() {
          const t = this.x;
          this.x = this.y;
          this.y = t;
          return this;
      }
      normalize() {
          this.div(this.length);
          return this;
      }
      rotate(angle) {
          if (angle === 0) {
              return this;
          }
          const tx = this.x;
          this.x = tx * Math.cos(angle) - this.y * Math.sin(angle);
          this.y = tx * Math.sin(angle) + this.y * Math.cos(angle);
          return this;
      }
      angleTo(x, y) {
          if (isVectorLike(x)) {
              return Math.atan2(x.y - this.y, x.x - this.x);
          }
          else {
              return Math.atan2(x - this.y, y - this.x);
          }
      }
      distanceTo(x, y) {
          let ox;
          let oy;
          if (isVectorLike(x)) {
              ox = x.x - this.x;
              oy = x.y - this.y;
          }
          else {
              ox = x - this.x;
              oy = y - this.y;
          }
          return Math.sqrt(ox * ox + oy * oy);
      }
      isInRect(x, y, width, height) {
          return isInRange(this.x, x, x + width) && isInRange(this.y, y, y + height);
      }
      equals(other) {
          return this.x === other.x && this.y === other.y;
      }
      floor() {
          this.x = Math.floor(this.x);
          this.y = Math.floor(this.y);
          return this;
      }
      round() {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
      }
      ceil() {
          this.x = Math.ceil(this.x);
          this.y = Math.ceil(this.y);
          return this;
      }
      get length() {
          return Math.sqrt(this.x * this.x + this.y * this.y);
      }
      get angle() {
          return Math.atan2(this.y, this.x);
      }
  }

  const textPatterns = [
      // !
      `
  l
  l
  l

  l
`,
      `
 l l
 l l



`,
      `
 l l
lllll
 l l
lllll
 l l
`,
      `
 lll
l l
 lll
  l l
 lll
`,
      `
l   l
l  l
  l
 l  l
l   l
`,
      `
 l
l l
 ll l
l  l
 ll l
`,
      `
  l
  l



`,
      `
   l
  l
  l
  l
   l
`,
      `
 l
  l
  l
  l
 l
`,
      `
  l
l l l
 lll
l l l
  l
`,
      `
  l
  l
lllll
  l
  l
`,
      `



  l
 l
`,
      `


lllll


`,
      `




  l
`,
      `
    l
   l
  l
 l
l
`,
      // 0
      `
 lll
l  ll
l l l
ll  l
 lll
`,
      `
 ll
l l
  l
  l
lllll
`,
      `
 lll
l   l
  ll
 l
lllll
`,
      `
 lll
l   l
  ll
l   l
 lll
`,
      `
  ll
 l l
l  l
lllll
   l
`,
      `
lllll
l
llll
    l
llll
`,
      `
 lll
l
llll
l   l
 lll
`,
      `
lllll
l   l
   l
  l
 l
`,
      `
 lll
l   l
 lll
l   l
 lll
`,
      `
 lll
l   l
 llll
    l
 lll
`,
      // :
      `

  l

  l

`,
      `

  l

  l
 l
`,
      `
   ll
 ll
l
 ll
   ll
`,
      `

lllll

lllll

`,
      `
ll
  ll
    l
  ll
ll
`,
      `
 lll
l   l
  ll

  l
`,
      `
 lll
l   l
l lll
l
 lll
`,
      // A
      `
 lll
l   l
lllll
l   l
l   l
`,
      `
llll
l   l
llll
l   l
llll
`,
      `
 lll
l   l
l
l   l
 lll
`,
      `
llll
l   l
l   l
l   l
llll
`,
      `
lllll
l
llll
l
lllll
`,
      `
lllll
l
llll
l
l
`,
      `
 lll
l
l  ll
l   l
 llll
`,
      `
l   l
l   l
lllll
l   l
l   l
`,
      `
lllll
  l
  l
  l
lllll
`,
      `
 llll
   l
   l
l  l
 ll
`,
      `
l   l
l  l
lll
l  l
l   l
`,
      `
l
l
l
l
lllll
`,
      `
l   l
ll ll
l l l
l   l
l   l
`,
      `
l   l
ll  l
l l l
l  ll
l   l
`,
      `
 lll
l   l
l   l
l   l
 lll
`,
      `
llll
l   l
llll
l
l
`,
      `
 lll
l   l
l   l
l  ll
 llll
`,
      `
llll
l   l
llll
l   l
l   l
`,
      `
 llll
l
 lll
    l
llll
`,
      `
lllll
  l
  l
  l
  l
`,
      `
l   l
l   l
l   l
l   l
 lll
`,
      `
l   l
l   l
 l l
 l l
  l
`,
      `
l   l
l   l
l l l
l l l
 l l
`,
      `
l   l
 l l
  l
 l l
l   l
`,
      `
l   l
 l l
  l
  l
  l
`,
      `
lllll
   l
  l
 l
lllll
`,
      `
  ll
  l
  l
  l
  ll
`,
      `
l
 l
  l
   l
    l
`,
      `
 ll
  l
  l
  l
 ll
`,
      `
  l
 l l



`,
      `




lllll
`,
      `
 l
  l



`,
      // a
      `
 ll
   l
 lll
l  l
 ll
`,
      `
l
l
lll
l  l
lll
`,
      `

 ll
l  
l
 ll
`,
      `
   l
   l
 lll
l  l
 lll
`,
      `
 ll
l  l
lll
l
 ll
`,
      `
   l
  l 
 lll
  l
  l
`,
      `
 lll
l  l
 lll
   l
 ll
`,
      `
l
l
lll
l  l
l  l
`,
      `
  l

  l
  l
  l
`,
      `
   l

   l
   l
 ll
`,
      `
l
l
l l
ll
l l
`,
      `
 ll
  l
  l
  l
 lll
`,
      `

ll l
l l l
l l l
l l l
`,
      `

l ll
ll  l
l   l
l   l
`,
      `

 ll
l  l
l  l
 ll
`,
      `

lll
l  l
lll
l
`,
      `

 lll
l  l
 lll
   l
`,
      `

l ll
ll
l
l
`,
      `
 ll
l
 ll  
   l
 ll
`,
      `
 l
lll
 l
 l
  l
`,
      `

l  l
l  l
l  l
 ll
`,
      `

l  l
l  l
 ll
 ll
`,
      `

l l l
l l l
l l l
 l l
`,
      `

l  l
 ll
 ll
l  l
`,
      `

l  l
 ll
 l
l
`,
      `

llll
  l
 l
llll
`,
      //{
      `
  ll
  l
 l
  l
  ll
`,
      `
  l
  l
  l
  l
  l
`,
      `
 ll
  l
   l
  l
 ll
`,
      `

 l
l l l
   l

`
  ];

  const colors = [
      "transparent",
      "white",
      "red",
      "green",
      "yellow",
      "blue",
      "purple",
      "cyan",
      "black",
      "light_red",
      "light_green",
      "light_yellow",
      "light_blue",
      "light_purple",
      "light_cyan",
      "light_black",
  ];
  const colorChars = "twrgybpclRGYBPCL";
  let values;
  const rgbNumbers = [
      0xeeeeee,
      0xe91e63,
      0x4caf50,
      0xffc107,
      0x3f51b5,
      0x9c27b0,
      0x03a9f4,
      0x616161,
  ];
  function init() {
      const [wr, wb, wg] = getRgb(0);
      values = fromEntities(colors.map((c, i) => {
          if (i < 1) {
              return [c, { r: 0, g: 0, b: 0, a: 0 }];
          }
          if (i < 9) {
              const [r, g, b] = getRgb(i - 1);
              return [c, { r, g, b, a: 1 }];
          }
          const [r, g, b] = getRgb(i - 9 + 1);
          return [
              c,
              {
                  r: Math.floor(wr - (wr - r) * 0.5),
                  g: Math.floor(wg - (wg - g) * 0.5),
                  b: Math.floor(wb - (wb - b) * 0.5),
                  a: 1,
              },
          ];
      }));
  }
  function getRgb(i) {
      const n = rgbNumbers[i];
      return [(n & 0xff0000) >> 16, (n & 0xff00) >> 8, n & 0xff];
  }
  function colorToNumber(colorName, ratio = 1) {
      const v = values[colorName];
      return ((Math.floor(v.r * ratio) << 16) |
          (Math.floor(v.g * ratio) << 8) |
          Math.floor(v.b * ratio));
  }
  function colorToStyle(colorName, ratio = 1) {
      const v = values[colorName];
      const r = Math.floor(v.r * ratio);
      const g = Math.floor(v.g * ratio);
      const b = Math.floor(v.b * ratio);
      return v.a < 1 ? `rgba(${r},${g},${b},${v.a})` : `rgb(${r},${g},${b})`;
  }

  let hitBoxes;
  let tmpHitBoxes;
  function clear() {
      hitBoxes = [];
      tmpHitBoxes = [];
  }
  function concatTmpHitBoxes() {
      hitBoxes = hitBoxes.concat(tmpHitBoxes);
      tmpHitBoxes = [];
  }
  function checkHitBoxes(box) {
      let collision = {
          isColliding: { rect: {}, text: {}, char: {} },
      };
      hitBoxes.forEach((r) => {
          if (testCollision(box, r)) {
              collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(r.collision.isColliding.rect)), { isColliding: {
                      rect: Object.assign(Object.assign({}, collision.isColliding.rect), r.collision.isColliding.rect),
                      text: Object.assign(Object.assign({}, collision.isColliding.text), r.collision.isColliding.text),
                      char: Object.assign(Object.assign({}, collision.isColliding.char), r.collision.isColliding.char),
                  } });
          }
      });
      return collision;
  }
  function testCollision(r1, r2) {
      const ox = r2.pos.x - r1.pos.x;
      const oy = r2.pos.y - r1.pos.y;
      return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
  }
  function createShorthand(rects) {
      if (rects == null) {
          return {};
      }
      const colorReplaces = {
          transparent: "tr",
          white: "wh",
          red: "rd",
          green: "gr",
          yellow: "yl",
          blue: "bl",
          purple: "pr",
          cyan: "cy",
          black: "lc",
      };
      let shorthandRects = {};
      entries(rects).forEach(([k, v]) => {
          const sh = colorReplaces[k];
          if (v && sh != null) {
              shorthandRects[sh] = true;
          }
      });
      return shorthandRects;
  }

  function text(str, x, y, options) {
      return letters(false, str, x, y, options);
  }
  function char(str, x, y, options) {
      return letters(true, str, x, y, options);
  }
  function letters(isCharacter, str, x, y, options) {
      if (typeof x === "number") {
          if (typeof y === "number") {
              return print(str, x - letterSize / 2, y - letterSize / 2, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, options));
          }
          else {
              throw "invalid params";
          }
      }
      else {
          return print(str, x.x - letterSize / 2, x.y - letterSize / 2, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, y));
      }
  }
  const dotCount = 6;
  const dotSize = 1;
  const letterSize = dotCount * dotSize;
  let textImages;
  let characterImages;
  let cachedImages;
  let isCacheEnabled = false;
  let letterCanvas;
  let letterContext;
  const defaultOptions = {
      color: "black",
      backgroundColor: "transparent",
      rotation: 0,
      mirror: { x: 1, y: 1 },
      scale: { x: 1, y: 1 },
      isCharacter: false,
      isCheckingCollision: false,
  };
  function init$1() {
      letterCanvas = document.createElement("canvas");
      letterCanvas.width = letterCanvas.height = letterSize;
      letterContext = letterCanvas.getContext("2d");
      textImages = textPatterns.map((lp, i) => {
          return Object.assign(Object.assign({}, createLetterImages(lp)), { hitBox: getHitBox(String.fromCharCode(0x21 + i), false) });
      });
      characterImages = textPatterns.map((lp, i) => {
          return Object.assign(Object.assign({}, createLetterImages(lp)), { hitBox: getHitBox(String.fromCharCode(0x21 + i), true) });
      });
      cachedImages = {};
  }
  function defineCharacters(pattern, startLetter) {
      const index = startLetter.charCodeAt(0) - 0x21;
      pattern.forEach((lp, i) => {
          characterImages[index + i] = Object.assign(Object.assign({}, createLetterImages(lp)), { hitBox: getHitBox(String.fromCharCode(0x21 + index + i), true) });
      });
  }
  function enableCache() {
      isCacheEnabled = true;
  }
  function print(_str, x, y, _options = {}) {
      const options = mergeDefaultOptions(_options);
      const bx = Math.floor(x);
      let str = _str;
      let px = bx;
      let py = Math.floor(y);
      let collision = { isColliding: { rect: {}, text: {}, char: {} } };
      for (let i = 0; i < str.length; i++) {
          const c = str[i];
          if (c === "\n") {
              px = bx;
              py += letterSize * options.scale.y;
              continue;
          }
          const charCollision = printChar(c, px, py, options);
          if (options.isCheckingCollision) {
              collision = {
                  isColliding: {
                      rect: Object.assign(Object.assign({}, collision.isColliding.rect), charCollision.isColliding.rect),
                      text: Object.assign(Object.assign({}, collision.isColliding.text), charCollision.isColliding.text),
                      char: Object.assign(Object.assign({}, collision.isColliding.char), charCollision.isColliding.char),
                  },
              };
          }
          px += letterSize * options.scale.x;
      }
      return collision;
  }
  function printChar(c, x, y, _options) {
      const cca = c.charCodeAt(0);
      if (cca < 0x20 || cca > 0x7e) {
          return { isColliding: { rect: {}, text: {}, char: {} } };
      }
      const options = mergeDefaultOptions(_options);
      if (options.backgroundColor !== "transparent") {
          saveCurrentColor();
          setColor(options.backgroundColor);
          fillRect(x, y, letterSize * options.scale.x, letterSize * options.scale.y);
          loadCurrentColor();
      }
      if (cca <= 0x20 || options.color === "transparent") {
          return { isColliding: { rect: {}, text: {}, char: {} } };
      }
      const cc = cca - 0x21;
      const li = options.isCharacter ? characterImages[cc] : textImages[cc];
      const rotation = wrap(options.rotation, 0, 4);
      if (options.color === "black" &&
          rotation === 0 &&
          options.mirror.x === 1 &&
          options.mirror.y === 1) {
          return drawAndTestLetterImage(li, x, y, options.scale, options.isCheckingCollision);
      }
      const cacheIndex = JSON.stringify({ c, options });
      const ci = cachedImages[cacheIndex];
      if (ci != null) {
          return drawAndTestLetterImage(ci, x, y, options.scale, options.isCheckingCollision);
      }
      letterContext.clearRect(0, 0, letterSize, letterSize);
      if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
          letterContext.drawImage(li.image, 0, 0);
      }
      else {
          letterContext.save();
          letterContext.translate(letterSize / 2, letterSize / 2);
          letterContext.rotate((Math.PI / 2) * rotation);
          if (options.mirror.x === -1 || options.mirror.y === -1) {
              letterContext.scale(options.mirror.x, options.mirror.y);
          }
          letterContext.drawImage(li.image, -letterSize / 2, -letterSize / 2);
          letterContext.restore();
      }
      if (options.color !== "black") {
          letterContext.globalCompositeOperation = "source-in";
          letterContext.fillStyle = colorToStyle(options.color);
          letterContext.fillRect(0, 0, letterSize, letterSize);
          letterContext.globalCompositeOperation = "source-over";
      }
      const hitBox = getHitBox(c, options.isCharacter);
      let texture;
      if (isCacheEnabled || isUsingPixi) {
          const cachedImage = document.createElement("img");
          cachedImage.src = letterCanvas.toDataURL();
          {
              texture = PIXI.Texture.from(cachedImage);
          }
          if (isCacheEnabled) {
              cachedImages[cacheIndex] = {
                  image: cachedImage,
                  texture,
                  hitBox,
              };
          }
      }
      return drawAndTestLetterImage({ image: letterCanvas, texture, hitBox }, x, y, options.scale, options.isCheckingCollision);
  }
  function drawAndTestLetterImage(li, x, y, scale, isCheckCollision) {
      if (scale.x === 1 && scale.y === 1) {
          drawLetterImage(li, x, y);
      }
      else {
          drawLetterImage(li, x, y, letterSize * scale.x, letterSize * scale.y);
      }
      if (!isCheckCollision) {
          return;
      }
      const hitBox = {
          pos: { x: x + li.hitBox.pos.x, y: y + li.hitBox.pos.y },
          size: { x: li.hitBox.size.x * scale.x, y: li.hitBox.size.y * scale.y },
          collision: li.hitBox.collision,
      };
      const collision = checkHitBoxes(hitBox);
      hitBoxes.push(hitBox);
      return collision;
  }
  function createLetterImages(pattern, isSkippingFirstAndLastLine = true) {
      letterContext.clearRect(0, 0, letterSize, letterSize);
      let p = pattern.split("\n");
      if (isSkippingFirstAndLastLine) {
          p = p.slice(1, p.length - 1);
      }
      let pw = 0;
      p.forEach((l) => {
          pw = Math.max(l.length, pw);
      });
      const xPadding = Math.max(Math.ceil((dotCount - pw) / 2), 0);
      const ph = p.length;
      const yPadding = Math.max(Math.ceil((dotCount - ph) / 2), 0);
      p.forEach((l, y) => {
          if (y + yPadding >= dotCount) {
              return;
          }
          for (let x = 0; x < dotCount - xPadding; x++) {
              const c = l.charAt(x);
              let ci = colorChars.indexOf(c);
              if (c !== "" && ci >= 1) {
                  letterContext.fillStyle = colorToStyle(colors[ci]);
                  letterContext.fillRect((x + xPadding) * dotSize, (y + yPadding) * dotSize, dotSize, dotSize);
              }
          }
      });
      const image = document.createElement("img");
      image.src = letterCanvas.toDataURL();
      {
          return { image, texture: PIXI.Texture.from(image) };
      }
  }
  function getHitBox(c, isCharacter) {
      const b = {
          pos: new Vector(letterSize, letterSize),
          size: new Vector(),
          collision: { isColliding: { char: {}, text: {} } },
      };
      if (isCharacter) {
          b.collision.isColliding.char[c] = true;
      }
      else {
          b.collision.isColliding.text[c] = true;
      }
      const d = letterContext.getImageData(0, 0, letterSize, letterSize).data;
      let i = 0;
      for (let y = 0; y < letterSize; y++) {
          for (let x = 0; x < letterSize; x++) {
              if (d[i + 3] > 0) {
                  if (x < b.pos.x) {
                      b.pos.x = x;
                  }
                  if (y < b.pos.y) {
                      b.pos.y = y;
                  }
                  if (x > b.pos.x + b.size.x - 1) {
                      b.size.x = x - b.pos.x + 1;
                  }
                  if (y > b.pos.y + b.size.y - 1) {
                      b.size.y = y - b.pos.y + 1;
                  }
              }
              i += 4;
          }
      }
      return b;
  }
  function mergeDefaultOptions(_options) {
      let options = Object.assign(Object.assign({}, defaultOptions), _options);
      if (_options.scale != null) {
          options.scale = Object.assign(Object.assign({}, defaultOptions.scale), _options.scale);
      }
      if (_options.mirror != null) {
          options.mirror = Object.assign(Object.assign({}, defaultOptions.mirror), _options.mirror);
      }
      return options;
  }

  class Terminal {
      constructor(_size) {
          this.size = new Vector();
          this.size.set(_size);
          this.letterGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.colorGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.backgroundColorGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.rotationGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.characterGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
      }
      print(str, _x, _y, _options = {}) {
          const options = Object.assign(Object.assign({}, defaultOptions), _options);
          let x = Math.floor(_x);
          let y = Math.floor(_y);
          const bx = x;
          for (let i = 0; i < str.length; i++) {
              const c = str[i];
              if (c === "\n") {
                  x = bx;
                  y++;
                  continue;
              }
              if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
                  x++;
                  continue;
              }
              this.letterGrid[x][y] = c;
              this.colorGrid[x][y] = options.color;
              this.backgroundColorGrid[x][y] = options.backgroundColor;
              this.rotationGrid[x][y] = options.rotation;
              this.characterGrid[x][y] = options.isCharacter;
              x++;
          }
      }
      getCharAt(_x, _y) {
          if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
              return undefined;
          }
          const x = Math.floor(_x);
          const y = Math.floor(_y);
          const char = this.letterGrid[x][y];
          const cg = this.colorGrid[x][y];
          const bg = this.backgroundColorGrid[x][y];
          const rg = this.rotationGrid[x][y];
          const hg = this.characterGrid[x][y];
          return {
              char,
              options: { color: cg, backgroundColor: bg, rotation: rg, isCharacter: hg }
          };
      }
      setCharAt(_x, _y, char, _options) {
          if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
              return;
          }
          const options = Object.assign(Object.assign({}, defaultOptions), _options);
          const x = Math.floor(_x);
          const y = Math.floor(_y);
          this.letterGrid[x][y] = char;
          this.colorGrid[x][y] = options.color;
          this.backgroundColorGrid[x][y] = options.backgroundColor;
          this.rotationGrid[x][y] = options.rotation;
          this.characterGrid[x][y] = options.isCharacter;
      }
      draw() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 0; y < this.size.y; y++) {
                  const c = this.letterGrid[x][y];
                  if (c == null) {
                      continue;
                  }
                  const cg = this.colorGrid[x][y];
                  const bg = this.backgroundColorGrid[x][y];
                  const rg = this.rotationGrid[x][y];
                  const hg = this.characterGrid[x][y];
                  printChar(c, x * letterSize, y * letterSize, {
                      color: cg,
                      backgroundColor: bg,
                      rotation: rg,
                      isCharacter: hg
                  });
              }
          }
      }
      clear() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 0; y < this.size.y; y++) {
                  this.letterGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = this.characterGrid[x][y] = undefined;
              }
          }
      }
      scrollUp() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 1; y < this.size.y; y++) {
                  this.letterGrid[x][y - 1] = this.letterGrid[x][y];
                  this.colorGrid[x][y - 1] = this.colorGrid[x][y];
                  this.backgroundColorGrid[x][y - 1] = this.backgroundColorGrid[x][y];
                  this.rotationGrid[x][y - 1] = this.rotationGrid[x][y];
                  this.characterGrid[x][y - 1] = this.characterGrid[x][y];
              }
          }
          const y = this.size.y - 1;
          for (let x = 0; x < this.size.x; x++) {
              this.letterGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = this.characterGrid[x][y] = undefined;
          }
      }
      getState() {
          return {
              charGrid: this.letterGrid.map(l => [].concat(l)),
              colorGrid: this.colorGrid.map(l => [].concat(l)),
              backgroundColorGrid: this.backgroundColorGrid.map(l => [].concat(l)),
              rotationGrid: this.rotationGrid.map(l => [].concat(l)),
              symbolGrid: this.characterGrid.map(l => [].concat(l))
          };
      }
      setState(state) {
          this.letterGrid = state.charGrid.map(l => [].concat(l));
          this.colorGrid = state.colorGrid.map(l => [].concat(l));
          this.backgroundColorGrid = state.backgroundColorGrid.map(l => [].concat(l));
          this.rotationGrid = state.rotationGrid.map(l => [].concat(l));
          this.characterGrid = state.symbolGrid.map(l => [].concat(l));
      }
  }

  let isPressed = false;
  let isJustPressed = false;
  let isJustReleased = false;
  const codes = [
      "Escape",
      "Digit0",
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
      "Digit9",
      "Minus",
      "Equal",
      "Backspace",
      "Tab",
      "KeyQ",
      "KeyW",
      "KeyE",
      "KeyR",
      "KeyT",
      "KeyY",
      "KeyU",
      "KeyI",
      "KeyO",
      "KeyP",
      "BracketLeft",
      "BracketRight",
      "Enter",
      "ControlLeft",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyF",
      "KeyG",
      "KeyH",
      "KeyJ",
      "KeyK",
      "KeyL",
      "Semicolon",
      "Quote",
      "Backquote",
      "ShiftLeft",
      "Backslash",
      "KeyZ",
      "KeyX",
      "KeyC",
      "KeyV",
      "KeyB",
      "KeyN",
      "KeyM",
      "Comma",
      "Period",
      "Slash",
      "ShiftRight",
      "NumpadMultiply",
      "AltLeft",
      "Space",
      "CapsLock",
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "Pause",
      "ScrollLock",
      "Numpad7",
      "Numpad8",
      "Numpad9",
      "NumpadSubtract",
      "Numpad4",
      "Numpad5",
      "Numpad6",
      "NumpadAdd",
      "Numpad1",
      "Numpad2",
      "Numpad3",
      "Numpad0",
      "NumpadDecimal",
      "IntlBackslash",
      "F11",
      "F12",
      "F13",
      "F14",
      "F15",
      "F16",
      "F17",
      "F18",
      "F19",
      "F20",
      "F21",
      "F22",
      "F23",
      "F24",
      "IntlYen",
      "Undo",
      "Paste",
      "MediaTrackPrevious",
      "Cut",
      "Copy",
      "MediaTrackNext",
      "NumpadEnter",
      "ControlRight",
      "LaunchMail",
      "AudioVolumeMute",
      "MediaPlayPause",
      "MediaStop",
      "Eject",
      "AudioVolumeDown",
      "AudioVolumeUp",
      "BrowserHome",
      "NumpadDivide",
      "PrintScreen",
      "AltRight",
      "Help",
      "NumLock",
      "Pause",
      "Home",
      "ArrowUp",
      "PageUp",
      "ArrowLeft",
      "ArrowRight",
      "End",
      "ArrowDown",
      "PageDown",
      "Insert",
      "Delete",
      "OSLeft",
      "OSRight",
      "ContextMenu",
      "BrowserSearch",
      "BrowserFavorites",
      "BrowserRefresh",
      "BrowserStop",
      "BrowserForward",
      "BrowserBack"
  ];
  let code;
  const defaultOptions$1 = {
      onKeyDown: undefined
  };
  let options$1;
  let isKeyPressing = false;
  let isKeyPressed = false;
  let isKeyReleased = false;
  let pressingCode = {};
  let pressedCode = {};
  let releasedCode = {};
  function init$2(_options) {
      options$1 = Object.assign(Object.assign({}, defaultOptions$1), _options);
      code = fromEntities(codes.map(c => [
          c,
          {
              isPressed: false,
              isJustPressed: false,
              isJustReleased: false
          }
      ]));
      document.addEventListener("keydown", e => {
          isKeyPressing = isKeyPressed = true;
          pressingCode[e.code] = pressedCode[e.code] = true;
          if (options$1.onKeyDown != null) {
              options$1.onKeyDown();
          }
          if (e.code === "AltLeft" || e.code === "AltRight") {
              e.preventDefault();
          }
      });
      document.addEventListener("keyup", e => {
          isKeyPressing = false;
          isKeyReleased = true;
          pressingCode[e.code] = false;
          releasedCode[e.code] = true;
      });
  }
  function update$1() {
      isJustPressed = !isPressed && isKeyPressed;
      isJustReleased = isPressed && isKeyReleased;
      isKeyPressed = isKeyReleased = false;
      isPressed = isKeyPressing;
      entries(code).forEach(([c, s]) => {
          s.isJustPressed = !s.isPressed && pressedCode[c];
          s.isJustReleased = s.isPressed && releasedCode[c];
          s.isPressed = !!pressingCode[c];
      });
      pressedCode = {};
      releasedCode = {};
  }
  function clearJustPressed() {
      isJustPressed = false;
      isPressed = true;
  }

  var keyboard = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get isPressed () { return isPressed; },
    get isJustPressed () { return isJustPressed; },
    get isJustReleased () { return isJustReleased; },
    codes: codes,
    get code () { return code; },
    init: init$2,
    update: update$1,
    clearJustPressed: clearJustPressed
  });

  class Random {
      constructor(seed = null) {
          this.setSeed(seed);
      }
      get(lowOrHigh = 1, high) {
          if (high == null) {
              high = lowOrHigh;
              lowOrHigh = 0;
          }
          return (this.next() / 0xffffffff) * (high - lowOrHigh) + lowOrHigh;
      }
      getInt(lowOrHigh, high) {
          if (high == null) {
              high = lowOrHigh;
              lowOrHigh = 0;
          }
          if (high === lowOrHigh) {
              return lowOrHigh;
          }
          return (this.next() % (high - lowOrHigh)) + lowOrHigh;
      }
      getPlusOrMinus() {
          return this.getInt(2) * 2 - 1;
      }
      select(values) {
          return values[this.getInt(values.length)];
      }
      setSeed(w, x = 123456789, y = 362436069, z = 521288629, loopCount = 32) {
          this.w = w != null ? w >>> 0 : Math.floor(Math.random() * 0xffffffff) >>> 0;
          this.x = x >>> 0;
          this.y = y >>> 0;
          this.z = z >>> 0;
          for (let i = 0; i < loopCount; i++) {
              this.next();
          }
          return this;
      }
      next() {
          const t = this.x ^ (this.x << 11);
          this.x = this.y;
          this.y = this.z;
          this.z = this.w;
          this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
          return this.w;
      }
  }

  const pos = new Vector();
  let isPressed$1 = false;
  let isJustPressed$1 = false;
  let isJustReleased$1 = false;
  let defaultOptions$2 = {
      isDebugMode: false,
      anchor: new Vector(),
      padding: new Vector(),
      onPointerDownOrUp: undefined,
  };
  let screen;
  let pixelSize;
  let options$2;
  const debugRandom = new Random();
  const debugPos = new Vector();
  const debugMoveVel = new Vector();
  let debugIsDown = false;
  let cursorPos = new Vector(-9999, -9999);
  let isDown = false;
  let isClicked = false;
  let isReleased = false;
  function init$3(_screen, _pixelSize, _options) {
      options$2 = Object.assign(Object.assign({}, defaultOptions$2), _options);
      screen = _screen;
      pixelSize = new Vector(_pixelSize.x + options$2.padding.x * 2, _pixelSize.y + options$2.padding.y * 2);
      if (options$2.isDebugMode) {
          debugPos.set(pixelSize.x / 2, pixelSize.y / 2);
      }
      document.addEventListener("mousedown", (e) => {
          onDown(e.pageX, e.pageY);
      });
      document.addEventListener("touchstart", (e) => {
          onDown(e.touches[0].pageX, e.touches[0].pageY);
      });
      document.addEventListener("mousemove", (e) => {
          onMove(e.pageX, e.pageY);
      });
      document.addEventListener("touchmove", (e) => {
          e.preventDefault();
          onMove(e.touches[0].pageX, e.touches[0].pageY);
      }, { passive: false });
      document.addEventListener("mouseup", (e) => {
          onUp();
      });
      document.addEventListener("touchend", (e) => {
          e.preventDefault();
          e.target.click();
          onUp();
      }, { passive: false });
  }
  function update$2() {
      calcPointerPos(cursorPos.x, cursorPos.y, pos);
      if (options$2.isDebugMode && !pos.isInRect(0, 0, pixelSize.x, pixelSize.y)) {
          updateDebug();
          pos.set(debugPos);
          isJustPressed$1 = !isPressed$1 && debugIsDown;
          isJustReleased$1 = isPressed$1 && !debugIsDown;
          isPressed$1 = debugIsDown;
      }
      else {
          isJustPressed$1 = !isPressed$1 && isClicked;
          isJustReleased$1 = isPressed$1 && isReleased;
          isPressed$1 = isDown;
      }
      isClicked = isReleased = false;
  }
  function clearJustPressed$1() {
      isJustPressed$1 = false;
      isPressed$1 = true;
  }
  function calcPointerPos(x, y, v) {
      if (screen == null) {
          return;
      }
      v.x = Math.round(((x - screen.offsetLeft) / screen.clientWidth + options$2.anchor.x) *
          pixelSize.x -
          options$2.padding.x);
      v.y = Math.round(((y - screen.offsetTop) / screen.clientHeight + options$2.anchor.y) *
          pixelSize.y -
          options$2.padding.y);
  }
  function updateDebug() {
      if (debugMoveVel.length > 0) {
          debugPos.add(debugMoveVel);
          if (!isInRange(debugPos.x, -pixelSize.x * 0.1, pixelSize.x * 1.1) &&
              debugPos.x * debugMoveVel.x > 0) {
              debugMoveVel.x *= -1;
          }
          if (!isInRange(debugPos.y, -pixelSize.y * 0.1, pixelSize.y * 1.1) &&
              debugPos.y * debugMoveVel.y > 0) {
              debugMoveVel.y *= -1;
          }
          if (debugRandom.get() < 0.05) {
              debugMoveVel.set(0);
          }
      }
      else {
          if (debugRandom.get() < 0.1) {
              debugMoveVel.set(0);
              debugMoveVel.addWithAngle(debugRandom.get(Math.PI * 2), (pixelSize.x + pixelSize.y) * debugRandom.get(0.01, 0.03));
          }
      }
      if (debugRandom.get() < 0.05) {
          debugIsDown = !debugIsDown;
      }
  }
  function onDown(x, y) {
      cursorPos.set(x, y);
      isDown = isClicked = true;
      if (options$2.onPointerDownOrUp != null) {
          options$2.onPointerDownOrUp();
      }
  }
  function onMove(x, y) {
      cursorPos.set(x, y);
  }
  function onUp(e) {
      isDown = false;
      isReleased = true;
      if (options$2.onPointerDownOrUp != null) {
          options$2.onPointerDownOrUp();
      }
  }

  var pointer = /*#__PURE__*/Object.freeze({
    __proto__: null,
    pos: pos,
    get isPressed () { return isPressed$1; },
    get isJustPressed () { return isJustPressed$1; },
    get isJustReleased () { return isJustReleased$1; },
    init: init$3,
    update: update$2,
    clearJustPressed: clearJustPressed$1
  });

  let pos$1 = new Vector();
  let isPressed$2 = false;
  let isJustPressed$2 = false;
  let isJustReleased$2 = false;
  function init$4() {
      init$2({
          onKeyDown: sss.playEmpty,
      });
      init$3(canvas, size, {
          onPointerDownOrUp: sss.playEmpty,
          anchor: new Vector(0.5, 0.5),
      });
  }
  function update$3() {
      update$1();
      update$2();
      pos$1 = pos;
      isPressed$2 = isPressed || isPressed$1;
      isJustPressed$2 = isJustPressed || isJustPressed$1;
      isJustReleased$2 = isJustReleased || isJustReleased$1;
  }
  function clearJustPressed$2() {
      clearJustPressed();
      clearJustPressed$1();
  }
  function set(state) {
      pos$1.set(state.pos);
      isPressed$2 = state.isPressed;
      isJustPressed$2 = state.isJustPressed;
      isJustReleased$2 = state.isJustReleased;
  }

  var input = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get pos () { return pos$1; },
    get isPressed () { return isPressed$2; },
    get isJustPressed () { return isJustPressed$2; },
    get isJustReleased () { return isJustReleased$2; },
    init: init$4,
    update: update$3,
    clearJustPressed: clearJustPressed$2,
    set: set
  });

  let record;
  let inputIndex;
  function initRecord(randomSeed) {
      record = {
          randomSeed,
          inputs: [],
      };
  }
  function recordInput(input) {
      record.inputs.push(input);
  }
  function isRecorded() {
      return record != null;
  }
  function initReplay(random) {
      inputIndex = 0;
      random.setSeed(record.randomSeed);
  }
  function replayInput() {
      if (inputIndex >= record.inputs.length) {
          return;
      }
      set(record.inputs[inputIndex]);
      inputIndex++;
  }

  function rect(x, y, width, height) {
      return drawRect(false, x, y, width, height);
  }
  function box(x, y, width, height) {
      return drawRect(true, x, y, width, height);
  }
  function bar(x, y, length, thickness, rotate = 0.5, centerPosRatio = 0.5) {
      if (typeof x !== "number") {
          centerPosRatio = rotate;
          rotate = thickness;
          thickness = length;
          length = y;
          y = x.y;
          x = x.x;
      }
      const l = new Vector(length).rotate(rotate);
      const p = new Vector(x - l.x * centerPosRatio, y - l.y * centerPosRatio);
      return drawLine(p, l, thickness);
  }
  function line(x1, y1, x2 = 3, y2 = 3, thickness = 3) {
      const p = new Vector();
      const p2 = new Vector();
      if (typeof x1 === "number") {
          if (typeof y1 === "number") {
              if (typeof x2 === "number") {
                  p.set(x1, y1);
                  p2.set(x2, y2);
              }
              else {
                  p.set(x1, y1);
                  p2.set(x2);
                  thickness = y1;
              }
          }
          else {
              throw "invalid params";
          }
      }
      else {
          if (typeof y1 === "number") {
              if (typeof x2 === "number") {
                  p.set(x1);
                  p2.set(y1, x2);
                  thickness = y2;
              }
              else {
                  throw "invalid params";
              }
          }
          else {
              if (typeof x2 === "number") {
                  p.set(x1);
                  p2.set(y1);
                  thickness = x2;
              }
              else {
                  throw "invalid params";
              }
          }
      }
      return drawLine(p, p2.sub(p), thickness);
  }
  function drawRect(isAlignCenter, x, y, width, height) {
      if (typeof x === "number") {
          if (typeof y === "number") {
              if (typeof width === "number") {
                  if (height == null) {
                      return addRect(isAlignCenter, x, y, width, width);
                  }
                  else {
                      return addRect(isAlignCenter, x, y, width, height);
                  }
              }
              else {
                  return addRect(isAlignCenter, x, y, width.x, width.y);
              }
          }
          else {
              throw "invalid params";
          }
      }
      else {
          if (typeof y === "number") {
              if (width == null) {
                  return addRect(isAlignCenter, x.x, x.y, y, y);
              }
              else if (typeof width === "number") {
                  return addRect(isAlignCenter, x.x, x.y, y, width);
              }
              else {
                  throw "invalid params";
              }
          }
          else {
              return addRect(isAlignCenter, x.x, x.y, y.x, y.y);
          }
      }
  }
  function drawLine(p, l, thickness) {
      const t = Math.floor(clamp(thickness, 3, 10));
      const lx = Math.abs(l.x);
      const ly = Math.abs(l.y);
      const rn = clamp(Math.ceil(lx > ly ? lx / t : ly / t) + 1, 3, 99);
      l.div(rn - 1);
      let collision = { isColliding: { rect: {}, text: {}, char: {} } };
      for (let i = 0; i < rn; i++) {
          const c = addRect(true, p.x, p.y, thickness, thickness, true);
          collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(c.isColliding.rect)), { isColliding: {
                  rect: Object.assign(Object.assign({}, collision.isColliding.rect), c.isColliding.rect),
                  text: Object.assign(Object.assign({}, collision.isColliding.text), c.isColliding.text),
                  char: Object.assign(Object.assign({}, collision.isColliding.char), c.isColliding.char),
              } });
          p.add(l);
      }
      concatTmpHitBoxes();
      return collision;
  }
  function addRect(isAlignCenter, x, y, width, height, isAddingToTmp = false) {
      let pos = isAlignCenter
          ? { x: Math.floor(x - width / 2), y: Math.floor(y - height / 2) }
          : { x: Math.floor(x), y: Math.floor(y) };
      const size = { x: Math.floor(width), y: Math.floor(height) };
      if (size.x < 0) {
          pos.x += size.x;
          size.x *= -1;
      }
      if (size.y < 0) {
          pos.y += size.y;
          size.y *= -1;
      }
      const box = { pos, size, collision: { isColliding: { rect: {} } } };
      box.collision.isColliding.rect[currentColor] = true;
      const collision = checkHitBoxes(box);
      if (currentColor !== "transparent") {
          (isAddingToTmp ? tmpHitBoxes : hitBoxes).push(box);
          fillRect(pos.x, pos.y, size.x, size.y);
      }
      return collision;
  }

  const seedRandom = new Random();
  const random = new Random();
  let isUsingPixi = true; //false;

  const size = new Vector();
  let canvas;
  let canvasSize = new Vector();
  let graphics;
  const graphicsScale = 5;
  let background = document.createElement("img");
  let captureCanvas;
  let captureContext;
  let viewBackground = "black";
  let currentColor;
  let savedCurrentColor;
  let isFilling = false;
  function init$5(_size, _bodyBackground, _viewBackground, isCapturing) {
      size.set(_size);
      viewBackground = _viewBackground;
      const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
      const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
`;
      document.body.style.cssText = bodyCss;
      canvasSize.set(size);
      {
          canvasSize.mul(graphicsScale);
          const app = new PIXI.Application({
              width: canvasSize.x,
              height: canvasSize.y,
          });
          canvas = app.view;
          graphics = new PIXI.Graphics();
          graphics.scale.x = graphics.scale.y = graphicsScale;
          PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
          app.stage.addChild(graphics);
          graphics.lineStyle(0);
          canvas.style.cssText = canvasCss;
      }
      document.body.appendChild(canvas);
      const cs = 95;
      const cw = canvasSize.x >= canvasSize.y ? cs : (cs / canvasSize.y) * canvasSize.x;
      const ch = canvasSize.y >= canvasSize.x ? cs : (cs / canvasSize.x) * canvasSize.y;
      canvas.style.width = `${cw}vmin`;
      canvas.style.height = `${ch}vmin`;
      if (isCapturing) {
          captureCanvas = document.createElement("canvas");
          if (canvasSize.x <= canvasSize.y * 2) {
              captureCanvas.width = canvasSize.y * 2;
              captureCanvas.height = canvasSize.y;
          }
          else {
              captureCanvas.width = canvasSize.x;
              captureCanvas.height = canvasSize.x / 2;
          }
          captureContext = captureCanvas.getContext("2d");
          captureContext.fillStyle = _bodyBackground;
          gcc.setOptions({
              scale: Math.round(400 / captureCanvas.width),
              capturingFps: 60,
          });
      }
  }
  function clear$1() {
      {
          graphics.clear();
          isFilling = false;
          beginFillColor(colorToNumber(viewBackground,  1));
          graphics.drawRect(0, 0, size.x, size.y);
          endFill();
          isFilling = false;
          return;
      }
  }
  function setColor(colorName) {
      currentColor = colorName;
      {
          if (isFilling) {
              graphics.endFill();
          }
          beginFillColor(colorToNumber(currentColor));
          return;
      }
  }
  function beginFillColor(color) {
      endFill();
      graphics.beginFill(color);
      isFilling = true;
  }
  function endFill() {
      if (isFilling) {
          graphics.endFill();
          isFilling = false;
      }
  }
  function saveCurrentColor() {
      savedCurrentColor = currentColor;
  }
  function loadCurrentColor() {
      setColor(savedCurrentColor);
  }
  function fillRect(x, y, width, height) {
      {
          graphics.drawRect(x, y, width, height);
          return;
      }
  }
  function drawLetterImage(li, x, y, width, height) {
      {
          endFill();
          graphics.beginTextureFill({
              texture: li.texture,
              matrix: new PIXI.Matrix().translate(x, y),
          });
          graphics.drawRect(x, y, width == null ? letterSize : width, height == null ? letterSize : height);
          graphics.endFill();
          return;
      }
  }
  function capture() {
      captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      captureContext.drawImage(canvas, (captureCanvas.width - canvas.width) / 2, (captureCanvas.height - canvas.height) / 2);
      gcc.capture(captureCanvas);
  }

  let lastFrameTime = 0;
  let _init;
  let _update;
  const defaultOptions$3 = {
      viewSize: { x: 126, y: 126 },
      bodyBackground: "#111",
      viewBackground: "black",
      isUsingVirtualPad: true,
      isFourWaysStick: false,
      isCapturing: false,
  };
  let options$3;
  let textCacheEnableTicks = 10;
  function init$6(__init, __update, _options) {
      _init = __init;
      _update = __update;
      init();
      options$3 = Object.assign(Object.assign({}, defaultOptions$3), _options);
      init$5(options$3.viewSize, options$3.bodyBackground, options$3.viewBackground, options$3.isCapturing);
      init$4();
      init$1();
      _init();
      update$4();
  }
  function update$4() {
      requestAnimationFrame(update$4);
      const now = window.performance.now();
      const timeSinceLast = now - lastFrameTime;
      if (timeSinceLast < 1000 / 60 - 5) {
          return;
      }
      lastFrameTime = now;
      sss.update();
      update$3();
      _update();
      if (options$3.isCapturing) {
          capture();
      }
      textCacheEnableTicks--;
      if (textCacheEnableTicks === 0) {
          enableCache();
      }
  }

  const PI = Math.PI;
  const abs = Math.abs;
  const sin = Math.sin;
  const cos = Math.cos;
  const atan2 = Math.atan2;
  const sqrt = Math.sqrt;
  const pow = Math.pow;
  const floor = Math.floor;
  const round = Math.round;
  const ceil = Math.ceil;
  exports.ticks = 0;
  exports.score = 0;
  function rnd(lowOrHigh = 1, high) {
      return random$1.get(lowOrHigh, high);
  }
  function rndi(lowOrHigh = 2, high) {
      return random$1.getInt(lowOrHigh, high);
  }
  function rnds(lowOrHigh = 1, high) {
      return random$1.get(lowOrHigh, high) * random$1.getPlusOrMinus();
  }
  function end() {
      initGameOver();
  }
  function addScore(value, x, y) {
      if (isReplaying) {
          return;
      }
      exports.score += value;
      if (x == null) {
          return;
      }
      const str = `${value >= 1 ? "+" : ""}${Math.floor(value)}`;
      let pos = new Vector();
      if (typeof x === "number") {
          pos.set(x, y);
      }
      else {
          pos.set(x);
      }
      pos.x -= (str.length * letterSize) / 2;
      pos.y -= letterSize / 2;
      scoreBoards.push({
          str,
          pos,
          vy: -2,
          ticks: 30,
      });
  }
  function color(colorName) {
      setColor(colorName);
  }
  function vec(x, y) {
      return new Vector(x, y);
  }
  function play(type) {
      sss.play(soundEffectTypeToString[type]);
  }
  const soundEffectTypeToString = {
      coin: "c",
      laser: "l",
      explosion: "e",
      powerUp: "p",
      hit: "h",
      jump: "j",
      select: "s",
      lucky: "u",
  };
  const defaultOptions$4 = {
      isPlayingBgm: false,
      isCapturing: false,
      isShowingScore: true,
      isReplayEnabled: false,
      isMinifying: false,
      viewSize: { x: 100, y: 100 },
      seed: 0,
      theme: "simple",
  };
  const seedRandom$1 = new Random();
  const random$1 = new Random();
  let state;
  let updateFunc = {
      title: updateTitle,
      inGame: updateInGame,
      gameOver: updateGameOver,
  };
  let terminal;
  let hiScore = 0;
  let isNoTitle = true;
  let seed = 0;
  let loopOptions;
  let isPlayingBgm;
  let isShowingScore;
  let isReplayEnabled;
  let terminalSize;
  let scoreBoards;
  let isReplaying = false;
  let gameScriptFile;
  let isUsingPixi$1 = true; //false;
  let isDarkTheme = false;
  function onLoad() {
      loopOptions = {
          viewSize: { x: 100, y: 100 },
          bodyBackground: "#e0e0e0",
          viewBackground: "white",
      };
      let opts;
      if (typeof options !== "undefined" && options != null) {
          opts = Object.assign(Object.assign({}, defaultOptions$4), options);
      }
      else {
          opts = defaultOptions$4;
      }
      seed = opts.seed;
      loopOptions.isCapturing = opts.isCapturing;
      loopOptions.viewSize = opts.viewSize;
      isPlayingBgm = opts.isPlayingBgm;
      isShowingScore = opts.isShowingScore;
      isReplayEnabled = opts.isReplayEnabled;
      if (opts.isMinifying) {
          showMinifiedScript();
      }
      init$6(init$7, _update$1, loopOptions);
  }
  function init$7() {
      if (typeof description !== "undefined" &&
          description != null &&
          description.trim().length > 0) {
          isNoTitle = false;
          seed += getHash(description);
      }
      if (typeof title !== "undefined" &&
          title != null &&
          title.trim().length > 0) {
          isNoTitle = false;
          document.title = title;
          seed += getHash(title);
      }
      if (typeof characters !== "undefined" && characters != null) {
          defineCharacters(characters, "a");
      }
      sss.init(seed);
      const sz = loopOptions.viewSize;
      terminalSize = { x: Math.floor(sz.x / 6), y: Math.floor(sz.y / 6) };
      terminal = new Terminal(terminalSize);
      setColor("black");
      if (isNoTitle) {
          initInGame();
          exports.ticks = 0;
      }
      else {
          initTitle();
      }
  }
  function _update$1() {
      exports.df = exports.difficulty = exports.ticks / 3600 + 1;
      exports.tc = exports.ticks;
      const prevScore = exports.score;
      exports.sc = exports.score;
      const prevSc = exports.sc;
      exports.inp = {
          p: pos$1,
          ip: isPressed$2,
          ijp: isJustPressed$2,
          ijr: isJustReleased$2,
      };
      clear();
      updateFunc[state]();
      {
          endFill();
      }
      exports.ticks++;
      if (isReplaying) {
          exports.score = prevScore;
      }
      else if (exports.sc !== prevSc) {
          exports.score = exports.sc;
      }
  }
  function initInGame() {
      state = "inGame";
      exports.ticks = -1;
      const s = Math.floor(exports.score);
      if (s > hiScore) {
          hiScore = s;
      }
      exports.score = 0;
      scoreBoards = [];
      if (isPlayingBgm) {
          sss.playBgm();
      }
      const randomSeed = seedRandom$1.getInt(999999999);
      random$1.setSeed(randomSeed);
      if (isReplayEnabled) {
          initRecord(randomSeed);
          isReplaying = false;
      }
  }
  function updateInGame() {
      terminal.clear();
      clear$1();
      updateScoreBoards();
      if (isReplayEnabled) {
          recordInput({
              pos: vec(pos$1),
              isPressed: isPressed$2,
              isJustPressed: isJustPressed$2,
              isJustReleased: isJustReleased$2,
          });
      }
      update();
      drawScore();
      terminal.draw();
  }
  function initTitle() {
      state = "title";
      exports.ticks = -1;
      terminal.clear();
      clear$1();
      if (isRecorded()) {
          initReplay(random$1);
          isReplaying = true;
      }
  }
  function updateTitle() {
      if (isJustPressed$2) {
          initInGame();
          return;
      }
      clear$1();
      if (isRecorded()) {
          replayInput();
          exports.inp = {
              p: pos$1,
              ip: isPressed$2,
              ijp: isJustPressed$2,
              ijr: isJustReleased$2,
          };
          update();
      }
      if (exports.ticks === 0) {
          drawScore();
          if (typeof title !== "undefined" && title != null) {
              terminal.print(title, Math.floor(terminalSize.x - title.length) / 2, Math.ceil(terminalSize.y * 0.2));
          }
      }
      if (exports.ticks === 30 || exports.ticks == 40) {
          if (typeof description !== "undefined" && description != null) {
              let maxLineLength = 0;
              description.split("\n").forEach((l) => {
                  if (l.length > maxLineLength) {
                      maxLineLength = l.length;
                  }
              });
              const x = Math.floor((terminalSize.x - maxLineLength) / 2);
              description.split("\n").forEach((l, i) => {
                  terminal.print(l, x, Math.floor(terminalSize.y / 2) + i);
              });
          }
      }
      terminal.draw();
  }
  function initGameOver() {
      state = "gameOver";
      if (!isReplaying) {
          clearJustPressed$2();
      }
      exports.ticks = -1;
      drawGameOver();
      if (isPlayingBgm) {
          sss.stopBgm();
      }
  }
  function updateGameOver() {
      if ((isReplaying || exports.ticks > 20) && isJustPressed$2) {
          initInGame();
      }
      else if (exports.ticks === 120 && !isNoTitle) {
          initTitle();
      }
  }
  function drawGameOver() {
      if (isReplaying) {
          return;
      }
      terminal.print("GAME OVER", Math.floor((terminalSize.x - 9) / 2), Math.floor(terminalSize.y / 2));
      terminal.draw();
  }
  function drawScore() {
      if (!isShowingScore) {
          return;
      }
      terminal.print(`${Math.floor(exports.score)}`, 0, 0);
      const hs = `HI ${hiScore}`;
      terminal.print(hs, terminalSize.x - hs.length, 0);
  }
  function updateScoreBoards() {
      saveCurrentColor();
      setColor("black");
      scoreBoards = scoreBoards.filter((sb) => {
          print(sb.str, sb.pos.x, sb.pos.y);
          sb.pos.y += sb.vy;
          sb.vy *= 0.9;
          sb.ticks--;
          return sb.ticks > 0;
      });
      loadCurrentColor();
  }
  function getHash(v) {
      let hash = 0;
      for (let i = 0; i < v.length; i++) {
          const chr = v.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0;
      }
      return hash;
  }
  function addGameScript() {
      let gameName = window.location.search.substring(1);
      gameName = gameName.replace(/\W/g, "");
      if (gameName.length === 0) {
          return;
      }
      const script = document.createElement("script");
      gameScriptFile = `${gameName}/main.js`;
      script.setAttribute("src", gameScriptFile);
      document.head.appendChild(script);
  }
  function showMinifiedScript() {
      fetch(gameScriptFile)
          .then((res) => res.text())
          .then((t) => {
          const minifiedScript = Terser.minify(t + "update();", {
              toplevel: true,
          }).code;
          const functionStartString = "function(){";
          const fi = minifiedScript.indexOf(functionStartString);
          const optionsString = "options={";
          const oi = minifiedScript.indexOf(optionsString);
          let minifiedUpdateScript = minifiedScript;
          if (fi >= 0) {
              minifiedUpdateScript = minifiedScript.substring(minifiedScript.indexOf(functionStartString) +
                  functionStartString.length, minifiedScript.length - 4);
          }
          else if (oi >= 0) {
              let bc = 1;
              let ui;
              for (let i = oi + optionsString.length; i < minifiedScript.length; i++) {
                  const c = minifiedScript.charAt(i);
                  if (c === "{") {
                      bc++;
                  }
                  else if (c === "}") {
                      bc--;
                      if (bc === 0) {
                          ui = i + 2;
                          break;
                      }
                  }
              }
              if (bc === 0) {
                  minifiedUpdateScript = minifiedScript.substring(ui);
              }
          }
          minifyReplaces.forEach(([o, r]) => {
              minifiedUpdateScript = minifiedUpdateScript.split(o).join(r);
          });
          console.log(minifiedUpdateScript);
          console.log(`${minifiedUpdateScript.length} letters`);
      });
  }
  let clr = color;
  let ply = play;
  let tms = times;
  const tr = "transparent";
  const wh = "white";
  const rd = "red";
  const gr = "green";
  const yl = "yellow";
  const bl = "blue";
  const pr = "purple";
  const cy = "cyan";
  const lc = "black";
  const cn = "coin";
  const ls = "laser";
  const ex = "explosion";
  const pw = "powerUp";
  const ht = "hit";
  const jm = "jump";
  const sl = "select";
  const uc = "lucky";
  let minifyReplaces = [
      ["===", "=="],
      ["!==", "!="],
      ["input.pos", "inp.p"],
      ["input.isPressed", "inp.ip"],
      ["input.isJustPressed", "inp.ijp"],
      ["input.isJustReleased", "inp.ijr"],
      ["color(", "clr("],
      ["play(", "ply("],
      ["times(", "tms("],
      ["ticks", "tc"],
      ["difficulty", "df"],
      ["score", "sc"],
      [".isColliding.rect.transparent", ".tr"],
      [".isColliding.rect.white", ".wh"],
      [".isColliding.rect.red", ".rd"],
      [".isColliding.rect.green", ".gr"],
      [".isColliding.rect.yellow", ".yl"],
      [".isColliding.rect.blue", ".bl"],
      [".isColliding.rect.purple", ".pr"],
      [".isColliding.rect.cyan", ".cy"],
      [".isColliding.rect.black", ".lc"],
      ['"transparent"', "tr"],
      ['"white"', "wh"],
      ['"red"', "rd"],
      ['"green"', "gr"],
      ['"yellow"', "yl"],
      ['"blue"', "bl"],
      ['"purple"', "pr"],
      ['"cyan"', "cy"],
      ['"black"', "lc"],
      ['"coin"', "cn"],
      ['"laser"', "ls"],
      ['"explosion"', "ex"],
      ['"powerUp"', "pw"],
      ['"hit"', "ht"],
      ['"jump"', "jm"],
      ['"select"', "sl"],
      ['"lucky"', "uc"],
  ];

  exports.PI = PI;
  exports.abs = abs;
  exports.addGameScript = addGameScript;
  exports.addScore = addScore;
  exports.addWithCharCode = addWithCharCode;
  exports.atan2 = atan2;
  exports.bar = bar;
  exports.bl = bl;
  exports.box = box;
  exports.ceil = ceil;
  exports.char = char;
  exports.clamp = clamp;
  exports.clr = clr;
  exports.cn = cn;
  exports.color = color;
  exports.cos = cos;
  exports.cy = cy;
  exports.end = end;
  exports.ex = ex;
  exports.floor = floor;
  exports.gr = gr;
  exports.ht = ht;
  exports.input = input;
  exports.isDarkTheme = isDarkTheme;
  exports.isUsingPixi = isUsingPixi$1;
  exports.jm = jm;
  exports.keyboard = keyboard;
  exports.lc = lc;
  exports.line = line;
  exports.ls = ls;
  exports.minifyReplaces = minifyReplaces;
  exports.onLoad = onLoad;
  exports.play = play;
  exports.ply = ply;
  exports.pointer = pointer;
  exports.pow = pow;
  exports.pr = pr;
  exports.pw = pw;
  exports.range = range;
  exports.rd = rd;
  exports.rect = rect;
  exports.rnd = rnd;
  exports.rndi = rndi;
  exports.rnds = rnds;
  exports.round = round;
  exports.sin = sin;
  exports.sl = sl;
  exports.sqrt = sqrt;
  exports.text = text;
  exports.times = times;
  exports.tms = tms;
  exports.tr = tr;
  exports.uc = uc;
  exports.vec = vec;
  exports.wh = wh;
  exports.wrap = wrap;
  exports.yl = yl;

}(this.window = this.window || {}, PIXI));
