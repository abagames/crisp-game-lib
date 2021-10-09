(function (exports, PIXI) {
  'use strict';

  function clamp$1(v, low = 0, high = 1) {
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
  function times(count, func) {
      return range(count).map((i) => func(i));
  }
  function remove(array, func) {
      let removed = [];
      for (let i = 0, index = 0; i < array.length; index++) {
          if (func(array[i], index)) {
              removed.push(array[i]);
              array.splice(i, 1);
          }
          else {
              i++;
          }
      }
      return removed;
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
          this.x = clamp$1(this.x, xLow, xHigh);
          this.y = clamp$1(this.y, yLow, yHigh);
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
              return Math.atan2(y - this.y, x - this.x);
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
  function init(isDarkColor) {
      const [wr, wb, wg] = getRgb(0, isDarkColor);
      values = fromEntities(colors.map((c, i) => {
          if (i < 1) {
              return [c, { r: 0, g: 0, b: 0, a: 0 }];
          }
          if (i < 9) {
              const [r, g, b] = getRgb(i - 1, isDarkColor);
              return [c, { r, g, b, a: 1 }];
          }
          const [r, g, b] = getRgb(i - 9 + 1, isDarkColor);
          return [
              c,
              {
                  r: Math.floor(isDarkColor ? r * 0.5 : wr - (wr - r) * 0.5),
                  g: Math.floor(isDarkColor ? g * 0.5 : wg - (wg - g) * 0.5),
                  b: Math.floor(isDarkColor ? b * 0.5 : wb - (wb - b) * 0.5),
                  a: 1,
              },
          ];
      }));
      if (isDarkColor) {
          const b = values["blue"];
          values["white"] = {
              r: Math.floor(b.r * 0.15),
              g: Math.floor(b.g * 0.15),
              b: Math.floor(b.b * 0.15),
              a: 1,
          };
      }
  }
  function getRgb(i, isDarkColor) {
      if (isDarkColor) {
          if (i === 0) {
              i = 7;
          }
          else if (i === 7) {
              i = 0;
          }
      }
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

  function text$1(str, x, y, options) {
      return letters(false, str, x, y, options);
  }
  function char(str, x, y, options) {
      return letters(true, str, x, y, options);
  }
  function letters(isCharacter, str, x, y, options) {
      if (typeof x === "number") {
          if (typeof y === "number") {
              return print(str, x, y, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, options));
          }
          else {
              throw "invalid params";
          }
      }
      else {
          return print(str, x.x, x.y, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, y));
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
      x -= (letterSize / 2) * options.scale.x;
      y -= (letterSize / 2) * options.scale.y;
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
      if (cca <= 0x20) {
          return { isColliding: { rect: {}, text: {}, char: {} } };
      }
      const cc = cca - 0x21;
      const li = options.isCharacter ? characterImages[cc] : textImages[cc];
      const rotation = wrap(options.rotation, 0, 4);
      if (options.color === "black" &&
          rotation === 0 &&
          options.mirror.x === 1 &&
          options.mirror.y === 1) {
          return drawAndTestLetterImage(li, x, y, options.scale, options.isCheckingCollision, true);
      }
      const cacheIndex = JSON.stringify({ c, options });
      const ci = cachedImages[cacheIndex];
      if (ci != null) {
          return drawAndTestLetterImage(ci, x, y, options.scale, options.isCheckingCollision, options.color !== "transparent");
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
          letterContext.fillStyle = colorToStyle(options.color === "transparent" ? "black" : options.color);
          letterContext.fillRect(0, 0, letterSize, letterSize);
          letterContext.globalCompositeOperation = "source-over";
      }
      const hitBox = getHitBox(c, options.isCharacter);
      let texture;
      if (isCacheEnabled || theme.isUsingPixi) {
          const cachedImage = document.createElement("img");
          cachedImage.src = letterCanvas.toDataURL();
          if (theme.isUsingPixi) {
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
      return drawAndTestLetterImage({ image: letterCanvas, texture, hitBox }, x, y, options.scale, options.isCheckingCollision, options.color !== "transparent");
  }
  function drawAndTestLetterImage(li, x, y, scale, isCheckCollision, isDrawing) {
      if (isDrawing) {
          if (scale.x === 1 && scale.y === 1) {
              drawLetterImage(li, x, y);
          }
          else {
              drawLetterImage(li, x, y, letterSize * scale.x, letterSize * scale.y);
          }
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
      if (isDrawing) {
          hitBoxes.push(hitBox);
      }
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
      if (theme.isUsingPixi) {
          return { image, texture: PIXI.Texture.from(image) };
      }
      return { image };
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
              }
              i += 4;
          }
      }
      i = 0;
      for (let y = 0; y < letterSize; y++) {
          for (let x = 0; x < letterSize; x++) {
              if (d[i + 3] > 0) {
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

  const gridFilterFragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float width;
uniform float height;

float gridValue(vec2 uv, float res) {
  vec2 grid = fract(uv * res);
  return (step(res, grid.x) * step(res, grid.y));
}

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);  
  vec2 grid_uv = vTextureCoord.xy * vec2(width, height);
  float v = gridValue(grid_uv, 0.2);
  gl_FragColor.rgba = color * v;
}
`;
  function getGridFilter(width, height) {
      return new PIXI.Filter(undefined, gridFilterFragment, {
          width,
          height,
      });
  }

  const size = new Vector();
  let canvas;
  let canvasSize = new Vector();
  let context;
  let graphics;
  const graphicsScale = 5;
  let background = document.createElement("img");
  let captureCanvas;
  let captureContext;
  let calculatedCanvasScale = 1;
  let viewBackground = "black";
  let currentColor;
  let savedCurrentColor;
  let isFilling = false;
  let theme;
  let crtFilter;
  function init$2(_size, _bodyBackground, _viewBackground, isCapturing, isCapturingGameCanvasOnly, captureCanvasScale, _theme) {
      size.set(_size);
      theme = _theme;
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
      const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
      document.body.style.cssText = bodyCss;
      canvasSize.set(size);
      if (theme.isUsingPixi) {
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
          graphics.filters = [];
          if (theme.name === "crt") {
              graphics.filters.push((crtFilter = new PIXI.filters.CRTFilter({
                  vignettingAlpha: 0.7,
              })));
          }
          if (theme.name === "pixel") {
              graphics.filters.push(getGridFilter(canvasSize.x, canvasSize.y));
          }
          if (theme.name === "pixel" || theme.name === "shapeDark") {
              const bloomFilter = new PIXI.filters.AdvancedBloomFilter({
                  threshold: 0.1,
                  bloomScale: theme.name === "pixel" ? 1.5 : 1,
                  brightness: theme.name === "pixel" ? 1.5 : 1,
                  blur: 8,
              });
              graphics.filters.push(bloomFilter);
          }
          graphics.lineStyle(0);
          canvas.style.cssText = canvasCss;
      }
      else {
          canvas = document.createElement("canvas");
          canvas.width = canvasSize.x;
          canvas.height = canvasSize.y;
          context = canvas.getContext("2d");
          context.imageSmoothingEnabled = false;
          canvas.style.cssText = canvasCss + crispCss;
      }
      document.body.appendChild(canvas);
      const setSize = () => {
          const cs = 0.95;
          const wr = innerWidth / innerHeight;
          const cr = canvasSize.x / canvasSize.y;
          const flgWh = wr < cr;
          const cw = flgWh ? cs * innerWidth : cs * innerHeight * cr;
          const ch = !flgWh ? cs * innerHeight : (cs * innerWidth) / cr;
          canvas.style.width = `${cw}px`;
          canvas.style.height = `${ch}px`;
      };
      window.addEventListener("resize", setSize);
      setSize();
      if (isCapturing) {
          captureCanvas = document.createElement("canvas");
          let optionCaptureScale;
          if (isCapturingGameCanvasOnly) {
              captureCanvas.width = canvasSize.x;
              captureCanvas.height = canvasSize.y;
              optionCaptureScale = captureCanvasScale;
          }
          else {
              if (canvasSize.x <= canvasSize.y * 2) {
                  captureCanvas.width = canvasSize.y * 2;
                  captureCanvas.height = canvasSize.y;
              }
              else {
                  captureCanvas.width = canvasSize.x;
                  captureCanvas.height = canvasSize.x / 2;
              }
              if (captureCanvas.width > 400) {
                  calculatedCanvasScale = 400 / captureCanvas.width;
                  captureCanvas.width = 400;
                  captureCanvas.height *= calculatedCanvasScale;
              }
              optionCaptureScale = Math.round(400 / captureCanvas.width);
          }
          captureContext = captureCanvas.getContext("2d");
          captureContext.fillStyle = _bodyBackground;
          gcc.setOptions({
              scale: optionCaptureScale,
              capturingFps: 60,
              isSmoothingEnabled: false,
          });
      }
  }
  function clear$1() {
      if (theme.isUsingPixi) {
          graphics.clear();
          isFilling = false;
          beginFillColor(colorToNumber(viewBackground, theme.isDarkColor ? 0.15 : 1));
          graphics.drawRect(0, 0, size.x, size.y);
          endFill();
          isFilling = false;
          return;
      }
      context.fillStyle = colorToStyle(viewBackground, theme.isDarkColor ? 0.15 : 1);
      context.fillRect(0, 0, size.x, size.y);
      context.fillStyle = colorToStyle(currentColor);
  }
  function setColor(colorName) {
      if (colorName === currentColor) {
          if (theme.isUsingPixi && !isFilling) {
              beginFillColor(colorToNumber(currentColor));
          }
          return;
      }
      currentColor = colorName;
      if (theme.isUsingPixi) {
          if (isFilling) {
              graphics.endFill();
          }
          beginFillColor(colorToNumber(currentColor));
          return;
      }
      context.fillStyle = colorToStyle(colorName);
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
      if (theme.isUsingPixi) {
          if (theme.name === "shape" || theme.name === "shapeDark") {
              graphics.drawRoundedRect(x, y, width, height, 2);
          }
          else {
              graphics.drawRect(x, y, width, height);
          }
          return;
      }
      context.fillRect(x, y, width, height);
  }
  function drawLine(x1, y1, x2, y2, thickness) {
      const cn = colorToNumber(currentColor);
      beginFillColor(cn);
      graphics.drawCircle(x1, y1, thickness * 0.5);
      graphics.drawCircle(x2, y2, thickness * 0.5);
      endFill();
      graphics.lineStyle(thickness, cn);
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
      graphics.lineStyle(0);
  }
  function drawLetterImage(li, x, y, width, height) {
      if (theme.isUsingPixi) {
          endFill();
          graphics.beginTextureFill({
              texture: li.texture,
              matrix: new PIXI.Matrix().translate(x, y),
          });
          graphics.drawRect(x, y, width == null ? letterSize : width, height == null ? letterSize : height);
          beginFillColor(colorToNumber(currentColor));
          return;
      }
      if (width == null) {
          context.drawImage(li.image, x, y);
      }
      else {
          context.drawImage(li.image, x, y, width, height);
      }
  }
  function updateCrtFilter() {
      crtFilter.time += 0.2;
  }
  function capture() {
      captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      if (calculatedCanvasScale === 1) {
          captureContext.drawImage(canvas, (captureCanvas.width - canvas.width) / 2, (captureCanvas.height - canvas.height) / 2);
      }
      else {
          const w = canvas.width * calculatedCanvasScale;
          const h = canvas.height * calculatedCanvasScale;
          captureContext.drawImage(canvas, (captureCanvas.width - w) / 2, (captureCanvas.height - h) / 2, w, h);
      }
      gcc.capture(captureCanvas);
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
  function init$3(_options) {
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
    init: init$3,
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
          const lowOrHighInt = Math.floor(lowOrHigh);
          const highInt = Math.floor(high);
          if (highInt === lowOrHighInt) {
              return lowOrHighInt;
          }
          return (this.next() % (highInt - lowOrHighInt)) + lowOrHighInt;
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
      getState() {
          return { x: this.x, y: this.y, z: this.z, w: this.w };
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
  let cursorPos = new Vector();
  let isDown = false;
  let isClicked = false;
  let isReleased = false;
  function init$4(_screen, _pixelSize, _options) {
      options$2 = Object.assign(Object.assign({}, defaultOptions$2), _options);
      screen = _screen;
      pixelSize = new Vector(_pixelSize.x + options$2.padding.x * 2, _pixelSize.y + options$2.padding.y * 2);
      cursorPos.set(screen.offsetLeft + screen.clientWidth * (0.5 - options$2.anchor.x), screen.offsetTop + screen.clientWidth * (0.5 - options$2.anchor.y));
      if (options$2.isDebugMode) {
          debugPos.set(screen.offsetLeft + screen.clientWidth * (0.5 - options$2.anchor.x), screen.offsetTop + screen.clientWidth * (0.5 - options$2.anchor.y));
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
    init: init$4,
    update: update$2,
    clearJustPressed: clearJustPressed$1
  });

  let pos$1 = new Vector();
  let isPressed$2 = false;
  let isJustPressed$2 = false;
  let isJustReleased$2 = false;
  function init$5() {
      init$3({
          onKeyDown: sss.playEmpty,
      });
      init$4(canvas, size, {
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

  var input$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get pos () { return pos$1; },
    get isPressed () { return isPressed$2; },
    get isJustPressed () { return isJustPressed$2; },
    get isJustReleased () { return isJustReleased$2; },
    init: init$5,
    update: update$3,
    clearJustPressed: clearJustPressed$2,
    set: set
  });

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
      isCapturingGameCanvasOnly: false,
      captureCanvasScale: 1,
      theme: { name: "simple", isUsingPixi: false, isDarkColor: false },
  };
  let options$3;
  let textCacheEnableTicks = 10;
  function init$6(__init, __update, _options) {
      _init = __init;
      _update = __update;
      options$3 = Object.assign(Object.assign({}, defaultOptions$3), _options);
      init(options$3.theme.isDarkColor);
      init$2(options$3.viewSize, options$3.bodyBackground, options$3.viewBackground, options$3.isCapturing, options$3.isCapturingGameCanvasOnly, options$3.captureCanvasScale, options$3.theme);
      init$5();
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

  let particles;
  const random = new Random();
  function init$7() {
      particles = [];
  }
  function add(pos, count = 16, speed = 1, angle = 0, angleWidth = Math.PI * 2) {
      if (count < 1) {
          if (random.get() > count) {
              return;
          }
          count = 1;
      }
      for (let i = 0; i < count; i++) {
          const a = angle + random.get(angleWidth) - angleWidth / 2;
          const p = {
              pos: new Vector(pos),
              vel: new Vector(speed * random.get(0.5, 1), 0).rotate(a),
              color: currentColor,
              ticks: clamp(random.get(10, 20) * Math.sqrt(Math.abs(speed)), 10, 60),
          };
          particles.push(p);
      }
  }
  function update$5() {
      saveCurrentColor();
      particles = particles.filter((p) => {
          p.ticks--;
          if (p.ticks < 0) {
              return false;
          }
          p.pos.add(p.vel);
          p.vel.mul(0.98);
          setColor(p.color);
          fillRect(Math.floor(p.pos.x), Math.floor(p.pos.y), 1, 1);
          return true;
      });
      loadCurrentColor();
  }

  function get({ pos, size, text, isToggle = false, onClick = () => { }, }) {
      return {
          pos,
          size,
          text,
          isToggle,
          onClick,
          isPressed: false,
          isSelected: false,
          isHovered: false,
          toggleGroup: [],
      };
  }
  function update$6(button) {
      const o = vec(input.pos).sub(button.pos);
      button.isHovered = o.isInRect(0, 0, button.size.x, button.size.y);
      if (input.isJustPressed && button.isHovered) {
          button.isPressed = true;
      }
      if (button.isPressed && !button.isHovered) {
          button.isPressed = false;
      }
      if (button.isPressed && input.isJustReleased) {
          button.onClick();
          button.isPressed = false;
          if (button.isToggle) {
              if (button.toggleGroup.length === 0) {
                  button.isSelected = !button.isSelected;
              }
              else {
                  button.toggleGroup.forEach((b) => {
                      b.isSelected = false;
                  });
                  button.isSelected = true;
              }
          }
      }
      draw(button);
  }
  function draw(button) {
      color(button.isPressed ? "blue" : "light_blue");
      rect(button.pos.x, button.pos.y, button.size.x, button.size.y);
      if (button.isToggle && !button.isSelected) {
          color("white");
          rect(button.pos.x + 1, button.pos.y + 1, button.size.x - 2, button.size.y - 2);
      }
      color(button.isHovered ? "black" : "blue");
      text(button.text, button.pos.x + 3, button.pos.y + 3);
  }

  let record;
  let inputIndex;
  let frameStates;
  let storedInput;
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
  function initFrameStates() {
      frameStates = [];
  }
  function recordFrameState(state, baseState, random) {
      frameStates.push({
          randomState: random.getState(),
          gameState: cloneDeep(state),
          baseState: cloneDeep(baseState),
      });
  }
  function rewind(random) {
      const fs = frameStates.pop();
      const rs = fs.randomState;
      random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
      storedInput = {
          pos: vec(pos$1),
          isPressed: isPressed$2,
          isJustPressed: isJustPressed$2,
          isJustReleased: isJustReleased$2,
      };
      set(record.inputs.pop());
      return fs;
  }
  function getLastFrameState(random) {
      const fs = frameStates[frameStates.length - 1];
      const rs = fs.randomState;
      random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
      storedInput = {
          pos: vec(pos$1),
          isPressed: isPressed$2,
          isJustPressed: isJustPressed$2,
          isJustReleased: isJustReleased$2,
      };
      set(record.inputs[record.inputs.length - 1]);
      return fs;
  }
  function restoreInput() {
      set(storedInput);
  }
  function isFrameStateEmpty() {
      return frameStates.length === 0;
  }
  function getFrameStateForReplay() {
      const i = inputIndex - 1;
      if (i >= record.inputs.length) {
          return;
      }
      return frameStates[i];
  }

  function rect$1(x, y, width, height) {
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
      return drawLine$1(p, l, thickness);
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
                  thickness = y2;
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
      return drawLine$1(p, p2.sub(p), thickness);
  }
  function arc(centerX, centerY, radius, thickness, angleFrom, angleTo) {
      let centerPos = new Vector();
      if (typeof centerX === "number") {
          centerPos.set(centerX, centerY);
      }
      else {
          centerPos.set(centerX);
          angleTo = angleFrom;
          angleFrom = thickness;
          thickness = radius;
          radius = centerY;
      }
      if (thickness == null) {
          thickness = 3;
      }
      if (angleFrom == null) {
          angleFrom = 0;
      }
      if (angleTo == null) {
          angleTo = Math.PI * 2;
      }
      let af;
      let ao;
      if (angleFrom > angleTo) {
          af = angleTo;
          ao = angleFrom - angleTo;
      }
      else {
          af = angleFrom;
          ao = angleTo - angleFrom;
      }
      ao = clamp$1(ao, 0, Math.PI * 2);
      if (ao < 0.01) {
          return;
      }
      const lc = clamp$1(ceil(ao * Math.sqrt(radius * 0.25)), 1, 36);
      const ai = ao / lc;
      let a = af;
      let p1 = new Vector(radius).rotate(a).add(centerPos);
      let p2 = new Vector();
      let o = new Vector();
      let collision = { isColliding: { rect: {}, text: {}, char: {} } };
      for (let i = 0; i < lc; i++) {
          a += ai;
          p2.set(radius).rotate(a).add(centerPos);
          o.set(p2).sub(p1);
          const c = drawLine$1(p1, o, thickness, true);
          collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(c.isColliding.rect)), { isColliding: {
                  rect: Object.assign(Object.assign({}, collision.isColliding.rect), c.isColliding.rect),
                  text: Object.assign(Object.assign({}, collision.isColliding.text), c.isColliding.text),
                  char: Object.assign(Object.assign({}, collision.isColliding.char), c.isColliding.char),
              } });
          p1.set(p2);
      }
      concatTmpHitBoxes();
      return collision;
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
  function drawLine$1(p, l, thickness, isAddingToTmp = false) {
      let isDrawing = true;
      if (theme.name === "shape" || theme.name === "shapeDark") {
          if (currentColor !== "transparent") {
              drawLine(p.x, p.y, p.x + l.x, p.y + l.y, thickness);
          }
          isDrawing = false;
      }
      const t = Math.floor(clamp$1(thickness, 3, 10));
      const lx = Math.abs(l.x);
      const ly = Math.abs(l.y);
      const rn = clamp$1(Math.ceil(lx > ly ? lx / t : ly / t) + 1, 3, 99);
      l.div(rn - 1);
      let collision = { isColliding: { rect: {}, text: {}, char: {} } };
      for (let i = 0; i < rn; i++) {
          const c = addRect(true, p.x, p.y, thickness, thickness, true, isDrawing);
          collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(c.isColliding.rect)), { isColliding: {
                  rect: Object.assign(Object.assign({}, collision.isColliding.rect), c.isColliding.rect),
                  text: Object.assign(Object.assign({}, collision.isColliding.text), c.isColliding.text),
                  char: Object.assign(Object.assign({}, collision.isColliding.char), c.isColliding.char),
              } });
          p.add(l);
      }
      if (!isAddingToTmp) {
          concatTmpHitBoxes();
      }
      return collision;
  }
  function addRect(isAlignCenter, x, y, width, height, isAddingToTmp = false, isDrawing = true) {
      let pos = isAlignCenter
          ? { x: Math.floor(x - width / 2), y: Math.floor(y - height / 2) }
          : { x: Math.floor(x), y: Math.floor(y) };
      const size = { x: Math.trunc(width), y: Math.trunc(height) };
      if (size.x === 0 || size.y === 0) {
          return {
              isColliding: { rect: {}, text: {}, char: {} },
          };
      }
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
          if (isDrawing) {
              fillRect(pos.x, pos.y, size.x, size.y);
          }
      }
      return collision;
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
  const ceil$1 = Math.ceil;
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
  function end(_gameOverText = "GAME OVER") {
      gameOverText = _gameOverText;
      if (isShowingTime) {
          exports.time = undefined;
      }
      initGameOver();
  }
  function complete(completeText = "COMPLETE") {
      gameOverText = completeText;
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
  function color$1(colorName) {
      setColor(colorName);
  }
  function particle(x, y, count, speed, angle, angleWidth) {
      let pos = new Vector();
      if (typeof x === "number") {
          pos.set(x, y);
          add(pos, count, speed, angle, angleWidth);
      }
      else {
          pos.set(x);
          add(pos, y, count, speed, angle);
      }
  }
  function vec$1(x, y) {
      return new Vector(x, y);
  }
  function play(type) {
      if (!isWaitingRewind && !isRewinding) {
          sss.play(soundEffectTypeToString[type]);
      }
  }
  function frameState(frameState) {
      if (isWaitingRewind) {
          const rs = getLastFrameState(random$1);
          const bs = rs.baseState;
          exports.score = bs.score;
          exports.ticks = bs.ticks;
          return cloneDeep(rs.gameState);
      }
      else if (isRewinding) {
          const rs = rewind(random$1);
          const bs = rs.baseState;
          exports.score = bs.score;
          exports.ticks = bs.ticks;
          return rs.gameState;
      }
      else if (isReplaying) {
          const rs = getFrameStateForReplay();
          return rs.gameState;
      }
      else if (state === "inGame") {
          const baseState = { score: exports.score, ticks: exports.ticks };
          recordFrameState(frameState, baseState, random$1);
      }
      return frameState;
  }
  function rewind$1() {
      if (isRewinding) {
          return;
      }
      if (!isReplaying && isRewindEnabled) {
          initRewind();
      }
      else {
          end();
      }
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
      isSpeedingUpSound: false,
      isCapturing: false,
      isCapturingGameCanvasOnly: false,
      captureCanvasScale: 1,
      isShowingScore: true,
      isShowingTime: false,
      isReplayEnabled: false,
      isRewindEnabled: false,
      isDrawingParticleFront: false,
      isDrawingScoreFront: false,
      isMinifying: false,
      viewSize: { x: 100, y: 100 },
      seed: 0,
      theme: "simple",
  };
  const seedRandom = new Random();
  const random$1 = new Random();
  const soundSpeedingUpInterval = 300;
  let state;
  let updateFunc = {
      title: updateTitle,
      inGame: updateInGame,
      gameOver: updateGameOver,
      rewind: updateRewind,
  };
  let terminal;
  let hiScore = 0;
  let fastestTime;
  let isNoTitle = true;
  let seed = 0;
  let loopOptions;
  let isPlayingBgm;
  let isSpeedingUpSound;
  let isShowingScore;
  let isShowingTime;
  let isReplayEnabled;
  let isRewindEnabled;
  let isDrawingParticleFront;
  let isDrawingScoreFront;
  let terminalSize;
  let scoreBoards;
  let isReplaying = false;
  let isWaitingRewind = false;
  let isRewinding = false;
  let rewindButton;
  let giveUpButton;
  let gameOverText;
  let gameScriptFile;
  function onLoad() {
      let opts;
      if (typeof options !== "undefined" && options != null) {
          opts = Object.assign(Object.assign({}, defaultOptions$4), options);
      }
      else {
          opts = defaultOptions$4;
      }
      const theme = {
          name: opts.theme,
          isUsingPixi: false,
          isDarkColor: false,
      };
      if (opts.theme !== "simple" && opts.theme !== "dark") {
          theme.isUsingPixi = true;
      }
      if (opts.theme === "pixel" ||
          opts.theme === "shapeDark" ||
          opts.theme === "crt" ||
          opts.theme === "dark") {
          theme.isDarkColor = true;
      }
      loopOptions = {
          viewSize: { x: 100, y: 100 },
          bodyBackground: theme.isDarkColor ? "#101010" : "#e0e0e0",
          viewBackground: theme.isDarkColor ? "blue" : "white",
          theme,
      };
      seed = opts.seed;
      loopOptions.isCapturing = opts.isCapturing;
      loopOptions.isCapturingGameCanvasOnly = opts.isCapturingGameCanvasOnly;
      loopOptions.captureCanvasScale = opts.captureCanvasScale;
      loopOptions.viewSize = opts.viewSize;
      isPlayingBgm = opts.isPlayingBgm;
      isSpeedingUpSound = opts.isSpeedingUpSound;
      isShowingScore = opts.isShowingScore && !opts.isShowingTime;
      isShowingTime = opts.isShowingTime;
      isReplayEnabled = opts.isReplayEnabled;
      isRewindEnabled = opts.isRewindEnabled;
      isDrawingParticleFront = opts.isDrawingParticleFront;
      isDrawingScoreFront = opts.isDrawingScoreFront;
      if (opts.isMinifying) {
          showMinifiedScript();
      }
      init$6(init$8, _update$1, loopOptions);
  }
  function init$8() {
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
      const prevTime = exports.time;
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
      if (theme.isUsingPixi) {
          endFill();
          if (theme.name === "crt") {
              updateCrtFilter();
          }
      }
      exports.ticks++;
      if (isReplaying) {
          exports.score = prevScore;
          exports.time = prevTime;
      }
      else if (exports.sc !== prevSc) {
          exports.score = exports.sc;
      }
  }
  function initInGame() {
      state = "inGame";
      exports.ticks = -1;
      init$7();
      const s = Math.floor(exports.score);
      if (s > hiScore) {
          hiScore = s;
      }
      if (isShowingTime && exports.time != null) {
          if (fastestTime == null || fastestTime > exports.time) {
              fastestTime = exports.time;
          }
      }
      exports.score = 0;
      exports.time = 0;
      scoreBoards = [];
      if (isPlayingBgm) {
          sss.playBgm();
      }
      const randomSeed = seedRandom.getInt(999999999);
      random$1.setSeed(randomSeed);
      if (isReplayEnabled || isRewindEnabled) {
          initRecord(randomSeed);
          initFrameStates();
          isReplaying = false;
      }
  }
  function updateInGame() {
      terminal.clear();
      clear$1();
      if (!isDrawingParticleFront) {
          update$5();
      }
      if (!isDrawingScoreFront) {
          updateScoreBoards();
      }
      if (isReplayEnabled || isRewindEnabled) {
          recordInput({
              pos: vec$1(pos$1),
              isPressed: isPressed$2,
              isJustPressed: isJustPressed$2,
              isJustReleased: isJustReleased$2,
          });
      }
      update();
      if (isDrawingParticleFront) {
          update$5();
      }
      if (isDrawingScoreFront) {
          updateScoreBoards();
      }
      drawScoreOrTime();
      terminal.draw();
      if (isShowingTime && exports.time != null) {
          exports.time++;
      }
      if (isSpeedingUpSound && exports.ticks % soundSpeedingUpInterval === 0) {
          sss.playInterval = 0.5 / sqrt(exports.difficulty);
      }
  }
  function initTitle() {
      state = "title";
      exports.ticks = -1;
      init$7();
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
      if (isReplayEnabled && isRecorded()) {
          replayInput();
          exports.inp = {
              p: pos$1,
              ip: isPressed$2,
              ijp: isJustPressed$2,
              ijr: isJustReleased$2,
          };
          if (!isDrawingParticleFront) {
              update$5();
          }
          update();
          if (isDrawingParticleFront) {
              update$5();
          }
          if (isSpeedingUpSound && exports.ticks % soundSpeedingUpInterval === 0) {
              sss.playInterval = 0.5 / sqrt(exports.difficulty);
          }
      }
      if (exports.ticks === 0) {
          drawScoreOrTime();
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
      else if (exports.ticks === (isReplayEnabled ? 120 : 300) && !isNoTitle) {
          initTitle();
      }
  }
  function drawGameOver() {
      if (isReplaying) {
          return;
      }
      terminal.print(gameOverText, Math.floor((terminalSize.x - gameOverText.length) / 2), Math.floor(terminalSize.y / 2));
      terminal.draw();
  }
  function initRewind() {
      state = "rewind";
      isWaitingRewind = true;
      rewindButton = get({
          pos: { x: 61, y: 11 },
          size: { x: 36, y: 7 },
          text: "Rewind",
      });
      giveUpButton = get({
          pos: { x: 61, y: 81 },
          size: { x: 36, y: 7 },
          text: "GiveUp",
      });
      if (isPlayingBgm) {
          sss.stopBgm();
      }
      if (theme.isUsingPixi) {
          draw(rewindButton);
          draw(giveUpButton);
      }
  }
  function updateRewind() {
      terminal.clear();
      clear$1();
      update();
      drawScoreOrTime();
      restoreInput();
      if (isRewinding) {
          draw(rewindButton);
          if (isFrameStateEmpty() || !isPressed$2) {
              stopRewind();
          }
      }
      else {
          update$6(rewindButton);
          update$6(giveUpButton);
          if (rewindButton.isPressed) {
              isRewinding = true;
              isWaitingRewind = false;
          }
      }
      if (giveUpButton.isPressed) {
          isWaitingRewind = isRewinding = false;
          end();
      }
      else {
          terminal.draw();
      }
      if (isShowingTime && exports.time != null) {
          exports.time++;
      }
  }
  function stopRewind() {
      isRewinding = false;
      state = "inGame";
      init$7();
      if (isPlayingBgm) {
          sss.playBgm();
      }
  }
  function drawScoreOrTime() {
      if (isShowingScore) {
          terminal.print(`${Math.floor(exports.score)}`, 0, 0);
          const hs = `HI ${hiScore}`;
          terminal.print(hs, terminalSize.x - hs.length, 0);
      }
      if (isShowingTime) {
          drawTime(exports.time, 0, 0);
          drawTime(fastestTime, 9, 0);
      }
  }
  function drawTime(time, x, y) {
      if (time == null) {
          return;
      }
      let t = Math.floor((time * 100) / 50);
      if (t >= 10 * 60 * 100) {
          t = 10 * 60 * 100 - 1;
      }
      const ts = getPaddedNumber(Math.floor(t / 6000), 1) +
          "'" +
          getPaddedNumber(Math.floor((t % 6000) / 100), 2) +
          '"' +
          getPaddedNumber(Math.floor(t % 100), 2);
      terminal.print(ts, x, y);
  }
  function getPaddedNumber(v, digit) {
      return ("0000" + v).slice(-digit);
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
      gameName = gameName.replace(/[^A-Za-z0-9_-]/g, "");
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
  let clr = color$1;
  let ply = play;
  let tms = times;
  let rmv = remove;
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
      ["remove(", "rmv("],
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
  exports.arc = arc;
  exports.atan2 = atan2;
  exports.bar = bar;
  exports.bl = bl;
  exports.box = box;
  exports.ceil = ceil$1;
  exports.char = char;
  exports.clamp = clamp$1;
  exports.clr = clr;
  exports.cn = cn;
  exports.color = color$1;
  exports.complete = complete;
  exports.cos = cos;
  exports.cy = cy;
  exports.end = end;
  exports.ex = ex;
  exports.floor = floor;
  exports.frameState = frameState;
  exports.getButton = get;
  exports.gr = gr;
  exports.ht = ht;
  exports.input = input$1;
  exports.jm = jm;
  exports.keyboard = keyboard;
  exports.lc = lc;
  exports.line = line;
  exports.ls = ls;
  exports.minifyReplaces = minifyReplaces;
  exports.onLoad = onLoad;
  exports.particle = particle;
  exports.play = play;
  exports.ply = ply;
  exports.pointer = pointer;
  exports.pow = pow;
  exports.pr = pr;
  exports.pw = pw;
  exports.range = range;
  exports.rd = rd;
  exports.rect = rect$1;
  exports.remove = remove;
  exports.rewind = rewind$1;
  exports.rmv = rmv;
  exports.rnd = rnd;
  exports.rndi = rndi;
  exports.rnds = rnds;
  exports.round = round;
  exports.sin = sin;
  exports.sl = sl;
  exports.sqrt = sqrt;
  exports.text = text$1;
  exports.times = times;
  exports.tms = tms;
  exports.tr = tr;
  exports.uc = uc;
  exports.updateButton = update$6;
  exports.vec = vec$1;
  exports.wh = wh;
  exports.wrap = wrap;
  exports.yl = yl;

}(this.window = this.window || {}, PIXI));
