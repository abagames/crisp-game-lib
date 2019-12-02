(function (exports) {
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
      getAngle(to) {
          return to == null
              ? Math.atan2(this.y, this.x)
              : Math.atan2(to.y - this.y, to.x - this.x);
      }
      distanceTo(to) {
          const ox = this.x - to.x;
          const oy = this.y - to.y;
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
  }

  const size = new Vector();
  let canvas;
  let context;
  let bodyCss;
  const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
  let background = document.createElement("img");
  let captureCanvas;
  let captureContext;
  let viewBackground = "black";
  function init(_size, _bodyBackground, _viewBackground, isCapturing) {
      size.set(_size);
      viewBackground = _viewBackground;
      bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
      document.body.style.cssText = bodyCss;
      canvas = document.createElement("canvas");
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.cssText = canvasCss;
      const cs = 95;
      const cw = size.x >= size.y ? cs : (cs / size.y) * size.x;
      const ch = size.y >= size.x ? cs : (cs / size.x) * size.y;
      canvas.style.width = `${cw}vmin`;
      canvas.style.height = `${ch}vmin`;
      context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      document.body.appendChild(canvas);
      if (isCapturing) {
          captureCanvas = document.createElement("canvas");
          const cw = size.y * 2;
          captureCanvas.width = size.x > cw ? size.x : cw;
          captureCanvas.height = size.y;
          captureContext = captureCanvas.getContext("2d");
          captureContext.fillStyle = _bodyBackground;
          gcc.setOptions({ scale: 2, capturingFps: 60 });
      }
  }
  function clear() {
      context.fillStyle = viewBackground;
      context.fillRect(0, 0, size.x, size.y);
  }
  function capture() {
      captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      captureContext.drawImage(canvas, (captureCanvas.width - canvas.width) / 2, 0);
      gcc.capture(captureCanvas);
  }

  const letterPatterns = [
      // !
      `
  w
  w
  w

  w
`,
      `
 w w
 w w



`,
      `
 w w
wwwww
 w w
wwwww
 w w
`,
      `
 www
w w
 www
  w w
 www
`,
      `
w   w
w  w
  w
 w  w
w   w
`,
      `
 w
w w
 ww w
w  w
 ww w
`,
      `
  w
  w



`,
      `
   w
  w
  w
  w
   w
`,
      `
 w
  w
  w
  w
 w
`,
      `
  w
w w w
 www
w w w
  w
`,
      `
  w
  w
wwwww
  w
  w
`,
      `



  w
 w
`,
      `


wwwww


`,
      `




  w
`,
      `
    w
   w
  w
 w
w
`,
      // 0
      `
 www
w  ww
w w w
ww  w
 www
`,
      `
 ww
w w
  w
  w
wwwww
`,
      `
 www
w   w
  ww
 w
wwwww
`,
      `
 www
w   w
  ww
w   w
 www
`,
      `
  ww
 w w
w  w
wwwww
   w
`,
      `
wwwww
w
wwww
    w
wwww
`,
      `
 www
w
wwww
w   w
 www
`,
      `
wwwww
w   w
   w
  w
 w
`,
      `
 www
w   w
 www
w   w
 www
`,
      `
 www
w   w
 wwww
    w
 www
`,
      // :
      `

  w

  w

`,
      `

  w

  w
 w
`,
      `
   ww
 ww
w
 ww
   ww
`,
      `

wwwww

wwwww

`,
      `
ww
  ww
    w
  ww
ww
`,
      `
 www
w   w
  ww

  w
`,
      `
 www
w   w
w www
w
 www
`,
      // A
      `
 www
w   w
wwwww
w   w
w   w
`,
      `
wwww
w   w
wwww
w   w
wwww
`,
      `
 www
w   w
w
w   w
 www
`,
      `
wwww
w   w
w   w
w   w
wwww
`,
      `
wwwww
w
wwww
w
wwwww
`,
      `
wwwww
w
wwww
w
w
`,
      `
 www
w
w  ww
w   w
 wwww
`,
      `
w   w
w   w
wwwww
w   w
w   w
`,
      `
wwwww
  w
  w
  w
wwwww
`,
      `
 wwww
   w
   w
w  w
 ww
`,
      `
w   w
w  w
www
w  w
w   w
`,
      `
w
w
w
w
wwwww
`,
      `
w   w
ww ww
w w w
w   w
w   w
`,
      `
w   w
ww  w
w w w
w  ww
w   w
`,
      `
 www
w   w
w   w
w   w
 www
`,
      `
wwww
w   w
wwww
w
w
`,
      `
 www
w   w
w   w
w  ww
 wwww
`,
      `
wwww
w   w
wwww
w   w
w   w
`,
      `
 wwww
w
 www
    w
wwww
`,
      `
wwwww
  w
  w
  w
  w
`,
      `
w   w
w   w
w   w
w   w
 www
`,
      `
w   w
w   w
 w w
 w w
  w
`,
      `
w   w
w   w
w w w
w w w
 w w
`,
      `
w   w
 w w
  w
 w w
w   w
`,
      `
w   w
 w w
  w
  w
  w
`,
      `
wwwww
   w
  w
 w
wwwww
`,
      `
  ww
  w
  w
  w
  ww
`,
      `
w
 w
  w
   w
    w
`,
      `
 ww
  w
  w
  w
 ww
`,
      `
  w
 w w



`,
      `




wwwww
`,
      `
 w
  w



`,
      // a
      `
 ww
   w
 www
w  w
 ww
`,
      `
w
w
www
w  w
www
`,
      `

 ww
w  
w
 ww
`,
      `
   w
   w
 www
w  w
 www
`,
      `
 ww
w  w
www
w
 ww
`,
      `
   w
  w 
 www
  w
  w
`,
      `
 www
w  w
 www
   w
 ww
`,
      `
w
w
www
w  w
w  w
`,
      `
  w

  w
  w
  w
`,
      `
   w

   w
   w
 ww
`,
      `
w
w
w w
ww
w w
`,
      `
 ww
  w
  w
  w
 www
`,
      `

ww w
w w w
w w w
w w w
`,
      `

w ww
ww  w
w   w
w   w
`,
      `

 ww
w  w
w  w
 ww
`,
      `

www
w  w
www
w
`,
      `

 www
w  w
 www
   w
`,
      `

w ww
ww
w
w
`,
      `
 ww
w
 ww  
   w
 ww
`,
      `
 w
www
 w
 w
  w
`,
      `

w  w
w  w
w  w
 ww
`,
      `

w  w
w  w
 ww
 ww
`,
      `

w w w
w w w
w w w
 w w
`,
      `

w  w
 ww
 ww
w  w
`,
      `

w  w
 ww
 w
w
`,
      `

wwww
  w
 w
wwww
`,
      //{
      `
  ww
  w
 w
  w
  ww
`,
      `
  w
  w
  w
  w
  w
`,
      `
 ww
  w
   w
  w
 ww
`,
      `

 w
w w w
   w

`
  ];

  let rgbObjects;
  const colorChars = "tlrgybpcwRGYBPCW";
  const colors = [
      "transparent",
      "black",
      "red",
      "green",
      "yellow",
      "blue",
      "purple",
      "cyan",
      "white"
  ];
  let currentColor;
  const rgbNumbers = [
      undefined,
      0x000000,
      0xe91e63,
      0x4caf50,
      0xffeb3b,
      0x3f51b5,
      0x9c27b0,
      0x03a9f4,
      0xeeeeee
  ];
  function init$1() {
      rgbObjects = [];
      rgbNumbers.forEach(n => {
          rgbObjects.push({
              r: (n & 0xff0000) >> 16,
              g: (n & 0xff00) >> 8,
              b: n & 0xff
          });
      });
      rgbNumbers.forEach((n, i) => {
          if (i < 2) {
              return;
          }
          rgbObjects.push({
              r: Math.floor((n & 0xff0000) * 0.5) >> 16,
              g: Math.floor((n & 0xff00) * 0.5) >> 8,
              b: Math.floor((n & 0xff) * 0.5)
          });
      });
  }
  function setColor(colorName) {
      currentColor = colorName;
      const f = rgbObjects[colors.indexOf(colorName)];
      context.fillStyle = `rgb(${f.r},${f.g},${f.b})`;
  }

  const dotCount = 6;
  const dotSize = 1;
  const letterSize = dotCount * dotSize;
  const rotationChars = "kljhnmbvopiu9087";
  let letterImages;
  let symbolImages;
  let cachedImages;
  let isCacheEnabled = false;
  let letterCanvas;
  let letterContext;
  function init$2() {
      letterCanvas = document.createElement("canvas");
      letterCanvas.width = letterCanvas.height = letterSize;
      letterContext = letterCanvas.getContext("2d");
      letterImages = letterPatterns.map(lp => createLetterImages(lp));
      symbolImages = range(64).map(() => undefined);
      cachedImages = {};
  }
  function enableCache() {
      isCacheEnabled = true;
  }
  function print(_str, x, y, options = {}) {
      const bx = Math.floor(x);
      let colorLines = options.colorPattern != null ? options.colorPattern.split("\n") : undefined;
      const backgroundColorLines = options.backgroundColorPattern != null
          ? options.backgroundColorPattern.split("\n")
          : undefined;
      const rotationLines = options.rotationPattern != null
          ? options.rotationPattern.split("\n")
          : undefined;
      const symbolLines = options.symbolPattern != null
          ? options.symbolPattern.split("\n")
          : undefined;
      const scale = options.scale == null ? 1 : options.scale;
      const alpha = options.alpha == null ? 1 : options.alpha;
      let str = _str;
      if (options.charAndColorPattern != null) {
          const [_lines, _colorLines] = getColorLines(options.charAndColorPattern);
          str = _lines.join("\n");
          colorLines = _colorLines;
      }
      let px = bx;
      let py = Math.floor(y);
      let lx = 0;
      let ly = 0;
      for (let i = 0; i < str.length; i++) {
          const c = str[i];
          if (c === "\n") {
              px = bx;
              py += letterSize * scale;
              lx = 0;
              ly++;
              continue;
          }
          printChar(c, px, py, Object.assign(Object.assign({}, getCharOption(options.color != null
              ? options.color
              : getCharFromLines(colorLines, lx, ly), options.backgroundColor != null
              ? options.backgroundColor
              : getCharFromLines(backgroundColorLines, lx, ly), options.rotation != null
              ? options.rotation
              : getCharFromLines(rotationLines, lx, ly), options.symbol != null
              ? options.symbol
              : getCharFromLines(symbolLines, lx, ly))), { scale, alpha }));
          px += letterSize * scale;
          lx++;
      }
  }
  function getColorLines(str) {
      const _cc = str.split("\n");
      const cc = _cc.slice(1, _cc.length - 1);
      const lines = [];
      const colorLines = [];
      let isNormalLine = true;
      for (const l of cc) {
          if (isNormalLine) {
              lines.push(l);
              isNormalLine = false;
              continue;
          }
          if (isColorLine(l)) {
              colorLines.push(l);
              isNormalLine = true;
          }
          else {
              lines.push(l);
              colorLines.push("");
          }
      }
      return [lines, colorLines];
  }
  function isColorLine(line) {
      return (line.trim().length > 0 &&
          line.replace(new RegExp(`[\\s${colorChars}]`, "g"), "").length === 0);
  }
  function getCharFromLines(lines, x, y) {
      if (lines == null) {
          return undefined;
      }
      if (y >= lines.length) {
          return undefined;
      }
      const c = lines[y].charAt(x);
      return c === "" || c === " " ? undefined : c;
  }
  function getCharOption(cg, bg, rg, sg) {
      let options = {
          color: "l",
          backgroundColor: "t",
          angleIndex: 0,
          isMirrorX: false,
          isMirrorY: false,
          isSymbol: false
      };
      if (cg != null && isColorChars(cg)) {
          options.color = cg;
      }
      if (bg != null && isColorChars(bg)) {
          options.backgroundColor = bg;
      }
      if (rg != null) {
          const ri = rotationChars.indexOf(rg);
          if (ri >= 0) {
              options.angleIndex = ri % 4;
              options.isMirrorX = (ri & 4) > 0;
              options.isMirrorY = (ri & 8) > 0;
          }
      }
      if (sg === "s") {
          options.isSymbol = true;
      }
      return options;
  }
  function printChar(c, x, y, options) {
      const cca = c.charCodeAt(0);
      if (cca < 0x20 || cca > 0x7e) {
          return;
      }
      const scaledSize = letterSize * options.scale;
      if (options.backgroundColor !== "t") {
          const rgb = rgbObjects[colorChars.indexOf(options.backgroundColor)];
          context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${Math.floor(options.alpha * 255)})`;
          context.fillRect(x, y, scaledSize, scaledSize);
      }
      if (cca == 0x20 || options.color === "t") {
          return;
      }
      const cc = cca - 0x21;
      const img = options.isSymbol ? symbolImages[cc] : letterImages[cc];
      if (options.color === "w" &&
          options.angleIndex % 4 === 0 &&
          !options.isMirrorX &&
          !options.isMirrorY &&
          options.alpha === 1) {
          if (options.scale === 1) {
              context.drawImage(img, x, y);
          }
          else {
              context.drawImage(img, x, y, scaledSize, scaledSize);
          }
          return;
      }
      const cacheIndex = JSON.stringify({ c, options });
      const ci = cachedImages[cacheIndex];
      if (ci != null) {
          context.drawImage(ci, x, y);
          return;
      }
      letterContext.clearRect(0, 0, letterSize, letterSize);
      letterContext.globalAlpha = options.alpha;
      if (options.angleIndex % 4 === 0 &&
          !options.isMirrorX &&
          !options.isMirrorY) {
          letterContext.drawImage(img, 0, 0);
      }
      else {
          letterContext.save();
          letterContext.translate(letterSize / 2, letterSize / 2);
          letterContext.rotate((Math.PI / 2) * options.angleIndex);
          if (options.isMirrorX || options.isMirrorY) {
              letterContext.scale(options.isMirrorX ? -1 : 1, options.isMirrorY ? -1 : 1);
          }
          letterContext.drawImage(img, -letterSize / 2, -letterSize / 2);
          letterContext.restore();
      }
      if (options.color !== "w") {
          letterContext.globalCompositeOperation = "source-in";
          const rgb = rgbObjects[colorChars.indexOf(options.color)];
          letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
          letterContext.fillRect(0, 0, letterSize, letterSize);
          letterContext.globalCompositeOperation = "source-over";
      }
      context.drawImage(letterCanvas, x, y, scaledSize, scaledSize);
      if (isCacheEnabled) {
          const cachedImage = document.createElement("img");
          cachedImage.src = letterCanvas.toDataURL();
          cachedImages[cacheIndex] = cachedImage;
      }
  }
  function isColorChars(c) {
      return colorChars.indexOf(c) >= 0;
  }
  function createLetterImages(pattern, isSkippingFirstAndLastLine = true) {
      letterContext.clearRect(0, 0, letterSize, letterSize);
      let p = pattern.split("\n");
      if (isSkippingFirstAndLastLine) {
          p = p.slice(1, p.length - 1);
      }
      let pw = 0;
      p.forEach(l => {
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
                  const rgb = rgbObjects[ci];
                  letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
                  letterContext.fillRect((x + xPadding) * dotSize, (y + yPadding) * dotSize, dotSize, dotSize);
              }
          }
      });
      const img = document.createElement("img");
      img.src = letterCanvas.toDataURL();
      return img;
  }

  let isPressed = false;
  let isJustPressed = false;
  let isJustReleased = false;
  const stick = new Vector();
  let stickAngle;
  const isStickPressed = range(4).map(() => false);
  const isStickJustPressed = range(4).map(() => false);
  const isStickJustReleased = range(4).map(() => false);
  const defaultOptions = {
      isUsingStickKeysAsButton: false,
      isFourWaysStick: false,
      onKeyDown: undefined
  };
  let options$1;
  const isKeyPressing = range(256).map(() => false);
  const isKeyPressed = range(256).map(() => false);
  const isKeyReleased = range(256).map(() => false);
  const stickKeys = [
      [39, 68, 102],
      [40, 83, 101, 98],
      [37, 65, 100],
      [38, 87, 104]
  ];
  const stickXys = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const buttonKeys = [
      90,
      88,
      67,
      86,
      66,
      78,
      77,
      188,
      190,
      191,
      17,
      16,
      18,
      32,
      13
  ];
  function init$3(_options) {
      options$1 = Object.assign(Object.assign({}, defaultOptions), _options);
      document.addEventListener("keydown", e => {
          isKeyPressing[e.keyCode] = isKeyPressed[e.keyCode] = true;
          if (options$1.onKeyDown != null) {
              options$1.onKeyDown();
          }
      });
      document.addEventListener("keyup", e => {
          isKeyPressing[e.keyCode] = false;
          isKeyReleased[e.keyCode] = true;
      });
  }
  function update$1() {
      const pp = isPressed;
      isPressed = isJustPressed = isJustReleased = false;
      range(4).forEach(i => {
          isStickPressed[i] = isStickJustPressed[i] = isStickJustReleased[i] = false;
      });
      stick.set(0);
      stickKeys.forEach((ks, i) => {
          ks.forEach(k => {
              if (isKeyPressing[k] || isKeyPressed[k]) {
                  stick.x += stickXys[i][0];
                  stick.y += stickXys[i][1];
                  isStickPressed[i] = true;
                  if (options$1.isUsingStickKeysAsButton) {
                      isPressed = true;
                  }
                  if (isKeyPressed[k]) {
                      isKeyPressed[k] = false;
                      isStickJustPressed[i] = true;
                      if (options$1.isUsingStickKeysAsButton && !pp) {
                          isJustPressed = true;
                      }
                  }
              }
              if (isKeyReleased[k]) {
                  isKeyReleased[k] = false;
                  isStickJustReleased[i] = true;
                  if (options$1.isUsingStickKeysAsButton && pp) {
                      isJustReleased = true;
                  }
              }
          });
      });
      stickAngle = -1;
      if (stick.length > 0) {
          setStickAngle(stick.getAngle());
      }
      buttonKeys.forEach(k => {
          if (isKeyPressing[k]) {
              isPressed = true;
          }
          if (isKeyPressed[k]) {
              isKeyPressed[k] = false;
              if (!pp) {
                  isPressed = isJustPressed = true;
              }
          }
          if (isKeyReleased[k]) {
              isKeyReleased[k] = false;
              if (pp) {
                  isJustReleased = true;
              }
          }
      });
  }
  const angleOffsets = [1, 0, 1, 1, 0, 1, -1, 1, -1, 0, -1, -1, 0, -1, 1, -1];
  function setStickAngle(a) {
      const wayAngle = options$1.isFourWaysStick ? Math.PI / 2 : Math.PI / 4;
      const angleStep = options$1.isFourWaysStick ? 2 : 1;
      stickAngle = wrap(Math.round(a / wayAngle) * angleStep, 0, 8);
      stick.set(angleOffsets[stickAngle * 2], angleOffsets[stickAngle * 2 + 1]);
  }
  function clearJustPressed() {
      isJustPressed = false;
      isPressed = true;
  }

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
  const move = new Vector();
  const pressedPos = new Vector();
  const targetPos = new Vector();
  let isPressed$1 = false;
  let isJustPressed$1 = false;
  let isJustReleased$1 = false;
  let defaultOptions$1 = {
      isDebugMode: false,
      anchor: new Vector(),
      padding: new Vector(),
      onPointerDownOrUp: undefined
  };
  let screen;
  let pixelSize;
  let options$2;
  const prevPos = new Vector();
  const debugRandom = new Random();
  const debugPos = new Vector();
  const debugMoveVel = new Vector();
  let debugIsDown = false;
  let cursorPos = new Vector(-9999, -9999);
  let isDown = false;
  let isClicked = false;
  let isReleased = false;
  let isResettingTargetPos = false;
  function init$4(_screen, _pixelSize, _options) {
      options$2 = Object.assign(Object.assign({}, defaultOptions$1), _options);
      screen = _screen;
      pixelSize = new Vector(_pixelSize.x + options$2.padding.x * 2, _pixelSize.y + options$2.padding.y * 2);
      targetPos.set(pixelSize.x / 2, pixelSize.y / 2);
      if (options$2.isDebugMode) {
          debugPos.set(pixelSize.x / 2, pixelSize.y / 2);
      }
      document.addEventListener("mousedown", e => {
          onDown(e.pageX, e.pageY);
      });
      document.addEventListener("touchstart", e => {
          onDown(e.touches[0].pageX, e.touches[0].pageY);
      });
      document.addEventListener("mousemove", e => {
          onMove(e.pageX, e.pageY);
      });
      document.addEventListener("touchmove", e => {
          e.preventDefault();
          onMove(e.touches[0].pageX, e.touches[0].pageY);
      }, { passive: false });
      document.addEventListener("mouseup", e => {
          onUp();
      });
      document.addEventListener("touchend", e => {
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
      if (isJustPressed$1) {
          pressedPos.set(pos);
          prevPos.set(pos);
      }
      move.set(pos.x - prevPos.x, pos.y - prevPos.y);
      prevPos.set(pos);
      if (isResettingTargetPos) {
          targetPos.set(pos);
      }
      else {
          targetPos.add(move);
      }
      isClicked = isReleased = false;
  }
  function clearJustPressed$1() {
      isJustPressed$1 = false;
      isPressed$1 = true;
  }
  function setTargetPos(v) {
      targetPos.set(v);
  }
  function calcPointerPos(x, y, v) {
      if (screen == null) {
          return;
      }
      v.x =
          ((x - screen.offsetLeft) / screen.clientWidth + options$2.anchor.x) *
              pixelSize.x -
              options$2.padding.x;
      v.y =
          ((y - screen.offsetTop) / screen.clientHeight + options$2.anchor.y) *
              pixelSize.y -
              options$2.padding.y;
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
      isResettingTargetPos = false;
      if (options$2.onPointerDownOrUp != null) {
          options$2.onPointerDownOrUp();
      }
  }
  function onMove(x, y) {
      cursorPos.set(x, y);
      if (!isDown) {
          isResettingTargetPos = true;
      }
  }
  function onUp(e) {
      isDown = false;
      isReleased = true;
      isResettingTargetPos = false;
      if (options$2.onPointerDownOrUp != null) {
          options$2.onPointerDownOrUp();
      }
  }

  let stickAngle$1 = 0;
  let pos$1 = new Vector();
  let isPressed$2 = false;
  let isJustPressed$2 = false;
  let isJustReleased$2 = false;
  let isUsingVirtualPad;
  let isFourWaysStick;
  let centerPos = new Vector();
  let offsetFromCenter = new Vector();
  function init$5(_isUsingVirtualPad = true, _isFourWaysStick = false) {
      isUsingVirtualPad = _isUsingVirtualPad;
      isFourWaysStick = _isFourWaysStick;
      centerPos.set(size.x / 2, size.y / 2);
      init$3({
          onKeyDown: sss.playEmpty,
          isUsingStickKeysAsButton: true,
          isFourWaysStick
      });
      init$4(canvas, size, {
          onPointerDownOrUp: sss.playEmpty,
          anchor: new Vector(0.5, 0.5)
      });
  }
  function update$3() {
      stickAngle$1 = -1;
      update$1();
      if (stickAngle >= 0) {
          stickAngle$1 = stickAngle;
      }
      update$2();
      pos$1 = pos;
      if (isPressed$1) {
          if (isJustPressed$1) {
              setTargetPos(centerPos);
          }
          if (isUsingVirtualPad) {
              offsetFromCenter.set(targetPos).sub(centerPos);
              if (offsetFromCenter.length > 10) {
                  const oa = offsetFromCenter.getAngle() / (Math.PI / 4);
                  stickAngle$1 = wrap(Math.round(oa), 0, 8);
                  if (isFourWaysStick) {
                      stickAngle$1 = Math.floor(stickAngle$1 / 2) * 2;
                  }
              }
          }
      }
      isPressed$2 = isPressed || isPressed$1;
      isJustPressed$2 = isJustPressed || isJustPressed$1;
      isJustReleased$2 = isJustReleased || isJustReleased$1;
  }
  function draw() {
      if (isUsingVirtualPad && isPressed$1) {
          print("c", size.x / 2 - 2, size.y / 2 - 2, {
              colorPattern: "b",
              backgroundColorPattern: "t",
              symbolPattern: "s",
              alpha: 0.5
          });
          let cc = "c";
          let rc = "k";
          if (stickAngle$1 >= 0) {
              cc = stickAngle$1 % 2 === 0 ? "a" : "z";
              rc = "kljh".charAt(Math.floor(stickAngle$1 / 2));
          }
          print(cc, targetPos.x - 2, targetPos.y - 2, {
              colorPattern: "g",
              backgroundColorPattern: "t",
              symbolPattern: "s",
              rotationPattern: rc,
              alpha: 0.5
          });
      }
  }
  function clearJustPressed$2() {
      clearJustPressed();
      clearJustPressed$1();
  }

  var input = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get stickAngle () { return stickAngle$1; },
    get pos () { return pos$1; },
    get isPressed () { return isPressed$2; },
    get isJustPressed () { return isJustPressed$2; },
    get isJustReleased () { return isJustReleased$2; },
    init: init$5,
    update: update$3,
    draw: draw,
    clearJustPressed: clearJustPressed$2
  });

  let lastFrameTime = 0;
  let _init;
  let _update;
  const defaultOptions$2 = {
      viewSize: { x: 126, y: 126 },
      bodyBackground: "#111",
      viewBackground: "black",
      isUsingVirtualPad: true,
      isFourWaysStick: false,
      isCapturing: false
  };
  let options$3;
  let textCacheEnableTicks = 10;
  function init$6(__init, __update, _options) {
      _init = __init;
      _update = __update;
      options$3 = Object.assign(Object.assign({}, defaultOptions$2), _options);
      init(options$3.viewSize, options$3.bodyBackground, options$3.viewBackground, options$3.isCapturing);
      init$5(options$3.isUsingVirtualPad, options$3.isFourWaysStick);
      init$2();
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
      draw();
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
          this.charGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.colorGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.backgroundColorGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.rotationGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.symbolGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
      }
      print(_str, _x, _y, options = {}) {
          let x = Math.floor(_x);
          let y = Math.floor(_y);
          const bx = x;
          let colorLines = options.colorPattern != null
              ? options.colorPattern.split("\n")
              : undefined;
          const backgroundColorLines = options.backgroundColorPattern != null
              ? options.backgroundColorPattern.split("\n")
              : undefined;
          const rotationLines = options.rotationPattern != null
              ? options.rotationPattern.split("\n")
              : undefined;
          const symbolLines = options.symbolPattern != null
              ? options.symbolPattern.split("\n")
              : undefined;
          let str = _str;
          if (options.charAndColorPattern != null) {
              const [_lines, _colorLines] = getColorLines(options.charAndColorPattern);
              str = _lines.join("\n");
              colorLines = _colorLines;
          }
          let lx = 0;
          let ly = 0;
          for (let i = 0; i < str.length; i++) {
              const c = str[i];
              if (c === "\n") {
                  x = bx;
                  y++;
                  lx = 0;
                  ly++;
                  continue;
              }
              if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
                  x++;
                  lx++;
                  continue;
              }
              this.charGrid[x][y] = c;
              this.colorGrid[x][y] =
                  options.color != null
                      ? options.color
                      : getCharFromLines(colorLines, lx, ly);
              this.backgroundColorGrid[x][y] =
                  options.backgroundColor != null
                      ? options.backgroundColor
                      : getCharFromLines(backgroundColorLines, lx, ly);
              this.rotationGrid[x][y] =
                  options.rotation != null
                      ? options.rotation
                      : getCharFromLines(rotationLines, lx, ly);
              this.symbolGrid[x][y] =
                  options.symbol != null
                      ? options.symbol
                      : getCharFromLines(symbolLines, lx, ly);
              x++;
              lx++;
          }
      }
      getCharAt(_x, _y) {
          if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
              return undefined;
          }
          const x = Math.floor(_x);
          const y = Math.floor(_y);
          const char = this.charGrid[x][y];
          const cg = this.colorGrid[x][y];
          const bg = this.backgroundColorGrid[x][y];
          const rg = this.rotationGrid[x][y];
          const sg = this.symbolGrid[x][y];
          return { char, options: getCharOption(cg, bg, rg, sg) };
      }
      setCharAt(_x, _y, char, options) {
          if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
              return;
          }
          const x = Math.floor(_x);
          const y = Math.floor(_y);
          this.charGrid[x][y] = char;
          if (options == null) {
              this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = undefined;
              return;
          }
          this.colorGrid[x][y] = options.color;
          this.backgroundColorGrid[x][y] = options.backgroundColor;
          if (options.angleIndex == null) {
              this.rotationGrid[x][y] = undefined;
          }
          else {
              let ri = options.angleIndex;
              if (options.isMirrorX) {
                  ri |= 4;
              }
              if (options.isMirrorY) {
                  ri |= 8;
              }
              this.rotationGrid[x][y] = rotationChars.charAt(ri);
          }
          this.symbolGrid[x][y] = options.isSymbol ? "s" : undefined;
      }
      draw() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 0; y < this.size.y; y++) {
                  const c = this.charGrid[x][y];
                  if (c == null) {
                      continue;
                  }
                  const cg = this.colorGrid[x][y];
                  const bg = this.backgroundColorGrid[x][y];
                  const rg = this.rotationGrid[x][y];
                  const sg = this.symbolGrid[x][y];
                  printChar(c, x * letterSize, y * letterSize, Object.assign(Object.assign({}, getCharOption(cg, bg, rg, sg)), { scale: 1, alpha: 1 }));
              }
          }
      }
      clear() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 0; y < this.size.y; y++) {
                  this.charGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = this.symbolGrid[x][y] = undefined;
              }
          }
      }
      scrollUp() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 1; y < this.size.y; y++) {
                  this.charGrid[x][y - 1] = this.charGrid[x][y];
                  this.colorGrid[x][y - 1] = this.colorGrid[x][y];
                  this.backgroundColorGrid[x][y - 1] = this.backgroundColorGrid[x][y];
                  this.rotationGrid[x][y - 1] = this.rotationGrid[x][y];
                  this.symbolGrid[x][y - 1] = this.symbolGrid[x][y];
              }
          }
          const y = this.size.y - 1;
          for (let x = 0; x < this.size.x; x++) {
              this.charGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = this.symbolGrid[x][y] = undefined;
          }
      }
      getState() {
          return {
              charGrid: this.charGrid.map(l => [].concat(l)),
              colorGrid: this.colorGrid.map(l => [].concat(l)),
              backgroundColorGrid: this.backgroundColorGrid.map(l => [].concat(l)),
              rotationGrid: this.rotationGrid.map(l => [].concat(l)),
              symbolGrid: this.symbolGrid.map(l => [].concat(l))
          };
      }
      setState(state) {
          this.charGrid = state.charGrid.map(l => [].concat(l));
          this.colorGrid = state.colorGrid.map(l => [].concat(l));
          this.backgroundColorGrid = state.backgroundColorGrid.map(l => [].concat(l));
          this.rotationGrid = state.rotationGrid.map(l => [].concat(l));
          this.symbolGrid = state.symbolGrid.map(l => [].concat(l));
      }
  }

  let rects;
  let tmpRects;
  function update$5() {
      rects = [];
      tmpRects = [];
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
                  return addRect(isAlignCenter, x, y, width, height);
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
              if (typeof width === "number") {
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
      let collision = { rect: {} };
      for (let i = 0; i < rn; i++) {
          collision = Object.assign(collision, addRect(true, p.x, p.y, thickness, thickness, true));
          p.add(l);
      }
      concatTmpRects();
      return collision;
  }
  function addRect(isAlignCenter, x, y, width, height, isAddingToTmp = false) {
      let pos = isAlignCenter
          ? { x: Math.floor(x - width / 2), y: Math.floor(y - height / 2) }
          : { x: Math.floor(x), y: Math.floor(y) };
      const size = { x: Math.floor(width), y: Math.floor(height) };
      let rect = { pos, size, color: currentColor };
      const collision = checkRects(rect);
      if (currentColor !== "transparent") {
          (isAddingToTmp ? tmpRects : rects).push(rect);
          context.fillRect(pos.x, pos.y, size.x, size.y);
      }
      return collision;
  }
  function concatTmpRects() {
      rects = rects.concat(tmpRects);
      tmpRects = [];
  }
  function checkRects(rect) {
      const collision = { rect: {} };
      rects.forEach(r => {
          if (testCollision(rect, r)) {
              collision[r.color] = true;
          }
      });
      return collision;
  }
  function testCollision(r1, r2) {
      const ox = r2.pos.x - r1.pos.x;
      const oy = r2.pos.y - r1.pos.y;
      return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
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
  let random = new Random();
  function end() {
      initGameOver();
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
      lucky: "u"
  };
  const defaultOptions$3 = {
      seed: 0,
      isCapturing: false,
      viewSize: { x: 100, y: 100 },
      isPlayingBgm: false
  };
  let state;
  let updateFunc = {
      title: updateTitle,
      inGame: updateInGame,
      gameOver: updateGameOver
  };
  let terminal;
  let hiScore = 0;
  let isNoTitle = true;
  let seed = 0;
  let loopOptions;
  let terminalSize;
  let isPlayingBgm;
  addGameScript();
  window.addEventListener("load", onLoad);
  function onLoad() {
      loopOptions = {
          viewSize: { x: 100, y: 100 },
          bodyBackground: "#ddd",
          viewBackground: "#eee",
          isUsingVirtualPad: false
      };
      let opts;
      if (typeof options !== "undefined" && options != null) {
          opts = Object.assign(Object.assign({}, defaultOptions$3), options);
      }
      else {
          opts = defaultOptions$3;
      }
      seed = opts.seed;
      loopOptions.isCapturing = opts.isCapturing;
      loopOptions.viewSize = opts.viewSize;
      isPlayingBgm = opts.isPlayingBgm;
      init$1();
      init$6(init$7, _update$1, loopOptions);
      setColor("white");
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
      }
      sss.init(seed);
      const sz = loopOptions.viewSize;
      terminalSize = { x: Math.floor(sz.x / 6), y: Math.floor(sz.y / 6) };
      terminal = new Terminal(terminalSize);
      if (isNoTitle) {
          initInGame();
          exports.ticks = 0;
      }
      else {
          initTitle();
      }
  }
  function _update$1() {
      exports.ticks = exports.ticks;
      exports.difficulty = exports.ticks / 3600 + 1;
      update$5();
      updateFunc[state]();
      exports.ticks++;
  }
  function initInGame() {
      state = "inGame";
      exports.ticks = -1;
      const s = Math.floor(exports.score);
      if (s > hiScore) {
          hiScore = s;
      }
      exports.score = 0;
      if (isPlayingBgm) {
          sss.playBgm();
      }
  }
  function updateInGame() {
      terminal.clear();
      clear();
      update();
      drawScore();
      terminal.draw();
  }
  function initTitle() {
      state = "title";
      exports.ticks = -1;
      terminal.clear();
      clear();
  }
  function updateTitle() {
      if (exports.ticks === 0) {
          drawScore();
          if (typeof title !== "undefined" && title != null) {
              terminal.print(title, Math.floor(terminalSize.x - title.length) / 2, 3);
          }
          terminal.draw();
      }
      if (exports.ticks === 30 || exports.ticks == 40) {
          if (typeof description !== "undefined" && description != null) {
              let maxLineLength = 0;
              description.split("\n").forEach(l => {
                  if (l.length > maxLineLength) {
                      maxLineLength = l.length;
                  }
              });
              const x = Math.floor((terminalSize.x - maxLineLength) / 2);
              description.split("\n").forEach((l, i) => {
                  terminal.print(l, x, Math.floor(terminalSize.y / 2) + i);
              });
              terminal.draw();
          }
      }
      if (isJustPressed$2) {
          initInGame();
      }
  }
  function initGameOver() {
      state = "gameOver";
      clearJustPressed$2();
      exports.ticks = -1;
      drawGameOver();
      if (isPlayingBgm) {
          sss.stopBgm();
      }
  }
  function updateGameOver() {
      if (exports.ticks > 20 && isJustPressed$2) {
          initInGame();
      }
      else if (exports.ticks === 500 && !isNoTitle) {
          initTitle();
      }
      if (exports.ticks === 10) {
          drawGameOver();
      }
  }
  function drawGameOver() {
      terminal.print("GAME OVER", Math.floor((terminalSize.x - 9) / 2), Math.floor(terminalSize.y / 2));
      terminal.draw();
  }
  function drawScore() {
      terminal.print(`${Math.floor(exports.score)}`, 0, 0);
      const hs = `HI ${hiScore}`;
      terminal.print(hs, terminalSize.x - hs.length, 0);
  }
  function addGameScript() {
      let gameName = window.location.search.substring(1);
      gameName = gameName.replace(/\W/g, "");
      if (gameName.length === 0) {
          return;
      }
      const script = document.createElement("script");
      script.setAttribute("src", `${gameName}/main.js`);
      document.head.appendChild(script);
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

  exports.PI = PI;
  exports.abs = abs;
  exports.atan2 = atan2;
  exports.bar = bar;
  exports.box = box;
  exports.ceil = ceil;
  exports.clamp = clamp$1;
  exports.color = color;
  exports.cos = cos;
  exports.end = end;
  exports.floor = floor;
  exports.input = input;
  exports.line = line;
  exports.play = play;
  exports.pow = pow;
  exports.random = random;
  exports.range = range;
  exports.rect = rect;
  exports.round = round;
  exports.sin = sin;
  exports.sqrt = sqrt;
  exports.vec = vec;
  exports.wrap = wrap;

}(this.window = this.window || {}));
