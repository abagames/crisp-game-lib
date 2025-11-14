(function (exports) {
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
    function times(count, func) {
        return range(count).map((i) => func(i));
    }
    /**
     * A function that takes an **array** as its first argument and a **func**tion as its second argument.
     * The function receives each element of the array as a first argument.
     * If the function returns `true`, this element is removed from the array.
     * @param array
     * @param func
     * @returns Removed array elements.
     */
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
    /**
     * Return a character whose character code is the character code of
     * the first argument **char** plus the value of the second argument **offset**.
     * It is mainly used to animate a character with the `char()`.
     * @param char
     * @param offset
     * @returns
     */
    function addWithCharCode(char, offset) {
        return String.fromCharCode(char.charCodeAt(0) + offset);
    }

    function isVectorLike(v) {
        return v.x != null && v.y != null;
    }
    /**
     * A two-dimensional vector class with functions useful for working with (x, y) coordinates.
     */
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
    let colorPaletteValues;
    const rgbNumbers = [
        0xeeeeee, 0xe91e63, 0x4caf50, 0xffc107, 0x3f51b5, 0x9c27b0, 0x03a9f4,
        0x616161,
    ];
    function init$9(isDarkColor, colorPalette) {
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
        if (colorPalette != null) {
            setCustomColorPalette(colorPalette);
        }
    }
    function setCustomColorPalette(colorPalette) {
        colorPaletteValues = colorPalette.map((c) => ({
            r: c[0],
            g: c[1],
            b: c[2],
            a: 1,
        }));
        /* search the closest color for each value and change to the closest color in the palette */
        for (let i = 0; i < colors.length; i++) {
            let minDistance = Infinity;
            let minIndex = -1;
            for (let j = 0; j < colorPaletteValues.length; j++) {
                const distance = colorDistance(colorPaletteValues[j], values[colors[i]]);
                if (distance < minDistance) {
                    minDistance = distance;
                    minIndex = j;
                }
            }
            values[colors[i]] = colorPaletteValues[minIndex];
        }
    }
    function colorDistance(color1, color2) {
        const weights = { r: 0.299, g: 0.587, b: 0.114 };
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;
        const isGrayscale2 = color2.r === color2.g && color2.g === color2.b;
        let distance = Math.sqrt(rDiff * rDiff * weights.r +
            gDiff * gDiff * weights.g +
            bDiff * bDiff * weights.b);
        if (isGrayscale2 && !(color2.r === 0 && color2.g === 0 && color2.b === 0)) {
            distance *= 1.5;
        }
        return distance;
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
    function colorToNumber(color, ratio = 1) {
        const v = resolveColorValue(color);
        return ((Math.floor(v.r * ratio) << 16) |
            (Math.floor(v.g * ratio) << 8) |
            Math.floor(v.b * ratio));
    }
    function colorToStyle(color, ratio = 1) {
        const v = resolveColorValue(color);
        const r = Math.floor(v.r * ratio);
        const g = Math.floor(v.g * ratio);
        const b = Math.floor(v.b * ratio);
        return v.a < 1 ? `rgba(${r},${g},${b},${v.a})` : `rgb(${r},${g},${b})`;
    }
    function resolveColorValue(color) {
        if (typeof color === "number") {
            if (colorPaletteValues == null) {
                throw new Error(`color(${color}) is invalid because no custom color palette is defined.`);
            }
            const paletteColor = colorPaletteValues[color];
            if (paletteColor == null) {
                throw new Error(`color(${color}) is out of bounds for the current color palette (length: ${colorPaletteValues.length}).`);
            }
            return paletteColor;
        }
        if (values == null) {
            throw new Error(`color("${color}") was used before the color system was initialized.`);
        }
        const namedColor = values[color];
        if (namedColor == null) {
            throw new Error(`Unknown color "${color}". Supported colors: ${colors.join(", ")}.`);
        }
        return namedColor;
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
    let context;
    let graphics; //: PIXI.Graphics;
    let canvasSize = new Vector();
    const graphicsScale = 5;
    document.createElement("img");
    let captureCanvas;
    let captureContext;
    let calculatedCanvasScale = 1;
    let viewBackground = "black";
    let currentColor;
    let savedCurrentColor;
    let isFilling = false;
    let theme;
    let crtFilter;
    function init$8(_size, _bodyBackground, _viewBackground, isCapturing, isCapturingGameCanvasOnly, captureCanvasScale, captureDurationSec, _theme) {
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
                durationSec: captureDurationSec,
            });
        }
    }
    function clear$1() {
        if (theme.isUsingPixi) {
            graphics.clear();
            graphics.beginFill(colorToNumber(viewBackground, theme.isDarkColor ? 0.15 : 1));
            graphics.drawRect(0, 0, size.x, size.y);
            graphics.endFill();
            graphics.beginFill(colorToNumber(currentColor));
            isFilling = true;
            return;
        }
        context.fillStyle = colorToStyle(viewBackground, theme.isDarkColor ? 0.15 : 1);
        context.fillRect(0, 0, size.x, size.y);
        context.fillStyle = colorToStyle(currentColor);
    }
    function setColor(colorNameOrColorIndex) {
        if (colorNameOrColorIndex === currentColor) {
            if (theme.isUsingPixi && !isFilling) {
                beginFillColor(colorToNumber(currentColor));
            }
            return;
        }
        currentColor = colorNameOrColorIndex;
        if (theme.isUsingPixi) {
            if (isFilling) {
                graphics.endFill();
            }
            beginFillColor(colorToNumber(currentColor));
            return;
        }
        context.fillStyle = colorToStyle(colorNameOrColorIndex);
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
    function drawLine$1(x1, y1, x2, y2, thickness) {
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
llll
    l
  ll
    l
llll
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
 llll
l
l
l
 llll
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
  lll
   l
   l
   l
lll
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
l   l
 l l
  l
`,
        `
l   l
l l l
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

 lll
l  l
l  l
 lll
`,
        `
l
l
lll
l  l
lll
`,
        `

 lll
l  
l
 lll
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
l ll
ll
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
 ll
l  l
 lll
   l
 ll
`,
        `
l
l
ll
l l
l l
`,
        `

l

l
l
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

llll
l l l
l l l
l   l
`,
        `

lll
l  l
l  l
l  l
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

 lll
ll
  ll
lll
`,
        `

 l
lll
 l
  l
`,
        `

l  l
l  l
l  l
 lll
`,
        `

l  l
l  l
 ll
 ll
`,
        `

l   l
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

`,
    ];

    const smallTextPatterns = [
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
lll
l l
lll
l l
`,
        `
 ll
ll
lll
 ll
ll
`,
        `
l l
  l
 l
l
l l
`,
        `
ll
ll
lll
l 
lll
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
lll
 l
lll
 l
`,
        `
 l
 l
lll
 l
 l
`,
        `



 l
l
`,
        `


lll


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
l l
l l
l l
lll
`,
        `
  l
  l
  l
  l
  l
`,
        `
lll
  l
lll
l
lll
`,
        `
lll
  l
lll
  l
lll
`,
        `
l l
l l
lll
  l
  l
`,
        `
lll
l
lll
  l
lll
`,
        `
l
l
lll
l l
lll
`,
        `
lll
  l
  l
  l
  l
`,
        `
lll
l l
lll
l l
lll
`,
        `
lll
l l
lll
  l
  l
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
  l
 l
l
 l
  l
`,
        `

lll

lll

`,
        `
l
 l
  l
 l
l
`,
        `
lll
  l
 ll

 l
`,
        `

lll
l l
l
 ll
`,
        // A
        `
lll
l l
lll
l l
l l
`,
        `
ll
l l
lll
l l
ll
`,
        `
lll
l
l
l
lll
`,
        `
ll
l l
l l
l l
ll
`,
        `
lll
l
lll
l
lll
`,
        `
lll
l
lll
l
l
`,
        `
lll
l
l l
l l
 ll
`,
        `
l l
l l
lll
l l
l l
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
ll
`,
        `
l l
l l
ll
l l
l l
`,
        `
l
l
l
l
lll
`,
        `
l l
lll
l l
l l
l l
`,
        `
l l
lll
lll
lll
l l
`,
        `
lll
l l
l l
l l
lll
`,
        `
lll
l l
lll
l
l
`,
        `
lll
l l
l l
lll
lll
`,
        `
ll
l l
ll
l l
l l
`,
        `
lll
l
lll
  l
lll
`,
        `
lll
 l
 l
 l
 l
`,
        `
l l
l l
l l
l l
lll
`,
        `
l l
l l
l l
l l
 l
`,
        `
l l
l l
lll
lll
l l
`,
        `
l l
l l
 l
l l
l l
`,
        `
l l
l l
lll
 l
 l
`,
        `
lll
  l
 l
l
lll
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




lll
`,
        `
l
 l



`,
        // a
        `


 ll
l l
 ll
`,
        `

l
lll
l l
lll
`,
        `


lll
l
lll
`,
        `

  l
lll
l l
lll
`,
        `


lll
l
 ll
`,
        `

 ll
 l
lll
 l
`,
        `

lll
lll
  l
ll
`,
        `

l
l
lll
l l
`,
        `

 l

 l
 l
`,
        `

 l

 l
ll
`,
        `

l
l l
ll
l l
`,
        `

 l
 l
 l
 l
`,
        `


lll
lll
l l
`,
        `


ll
l l
l l
`,
        `


lll
l l
lll
`,
        `


lll
lll
l
`,
        `


lll
lll
  l
`,
        `


lll
l
l
`,
        `


 ll
lll
ll
`,
        `


lll
 l
 l
`,
        `


l l
l l
lll
`,
        `


l l
l l
 l
`,
        `


l l
lll
l l
`,
        `


l l
 l
l l
`,
        `


l l
 l
l
`,
        `


lll
 l
lll
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
lll
  l

`,
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

    /**
     * Draw a text.
     * @param str
     * @param x
     * @param y
     * @param options
     * @returns Information about objects that collided during drawing.
     */
    function text(str, x, y, options) {
        return letters(false, str, x, y, options);
    }
    /**
     * Draw a pixel art.
     *
     * You can define pixel arts (6x6 dots) of characters with `characters` array.
     * Each letter represents a pixel color
     * ( *l: black, r: red, g: green, b: blue, y: yellow, p: purple, c: cyan,
     *  L: light_black, R: light_red, G: light_green, B: light_blue, Y: light_yellow,
     *  P: light_purple, C: light_cyan* ).
     * ```js
     * characters = [
     * `
     *  r rr
     * rrrrrr
     *  grr
     *  grr
     * rrrrrr
     * r rr
     * `,
     * ```
     * Pixel arts are assigned from 'a'. `char("a", 0, 0)` draws the character
     * defined by the first element of the `characters` array.
     *
     * `characters` array can also specify external image files as corresponding pixel art.
     * ```js
     * characters = [
     * "./jugglingchain/images/background.png",
     * "./jugglingchain/images/ball.png",
     * "./jugglingchain/images/arrow.png",
     * ]
     * ```
     *
     * @param str
     * @param x
     * @param y
     * @param options
     * @returns Information about objects that collided during drawing.
     */
    function char(str, x, y, options) {
        return letters(true, str, x, y, options);
    }
    function letters(isCharacter, str, x, y, options) {
        if (typeof x === "number") {
            if (typeof y === "number") {
                return print(str, x, y, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, options));
            }
            else {
                throw new Error(`${isCharacter ? "char" : "text"}(): expected numeric y when x is a number.`);
            }
        }
        else {
            return print(str, x.x, x.y, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, y));
        }
    }
    const dotCount = 6;
    const smallLetterDotCount = 4;
    const dotSize = 1;
    const letterSize = dotCount * dotSize;
    const smallLetterWidth = smallLetterDotCount * dotSize;
    let textImages;
    let smallTextImages;
    let characterImages;
    let cachedImages;
    let isCacheEnabled = false;
    let letterCanvas;
    let letterContext;
    let scaledLetterCanvas;
    let scaledLetterContext;
    const defaultOptions$3 = {
        color: "black",
        backgroundColor: "transparent",
        rotation: 0,
        mirror: { x: 1, y: 1 },
        scale: { x: 1, y: 1 },
        isSmallText: false,
        edgeColor: undefined,
        isCharacter: false,
        isCheckingCollision: false,
    };
    function init$7() {
        letterCanvas = document.createElement("canvas");
        letterCanvas.width = letterCanvas.height = letterSize;
        letterContext = letterCanvas.getContext("2d");
        scaledLetterCanvas = document.createElement("canvas");
        scaledLetterContext = scaledLetterCanvas.getContext("2d");
        textImages = textPatterns.map((lp, i) => createLetterImage(lp, String.fromCharCode(0x21 + i), false));
        smallTextImages = smallTextPatterns.map((lp, i) => createLetterImage(lp, String.fromCharCode(0x21 + i), false));
        characterImages = textPatterns.map((lp, i) => createLetterImage(lp, String.fromCharCode(0x21 + i), true));
        cachedImages = {};
    }
    function defineCharacters(pattern, startLetter) {
        const index = startLetter.charCodeAt(0) - 0x21;
        pattern.forEach((lp, i) => {
            characterImages[index + i] = createLetterImage(lp, String.fromCharCode(0x21 + index + i), true);
        });
    }
    function enableCache() {
        isCacheEnabled = true;
    }
    function print(_str, x, y, _options = {}) {
        const options = mergeDefaultOptions(_options);
        let str = _str;
        let px = x;
        let py = y;
        let bx;
        let collision = { isColliding: { rect: {}, text: {}, char: {} } };
        const lw = options.isSmallText ? smallLetterWidth : letterSize;
        for (let i = 0; i < str.length; i++) {
            if (i === 0) {
                const cca = str.charCodeAt(0);
                if (cca < 0x21 || cca > 0x7e) {
                    px = Math.floor(px - (letterSize / 2) * options.scale.x);
                    py = Math.floor(py - (letterSize / 2) * options.scale.y);
                }
                else {
                    const cc = cca - 0x21;
                    const li = options.isCharacter
                        ? characterImages[cc]
                        : options.isSmallText
                            ? smallTextImages[cc]
                            : textImages[cc];
                    px = Math.floor(px - (li.size.x / 2) * options.scale.x);
                    py = Math.floor(py - (li.size.y / 2) * options.scale.y);
                }
                bx = px;
            }
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
            px += lw * options.scale.x;
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
            const lw = options.isSmallText ? smallLetterWidth : letterSize;
            const xp = options.isSmallText ? 2 : 1;
            saveCurrentColor();
            setColor(options.backgroundColor);
            fillRect(x + xp, y, lw * options.scale.x, letterSize * options.scale.y);
            loadCurrentColor();
        }
        if (cca <= 0x20) {
            return { isColliding: { rect: {}, text: {}, char: {} } };
        }
        const cc = cca - 0x21;
        const li = options.isCharacter
            ? characterImages[cc]
            : options.isSmallText
                ? smallTextImages[cc]
                : textImages[cc];
        const rotation = wrap(options.rotation, 0, 4);
        if (options.color === "black" &&
            rotation === 0 &&
            options.mirror.x === 1 &&
            options.mirror.y === 1 &&
            options.edgeColor == null &&
            (!theme.isUsingPixi || (options.scale.x === 1 && options.scale.y === 1))) {
            return drawAndTestLetterImage(li, x, y, options.scale, options.isCheckingCollision, true);
        }
        const cacheIndex = JSON.stringify({ c, options });
        const ci = cachedImages[cacheIndex];
        if (ci != null) {
            return drawAndTestLetterImage(ci, x, y, options.scale, options.isCheckingCollision, options.color !== "transparent");
        }
        let isUsingScaled = false;
        const size = new Vector(letterSize, letterSize);
        let canvas = letterCanvas;
        let context = letterContext;
        if (li.size.x > letterSize || li.size.y > letterSize) {
            if (rotation === 0 || rotation === 2) {
                size.set(li.size.x, li.size.y);
            }
            else {
                const ms = Math.max(li.size.x, li.size.y);
                size.set(ms, ms);
            }
            canvas = document.createElement("canvas");
            canvas.width = size.x;
            canvas.height = size.y;
            context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
        }
        if (theme.isUsingPixi && (options.scale.x !== 1 || options.scale.y !== 1)) {
            scaledLetterCanvas.width = size.x * options.scale.x;
            scaledLetterCanvas.height = size.y * options.scale.y;
            scaledLetterContext.imageSmoothingEnabled = false;
            scaledLetterContext.scale(options.scale.x, options.scale.y);
            createLetterContext(scaledLetterContext, rotation, options, li.image, size);
            isUsingScaled = true;
        }
        context.clearRect(0, 0, size.x, size.y);
        createLetterContext(context, rotation, options, li.image, size);
        const hitBox = getHitBox(context, size, c, options.isCharacter);
        if (options.edgeColor != null) {
            canvas = addEdge(context, size, options.edgeColor);
            size.x += 2;
            size.y += 2;
        }
        let texture; //: PIXI.Texture;
        if (isCacheEnabled || theme.isUsingPixi) {
            const cachedImage = document.createElement("img");
            cachedImage.src = canvas.toDataURL();
            if (theme.isUsingPixi) {
                const textureImage = document.createElement("img");
                textureImage.src = (isUsingScaled ? scaledLetterCanvas : canvas).toDataURL();
                texture = PIXI.Texture.from(textureImage);
            }
            if (isCacheEnabled) {
                cachedImages[cacheIndex] = {
                    image: cachedImage,
                    texture,
                    hitBox,
                    size,
                };
            }
        }
        return drawAndTestLetterImage({ image: canvas, texture, hitBox, size }, x, y, options.scale, options.isCheckingCollision, options.color !== "transparent");
    }
    function addEdge(context, size, color) {
        const newWidth = size.x + 2;
        const newHeight = size.y + 2;
        const directions = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ];
        const edgeCanvas = document.createElement("canvas");
        edgeCanvas.width = newWidth;
        edgeCanvas.height = newHeight;
        const edgeContext = edgeCanvas.getContext("2d");
        edgeContext.imageSmoothingEnabled = false;
        edgeContext.drawImage(context.canvas, 1, 1);
        const imageData = edgeContext.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        edgeContext.fillStyle = colorToStyle(color);
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const idx = (y * newWidth + x) * 4;
                if (data[idx + 3] === 0) {
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < newWidth && ny >= 0 && ny < newHeight) {
                            const neighborIdx = (ny * newWidth + nx) * 4;
                            if (data[neighborIdx + 3] > 0) {
                                edgeContext.fillRect(x, y, 1, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return edgeCanvas;
    }
    function createLetterContext(context, rotation, options, image, size) {
        if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
            context.drawImage(image, 0, 0);
        }
        else {
            context.save();
            context.translate(size.x / 2, size.y / 2);
            context.rotate((Math.PI / 2) * rotation);
            if (options.mirror.x === -1 || options.mirror.y === -1) {
                context.scale(options.mirror.x, options.mirror.y);
            }
            context.drawImage(image, -size.x / 2, -size.y / 2);
            context.restore();
        }
        if (options.color !== "black") {
            context.globalCompositeOperation = "source-in";
            context.fillStyle = colorToStyle(options.color === "transparent" ? "black" : options.color);
            context.fillRect(0, 0, size.x, size.y);
            context.globalCompositeOperation = "source-over";
        }
    }
    function drawAndTestLetterImage(li, x, y, scale, isCheckCollision, isDrawing) {
        if (isDrawing) {
            if (scale.x === 1 && scale.y === 1) {
                drawLetterImage(li, x, y);
            }
            else {
                drawLetterImage(li, x, y, li.size.x * scale.x, li.size.y * scale.y);
            }
        }
        if (!isCheckCollision) {
            return;
        }
        const hitBox = {
            pos: { x: x + li.hitBox.pos.x * scale.x, y: y + li.hitBox.pos.y * scale.y },
            size: {
                x: li.hitBox.size.x * scale.x,
                y: li.hitBox.size.y * scale.y,
            },
            collision: li.hitBox.collision,
        };
        const collision = checkHitBoxes(hitBox);
        if (isDrawing) {
            hitBoxes.push(hitBox);
        }
        return collision;
    }
    function drawLetterImage(li, x, y, width, height) {
        if (theme.isUsingPixi) {
            endFill();
            graphics.beginTextureFill({
                texture: li.texture,
                matrix: new PIXI.Matrix().translate(x, y),
            });
            graphics.drawRect(x, y, width == null ? li.size.x : width, height == null ? li.size.y : height);
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
    function createLetterImage(pattern, c, isCharacter) {
        if (pattern.indexOf(".") >= 0 || pattern.indexOf("data:image/") == 0) {
            return createLetterImageFromFile(pattern, c);
        }
        let p = pattern.split("\n");
        p = p.slice(1, p.length - 1);
        let pw = 0;
        p.forEach((l) => {
            pw = Math.max(l.length, pw);
        });
        const xPadding = Math.max(Math.ceil((dotCount - pw) / 2), 0);
        const ph = p.length;
        const yPadding = Math.max(Math.ceil((dotCount - ph) / 2), 0);
        const size = new Vector(Math.max(dotCount, pw) * dotSize, Math.max(dotCount, ph) * dotSize);
        let canvas = letterCanvas;
        let context = letterContext;
        if (size.x > letterSize || size.y > letterSize) {
            canvas = document.createElement("canvas");
            canvas.width = size.x;
            canvas.height = size.y;
            context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
        }
        context.clearRect(0, 0, size.x, size.y);
        p.forEach((l, y) => {
            for (let x = 0; x < pw; x++) {
                const c = l.charAt(x);
                let ci = colorChars.indexOf(c);
                if (c !== "" && ci >= 1) {
                    context.fillStyle = colorToStyle(colors[ci]);
                    context.fillRect((x + xPadding) * dotSize, (y + yPadding) * dotSize, dotSize, dotSize);
                }
            }
        });
        const image = document.createElement("img");
        image.src = canvas.toDataURL();
        const hitBox = getHitBox(context, size, c, isCharacter);
        if (theme.isUsingPixi) {
            return { image, texture: PIXI.Texture.from(image), size, hitBox };
        }
        return { image, size, hitBox };
    }
    function createLetterImageFromFile(pattern, c) {
        const image = document.createElement("img");
        image.src = pattern;
        const size = new Vector();
        const hitBox = {
            pos: new Vector(),
            size: new Vector(),
            collision: { isColliding: { char: {}, text: {} } },
        };
        let result;
        if (theme.isUsingPixi) {
            result = {
                image,
                texture: PIXI.Texture.from(image),
                size: new Vector(),
                hitBox,
            };
        }
        else {
            result = { image, size, hitBox };
        }
        image.onload = () => {
            result.size.set(image.width * dotSize, image.height * dotSize);
            const canvas = document.createElement("canvas");
            canvas.width = result.size.x;
            canvas.height = result.size.y;
            const context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0, result.size.x, result.size.y);
            const canvasImage = document.createElement("img");
            canvasImage.src = canvas.toDataURL();
            result.image = canvasImage;
            result.hitBox = getHitBox(context, result.size, c, true);
            if (theme.isUsingPixi) {
                result.texture = PIXI.Texture.from(canvasImage);
            }
        };
        return result;
    }
    function getHitBox(context, size, c, isCharacter) {
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
        const d = context.getImageData(0, 0, size.x, size.y).data;
        let i = 0;
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
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
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
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
        let options = Object.assign(Object.assign({}, defaultOptions$3), _options);
        if (_options.scale != null) {
            options.scale = Object.assign(Object.assign({}, defaultOptions$3.scale), _options.scale);
        }
        if (_options.mirror != null) {
            options.mirror = Object.assign(Object.assign({}, defaultOptions$3.mirror), _options.mirror);
        }
        return options;
    }

    let isPressed$2 = false;
    let isJustPressed$2 = false;
    let isJustReleased$2 = false;
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
        "BrowserBack",
    ];
    let code;
    const defaultOptions$2 = {
        onKeyDown: undefined,
    };
    let options$2;
    let isKeyPressing = false;
    let isKeyPressed = false;
    let isKeyReleased = false;
    let pressingCode = {};
    let pressedCode = {};
    let releasedCode = {};
    function init$6(_options) {
        options$2 = Object.assign(Object.assign({}, defaultOptions$2), _options);
        code = fromEntities(codes.map((c) => [
            c,
            {
                isPressed: false,
                isJustPressed: false,
                isJustReleased: false,
            },
        ]));
        document.addEventListener("keydown", (e) => {
            isKeyPressing = isKeyPressed = true;
            pressingCode[e.code] = pressedCode[e.code] = true;
            if (options$2.onKeyDown != null) {
                options$2.onKeyDown();
            }
            if (e.code === "AltLeft" ||
                e.code === "AltRight" ||
                e.code === "ArrowRight" ||
                e.code === "ArrowDown" ||
                e.code === "ArrowLeft" ||
                e.code === "ArrowUp") {
                e.preventDefault();
            }
        });
        document.addEventListener("keyup", (e) => {
            isKeyPressing = false;
            isKeyReleased = true;
            pressingCode[e.code] = false;
            releasedCode[e.code] = true;
        });
    }
    function update$7() {
        isJustPressed$2 = !isPressed$2 && isKeyPressed;
        isJustReleased$2 = isPressed$2 && isKeyReleased;
        isKeyPressed = isKeyReleased = false;
        isPressed$2 = isKeyPressing;
        entries(code).forEach(([c, s]) => {
            s.isJustPressed = !s.isPressed && pressedCode[c];
            s.isJustReleased = s.isPressed && releasedCode[c];
            s.isPressed = !!pressingCode[c];
        });
        pressedCode = {};
        releasedCode = {};
    }
    function clearJustPressed$2() {
        isJustPressed$2 = false;
        isPressed$2 = true;
    }

    var keyboard = /*#__PURE__*/Object.freeze({
        __proto__: null,
        clearJustPressed: clearJustPressed$2,
        get code () { return code; },
        codes: codes,
        init: init$6,
        get isJustPressed () { return isJustPressed$2; },
        get isJustReleased () { return isJustReleased$2; },
        get isPressed () { return isPressed$2; },
        update: update$7
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

    const pos$1 = new Vector();
    let isPressed$1 = false;
    let isJustPressed$1 = false;
    let isJustReleased$1 = false;
    let defaultOptions$1 = {
        isDebugMode: false,
        anchor: new Vector(),
        padding: new Vector(),
        onPointerDownOrUp: undefined,
    };
    let screen;
    let pixelSize;
    let options$1;
    const debugRandom = new Random();
    const debugPos = new Vector();
    const debugMoveVel = new Vector();
    let debugIsDown = false;
    let cursorPos = new Vector();
    let isDown = false;
    let isClicked = false;
    let isReleased = false;
    function init$5(_screen, _pixelSize, _options) {
        options$1 = Object.assign(Object.assign({}, defaultOptions$1), _options);
        screen = _screen;
        pixelSize = new Vector(_pixelSize.x + options$1.padding.x * 2, _pixelSize.y + options$1.padding.y * 2);
        cursorPos.set(screen.offsetLeft + screen.clientWidth * (0.5 - options$1.anchor.x), screen.offsetTop + screen.clientWidth * (0.5 - options$1.anchor.y));
        if (options$1.isDebugMode) {
            debugPos.set(screen.offsetLeft + screen.clientWidth * (0.5 - options$1.anchor.x), screen.offsetTop + screen.clientWidth * (0.5 - options$1.anchor.y));
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
    function update$6() {
        calcPointerPos(cursorPos.x, cursorPos.y, pos$1);
        if (options$1.isDebugMode && !pos$1.isInRect(0, 0, pixelSize.x, pixelSize.y)) {
            updateDebug();
            pos$1.set(debugPos);
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
        v.x = Math.round(((x - screen.offsetLeft) / screen.clientWidth + options$1.anchor.x) *
            pixelSize.x -
            options$1.padding.x);
        v.y = Math.round(((y - screen.offsetTop) / screen.clientHeight + options$1.anchor.y) *
            pixelSize.y -
            options$1.padding.y);
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
        if (options$1.onPointerDownOrUp != null) {
            options$1.onPointerDownOrUp();
        }
    }
    function onMove(x, y) {
        cursorPos.set(x, y);
    }
    function onUp(e) {
        isDown = false;
        isReleased = true;
        if (options$1.onPointerDownOrUp != null) {
            options$1.onPointerDownOrUp();
        }
    }

    var pointer = /*#__PURE__*/Object.freeze({
        __proto__: null,
        clearJustPressed: clearJustPressed$1,
        init: init$5,
        get isJustPressed () { return isJustPressed$1; },
        get isJustReleased () { return isJustReleased$1; },
        get isPressed () { return isPressed$1; },
        pos: pos$1,
        update: update$6
    });

    /** A pressed position of mouse or touch screen. */
    let pos = new Vector();
    /** A variable that becomes `true` while the button is pressed. */
    let isPressed = false;
    /** A variable that becomes `true` when the button is just pressed. */
    let isJustPressed = false;
    /** A variable that becomes `true` when the button is just released. */
    let isJustReleased = false;
    /** @ignore */
    function init$4(onInputDownOrUp) {
        init$6({
            onKeyDown: onInputDownOrUp,
        });
        init$5(canvas, size, {
            onPointerDownOrUp: onInputDownOrUp,
            anchor: new Vector(0.5, 0.5),
        });
    }
    /** @ignore */
    function update$5() {
        update$7();
        update$6();
        pos = pos$1;
        isPressed = isPressed$2 || isPressed$1;
        isJustPressed = isJustPressed$2 || isJustPressed$1;
        isJustReleased = isJustReleased$2 || isJustReleased$1;
    }
    /** @ignore */
    function clearJustPressed() {
        clearJustPressed$2();
        clearJustPressed$1();
    }
    /** @ignore */
    function set(state) {
        pos.set(state.pos);
        isPressed = state.isPressed;
        isJustPressed = state.isJustPressed;
        isJustReleased = state.isJustReleased;
    }

    var input = /*#__PURE__*/Object.freeze({
        __proto__: null,
        clearJustPressed: clearJustPressed,
        init: init$4,
        get isJustPressed () { return isJustPressed; },
        get isJustReleased () { return isJustReleased; },
        get isPressed () { return isPressed; },
        get pos () { return pos; },
        set: set,
        update: update$5
    });

    const soundEffectTypeToString = {
        coin: "c",
        laser: "l",
        explosion: "e",
        powerUp: "p",
        hit: "h",
        jump: "j",
        select: "s",
        lucky: "u",
        random: "r",
        click: "i",
        synth: "y",
        tone: "t",
    };
    let audioContext;
    let isSoundEnabled = false;
    let audioSeed;
    let audioVolume;
    let isAlgoChipLibraryEnabled = false;
    let algoChipGainNode;
    exports.algoChipSession = void 0;
    let algoChipBgm;
    let algoChipBgmSeed;
    let algoChipSes = {};
    let disposeVisibilityController;
    let isSoundsSomeSoundsLibraryEnabled = false;
    let sssGainNode;
    let sssBgmTrack;
    let isAudioFilesEnabled = false;
    let isBgmAudioFileReady = false;
    let gainNodeForAudioFiles;
    let audioFilePlayInterval;
    let audioFileQuantize;
    let audioFileStates = {};
    let bgmName;
    let bgmVolume;
    async function init$3(options) {
        audioSeed = options.audioSeed;
        audioVolume = options.audioVolume;
        bgmName = options.bgmName;
        bgmVolume = options.bgmVolume;
        if (typeof AlgoChip !== "undefined" &&
            AlgoChip !== null &&
            typeof AlgoChipUtil !== "undefined" &&
            AlgoChipUtil !== null) {
            isAlgoChipLibraryEnabled = isSoundEnabled = true;
        }
        else if (typeof sss !== "undefined" && sss !== null) {
            isSoundsSomeSoundsLibraryEnabled = isSoundEnabled = true;
        }
        if (typeof audioFiles !== "undefined" && audioFiles != null) {
            isAudioFilesEnabled = isSoundEnabled = true;
        }
        if (!isSoundEnabled) {
            return false;
        }
        audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        if (isAudioFilesEnabled) {
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    audioContext.suspend();
                }
                else {
                    audioContext.resume();
                }
            });
            initForAudioFiles();
            setAudioFileVolume(0.1 * audioVolume);
            setAudioFileTempo(options.audioTempo);
            for (let audioName in audioFiles) {
                const a = loadAudioFile(audioName, audioFiles[audioName]);
                if (audioName === bgmName) {
                    a.isLooping = true;
                    isBgmAudioFileReady = true;
                }
            }
        }
        if (isAlgoChipLibraryEnabled) {
            algoChipGainNode = audioContext.createGain();
            algoChipGainNode.connect(audioContext.destination);
            exports.algoChipSession = AlgoChipUtil.createAudioSession({
                audioContext,
                gainNode: algoChipGainNode,
                workletBasePath: "https://abagames.github.io/algo-chip/worklets/",
            });
            await exports.algoChipSession.ensureReady();
            exports.algoChipSession.setBgmVolume(0.5 * audioVolume);
            disposeVisibilityController =
                AlgoChipUtil.createVisibilityController(exports.algoChipSession);
        }
        if (isSoundsSomeSoundsLibraryEnabled) {
            sssGainNode = audioContext.createGain();
            sssGainNode.connect(audioContext.destination);
            sss.init(audioSeed, audioContext, sssGainNode);
            sss.setVolume(0.1 * audioVolume);
            sss.setTempo(options.audioTempo);
        }
        return true;
    }
    function play$1(type, options) {
        if (isAudioFilesEnabled &&
            playAudioFile(type, options != null && options.volume != null ? options.volume : 1)) ;
        else if (exports.algoChipSession != null) {
            let t = type;
            let seed = audioSeed;
            if (t === "powerUp") {
                t = "powerup";
            }
            else if (t === "random" || t === "lucky") {
                t = "explosion";
                seed++;
            }
            let baseFrequency;
            if ((options === null || options === void 0 ? void 0 : options.freq) != null) {
                baseFrequency = options.freq;
            }
            else if ((options === null || options === void 0 ? void 0 : options.pitch) != null) {
                baseFrequency = 2 ** ((options.pitch - 69) / 12) * 440;
            }
            const seOptions = { seed, type: t, baseFrequency };
            const seKey = JSON.stringify(seOptions);
            if (algoChipSes[seKey] == null) {
                algoChipSes[seKey] = exports.algoChipSession.generateSe(seOptions);
            }
            exports.algoChipSession.playSe(algoChipSes[seKey], {
                volume: audioVolume * ((options === null || options === void 0 ? void 0 : options.volume) != null ? options === null || options === void 0 ? void 0 : options.volume : 1) * 0.7,
                duckingDb: -8,
                quantize: {
                    loopAware: true,
                    phase: "next",
                    quantizeTo: "half_beat",
                    fallbackTempo: 120,
                },
            });
        }
        else if (isSoundsSomeSoundsLibraryEnabled &&
            typeof sss.playSoundEffect === "function") {
            sss.playSoundEffect(type, options);
        }
        else if (isSoundsSomeSoundsLibraryEnabled) {
            sss.play(soundEffectTypeToString[type]);
        }
    }
    /** @ignore */
    function setSeed(seed) {
        audioSeed = seed;
        if (isSoundsSomeSoundsLibraryEnabled) {
            sss.setSeed(seed);
        }
    }
    /**
     * Play a background music
     */
    /** @ignore */
    async function playBgm() {
        if (isBgmAudioFileReady && playAudioFile(bgmName, bgmVolume)) ;
        else if (exports.algoChipSession != null) {
            if (algoChipBgm == null || algoChipBgmSeed != audioSeed) {
                algoChipBgmSeed = audioSeed;
                const random = new Random();
                random.setSeed(audioSeed);
                const calmEnergetic = random.get(-0.9, 0.9);
                const percussiveMelodic = random.get(-0.9, 0.9);
                algoChipBgm = await exports.algoChipSession.generateBgm({
                    seed: audioSeed,
                    lengthInMeasures: 32,
                    twoAxisStyle: { calmEnergetic, percussiveMelodic },
                    overrides: {
                        tempo: "medium",
                    },
                });
            }
            exports.algoChipSession.playBgm(algoChipBgm, { loop: true });
        }
        else if (isSoundsSomeSoundsLibraryEnabled &&
            typeof sss.generateMml === "function") {
            sssBgmTrack = sss.playMml(sss.generateMml(), {
                volume: bgmVolume,
            });
        }
        else if (isSoundsSomeSoundsLibraryEnabled) {
            sss.playBgm();
        }
    }
    /**
     * Stop a background music
     */
    /** @ignore */
    function stopBgm() {
        if (isBgmAudioFileReady) {
            stopAudioFile(bgmName);
        }
        else if (exports.algoChipSession != null) {
            exports.algoChipSession.stopBgm();
        }
        else if (sssBgmTrack != null) {
            sss.stopMml(sssBgmTrack);
        }
        else if (isSoundsSomeSoundsLibraryEnabled) {
            sss.stopBgm();
        }
    }
    function update$4() {
        if (isAudioFilesEnabled) {
            updateForAudioFiles();
        }
        if (isSoundsSomeSoundsLibraryEnabled) {
            sss.update();
        }
    }
    function resume() {
        if (audioContext != null) {
            audioContext.resume();
        }
        if (exports.algoChipSession != null) {
            exports.algoChipSession.resumeAudioContext();
        }
    }
    function unload() {
        if (isAudioFilesEnabled) {
            stopAllAudioFiles();
        }
        if (isAlgoChipLibraryEnabled) {
            disposeVisibilityController();
            if (exports.algoChipSession != null) {
                exports.algoChipSession.close();
            }
        }
    }
    function playAudioFile(name, _volume = 1) {
        const af = audioFileStates[name];
        if (af == null) {
            return false;
        }
        af.gainNode.gain.value = _volume;
        af.isPlaying = true;
        return true;
    }
    function updateForAudioFiles() {
        const currentTime = audioContext.currentTime;
        for (const name in audioFileStates) {
            const af = audioFileStates[name];
            if (!af.isReady || !af.isPlaying) {
                continue;
            }
            af.isPlaying = false;
            const time = getQuantizedTime(currentTime);
            if (af.playedTime == null || time > af.playedTime) {
                playLater(af, time);
                af.playedTime = time;
            }
        }
    }
    function stopAudioFile(name, when = undefined) {
        const af = audioFileStates[name];
        if (af.source == null) {
            return;
        }
        if (when == null) {
            af.source.stop();
        }
        else {
            af.source.stop(when);
        }
        af.source = undefined;
    }
    function stopAllAudioFiles(when = undefined) {
        if (!audioFileStates) {
            return;
        }
        for (const name in audioFileStates) {
            stopAudioFile(name, when);
        }
        audioFileStates = {};
    }
    function initForAudioFiles() {
        isAudioFilesEnabled = true;
        gainNodeForAudioFiles = audioContext.createGain();
        gainNodeForAudioFiles.connect(audioContext.destination);
        setAudioFileTempo();
        setAudioFileQuantize();
        setAudioFileVolume();
    }
    function loadAudioFile(key, url) {
        audioFileStates[key] = createBufferFromFile(url);
        return audioFileStates[key];
    }
    function setAudioFileTempo(tempo = 120) {
        audioFilePlayInterval = 60 / tempo;
    }
    function setAudioFileQuantize(noteLength = 8) {
        audioFileQuantize = noteLength > 0 ? 4 / noteLength : undefined;
    }
    function setAudioFileVolume(_volume = 0.1) {
        gainNodeForAudioFiles.gain.value = _volume;
    }
    function playLater(audio, when) {
        const bufferSourceNode = audioContext.createBufferSource();
        audio.source = bufferSourceNode;
        bufferSourceNode.buffer = audio.buffer;
        bufferSourceNode.loop = audio.isLooping;
        bufferSourceNode.start =
            bufferSourceNode.start || bufferSourceNode.noteOn;
        bufferSourceNode.connect(audio.gainNode);
        bufferSourceNode.start(when);
    }
    function createBufferFromFile(url) {
        const af = {
            buffer: undefined,
            source: undefined,
            gainNode: audioContext.createGain(),
            isPlaying: false,
            playedTime: undefined,
            isReady: false,
            isLooping: false,
        };
        af.gainNode.connect(gainNodeForAudioFiles);
        fetchAudioFile(url).then((buffer) => {
            af.buffer = buffer;
            af.isReady = true;
        });
        return af;
    }
    async function fetchAudioFile(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }
    function getQuantizedTime(time) {
        if (audioFileQuantize == null) {
            return time;
        }
        const interval = audioFilePlayInterval * audioFileQuantize;
        return interval > 0 ? Math.ceil(time / interval) * interval : time;
    }

    let _init$1;
    let _update$1;
    const targetFps = 68;
    const deltaTime = 1000 / targetFps;
    let nextFrameTime = 0;
    let textCacheEnableTicks = 10;
    let loopFrameRequestId;
    let isCapturing;
    async function init$2(__init, __update, _isCapturing) {
        _init$1 = __init;
        _update$1 = __update;
        isCapturing = _isCapturing;
        await _init$1();
        update$3();
    }
    function update$3() {
        loopFrameRequestId = requestAnimationFrame(update$3);
        const now = window.performance.now();
        if (now < nextFrameTime - targetFps / 12) {
            return;
        }
        nextFrameTime += deltaTime;
        if (nextFrameTime < now || nextFrameTime > now + deltaTime * 2) {
            nextFrameTime = now + deltaTime;
        }
        update$4();
        update$5();
        _update$1();
        if (isCapturing) {
            capture();
        }
        textCacheEnableTicks--;
        if (textCacheEnableTicks === 0) {
            enableCache();
        }
    }
    function stop$1() {
        if (loopFrameRequestId) {
            cancelAnimationFrame(loopFrameRequestId);
            loopFrameRequestId = undefined;
        }
    }

    let particles;
    const random$1 = new Random();
    function init$1() {
        particles = [];
    }
    function add(pos, count = 16, speed = 1, angle = 0, angleWidth = Math.PI * 2, edgeColor = undefined) {
        if (count < 1) {
            if (random$1.get() > count) {
                return;
            }
            count = 1;
        }
        for (let i = 0; i < count; i++) {
            const a = angle + random$1.get(angleWidth) - angleWidth / 2;
            const p = {
                pos: new Vector(pos),
                vel: new Vector(speed * random$1.get(0.5, 1), 0).rotate(a),
                color: currentColor,
                ticks: clamp(random$1.get(10, 20) * Math.sqrt(Math.abs(speed)), 10, 60),
                edgeColor,
            };
            particles.push(p);
        }
    }
    function update$2() {
        saveCurrentColor();
        particles = particles.filter((p) => {
            p.ticks--;
            if (p.ticks < 0) {
                return false;
            }
            p.pos.add(p.vel);
            p.vel.mul(0.98);
            const x = Math.floor(p.pos.x);
            const y = Math.floor(p.pos.y);
            if (p.edgeColor != null) {
                setColor(p.edgeColor);
                fillRect(x - 1, y - 1, 3, 3);
            }
            setColor(p.color);
            fillRect(x, y, 1, 1);
            return true;
        });
        loadCurrentColor();
    }

    /**
     * Draw a rectangle.
     * @param x An x-coordinate or `Vector` position of the top left corner.
     * @param y A y-coordinate of the top left corner.
     * @param width
     * @param height
     * @returns Information about objects that collided during drawing.
     */
    function rect(x, y, width, height) {
        return drawRect(false, x, y, width, height, "rect");
    }
    /**
     * Draw a box.
     * @param x An x-coordinate or `Vector` position of the center of the box.
     * @param y A y-coordinate of center of the box.
     * @param width
     * @param height
     * @returns Information about objects that collided during drawing.
     */
    function box(x, y, width, height) {
        return drawRect(true, x, y, width, height, "box");
    }
    /**
     * Draw a bar, which is a line specified by the center coordinates and length.
     * @param x An x-coordinate or `Vector` position of the center of the bar.
     * @param y A y-coordinate of center of the bar.
     * @param length
     * @param thickness
     * @param rotate Angle of the bar.
     * @param centerPosRatio A value from 0 to 1 that defines where the center coordinates are on the line, default: 0.5.
     * @returns Information about objects that collided during drawing.
     */
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
    /**
     * Draw a line.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param thickness
     * @returns Information about objects that collided during drawing.
     */
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
                throwLineParamsError("when x1 is a number, y1 must also be a number.");
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
                    throwLineParamsError("when x1 is a Vector and y1 is a number, x2 must be a number representing the new y-coordinate.");
                }
            }
            else {
                if (typeof x2 === "number") {
                    p.set(x1);
                    p2.set(y1);
                    thickness = x2;
                }
                else {
                    throwLineParamsError("when both endpoints are Vectors, the last argument must be the thickness (number).");
                }
            }
        }
        return drawLine(p, p2.sub(p), thickness);
    }
    /**
     * Draw an arc.
     * @param centerX
     * @param centerY
     * @param radius
     * @param thickness
     * @param angleFrom
     * @param angleTo
     * @returns Information about objects that collided during drawing.
     */
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
        ao = clamp(ao, 0, Math.PI * 2);
        if (ao < 0.01) {
            return;
        }
        const lc = clamp(Math.ceil(ao * Math.sqrt(radius * 0.25)), 1, 36);
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
            const c = drawLine(p1, o, thickness, true);
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
    function drawRect(isAlignCenter, x, y, width, height, fnName = "rect") {
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
                throwRectParamsError(fnName, "when x is a number, y must also be a number.");
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
                    throwRectParamsError(fnName, "when x is a Vector and y is a number, width must be a number.");
                }
            }
            else {
                return addRect(isAlignCenter, x.x, x.y, y.x, y.y);
            }
        }
    }
    function throwLineParamsError(message) {
        throw new Error(`line(): ${message}`);
    }
    function throwRectParamsError(fnName, message) {
        throw new Error(`${fnName}(): ${message}`);
    }
    function drawLine(p, l, thickness, isAddingToTmp = false) {
        let isDrawing = true;
        if (theme.name === "shape" || theme.name === "shapeDark") {
            if (currentColor !== "transparent") {
                drawLine$1(p.x, p.y, p.x + l.x, p.y + l.y, thickness);
            }
            isDrawing = false;
        }
        const t = Math.floor(clamp(thickness, 3, 10));
        const lx = Math.abs(l.x);
        const ly = Math.abs(l.y);
        const rn = clamp(Math.ceil(lx > ly ? lx / t : ly / t) + 1, 3, 99);
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
    function addRect(isAlignCenter, x, y, width, height, isAddingToTmp = false, _isDrawing = true) {
        let isDrawing = _isDrawing;
        if ((theme.name === "shape" || theme.name === "shapeDark") &&
            isDrawing &&
            currentColor !== "transparent") {
            if (isAlignCenter) {
                fillRect(x - width / 2, y - height / 2, width, height);
            }
            else {
                fillRect(x, y, width, height);
            }
            isDrawing = false;
        }
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

    /** @ignore */
    function get({ pos, size, text, isToggle = false, onClick = () => { }, isSmallText = true, }) {
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
            isSmallText,
        };
    }
    /** @ignore */
    function update$1(button) {
        const o = new Vector(pos).sub(button.pos);
        button.isHovered = o.isInRect(0, 0, button.size.x, button.size.y);
        if (button.isHovered && isJustPressed$1) {
            button.isPressed = true;
        }
        if (button.isPressed && !button.isHovered) {
            button.isPressed = false;
        }
        if (button.isPressed && isJustReleased$1) {
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
        saveCurrentColor();
        setColor(button.isPressed ? "blue" : "light_blue");
        rect(button.pos.x, button.pos.y, button.size.x, button.size.y);
        if (button.isToggle && !button.isSelected) {
            setColor("white");
            rect(button.pos.x + 1, button.pos.y + 1, button.size.x - 2, button.size.y - 2);
        }
        setColor(button.isHovered ? "black" : "blue");
        text(button.text, button.pos.x + 3, button.pos.y + 3, {
            isSmallText: button.isSmallText,
        });
        loadCurrentColor();
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
    function rewind$1(random) {
        const fs = frameStates.pop();
        const rs = fs.randomState;
        random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
        storedInput = {
            pos: new Vector(pos),
            isPressed: isPressed,
            isJustPressed: isJustPressed,
            isJustReleased: isJustReleased,
        };
        set(record.inputs.pop());
        return fs;
    }
    function getLastFrameState(random) {
        const fs = frameStates[frameStates.length - 1];
        const rs = fs.randomState;
        random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
        storedInput = {
            pos: new Vector(pos),
            isPressed: isPressed,
            isJustPressed: isJustPressed,
            isJustReleased: isJustReleased,
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

    const scale = 4;
    const recordingFps = 60;
    const mimeType = "video/webm;codecs=vp8,opus";
    const type = "video/webm";
    const fileName = "recording.webm";
    const videoBitsPerSecond = 100000 * scale;
    const masterVolume = 0.7;
    let mediaRecorder;
    let drawLoopFrameRequestId;
    function start(canvas, audioContext, gainNodes, logicalSize) {
        if (mediaRecorder != null) {
            return;
        }
        const virtualCanvas = document.createElement("canvas");
        virtualCanvas.width = logicalSize.x * scale;
        virtualCanvas.height = logicalSize.y * scale;
        const context = virtualCanvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        const drawLoop = () => {
            context.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, virtualCanvas.width, virtualCanvas.height);
            drawLoopFrameRequestId = requestAnimationFrame(drawLoop);
        };
        drawLoop();
        const stream = virtualCanvas.captureStream(recordingFps);
        const audioDestination = audioContext.createMediaStreamDestination();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = masterVolume;
        gainNodes.forEach((gn) => {
            if (gn == null) {
                return;
            }
            gn.connect(gainNode);
        });
        gainNode.connect(audioDestination);
        const audioStream = audioDestination.stream;
        const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
        ]);
        mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType,
            videoBitsPerSecond,
        });
        let recordedChunks = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
            recordedChunks = [];
        };
        mediaRecorder.start();
    }
    function stop() {
        if (mediaRecorder != null && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            mediaRecorder = undefined;
        }
        if (drawLoopFrameRequestId) {
            cancelAnimationFrame(drawLoopFrameRequestId);
            drawLoopFrameRequestId = undefined;
        }
    }
    function isRecording() {
        return mediaRecorder != null && mediaRecorder.state === "recording";
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
    const min = Math.min;
    const max = Math.max;
    /** A variable incremented by one every 1/60 of a second. */
    exports.ticks = 0;
    /** A variable that is one at the beginning of the game, two after 1 minute, and increasing by one every minute. */
    exports.difficulty = void 0;
    /** Game score. */
    exports.score = 0;
    /** Game time. */
    /** @ignore */
    exports.time = void 0;
    /** A variable that becomes `true` if the game is replaying. */
    /** @ignore */
    exports.isReplaying = false;
    /**
     * Get a random float value.
     * If **high** parameter isn't specified, return a value from 0 to **lowOrHigh**.
     * @param lowOrHigh
     * @param high
     * @returns
     */
    function rnd(lowOrHigh = 1, high) {
        return random.get(lowOrHigh, high);
    }
    /**
     * Get a random int value.
     * If **high** parameter isn't specified, return a value from 0 to **lowOrHigh**-1.
     * @param lowOrHigh
     * @param high
     * @returns
     */
    function rndi(lowOrHigh = 2, high) {
        return random.getInt(lowOrHigh, high);
    }
    /**
     * Get a random float value that becomes negative with a one-half probability.
     * If **high** parameter isn't specified, return a value from -**lowOrHigh** to **lowOrHigh**.
     * @param lowOrHigh
     * @param high
     * @returns
     */
    function rnds(lowOrHigh = 1, high) {
        return random.get(lowOrHigh, high) * random.getPlusOrMinus();
    }
    /**
     * Transition to the game-over state.
     * @param _gameOverText
     */
    function end(_gameOverText = "GAME OVER") {
        gameOverText = _gameOverText;
        if (currentOptions.isShowingTime) {
            exports.time = undefined;
        }
        initGameOver();
    }
    /**
     * Transition to the game complete state.
     * @param _gameOverText
     */
    /** @ignore */
    function complete(completeText = "COMPLETE") {
        gameOverText = completeText;
        initGameOver();
    }
    /**
     * Add a score point.
     * @param value Point to add.
     * @param x An x-coordinate or `Vector` position where added point is displayed.
     * @param y A y-coordinate where added point is displayed.
     */
    function addScore(value, x, y) {
        if (exports.isReplaying) {
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
        pos.x -=
            (str.length *
                (currentOptions.isUsingSmallText ? smallLetterWidth : letterSize)) /
                2;
        pos.y -= letterSize / 2;
        scoreBoards.push({
            str,
            pos,
            vy: -2,
            ticks: 30,
        });
    }
    /**
     * Set the color for drawing rectangles, particles, texts, and characters.
     * Setting the color prior to `char()` will recolor the pixel art.
     * Use color("black") to restore and use the original colors.
     *
     * When you specify a custom color palette, you can designate colors using
     * the index of that palette.
     * When color names like "red", "yellow" etc. are specified as arguments to
     * the `color()` function, it assigns the closest color from the color palette to
     * the original color.
     * @param colorNameOrColorIndex
     */
    function color(colorNameOrColorIndex) {
        setColor(colorNameOrColorIndex);
    }
    /**
     * Add particles.
     * @param x
     * @param y
     * @param optionsOrCount
     * angle: Angle of particles spreading \
     * angleWidth: The range of angles over which particles diffuse. If omitted, it spreads in a circular shape \
     * count: Count of particles \
     * speed: Speed of particles \
     * edgeColor: Color of the edge of particles
     */
    function particle(x, y, optionsOrCount, speed, angle, angleWidth) {
        let pos = new Vector();
        if (typeof x === "number") {
            pos.set(x, y);
            add$1(pos, optionsOrCount, speed, angle, angleWidth);
        }
        else {
            pos.set(x);
            add$1(pos, y, optionsOrCount, speed, angle);
        }
        function add$1(pos, optionsOrCount, speed, angle, angleWidth) {
            if (isObject(optionsOrCount)) {
                const o = optionsOrCount;
                add(pos, o.count, o.speed, o.angle, o.angleWidth, o.edgeColor);
            }
            else {
                add(pos, optionsOrCount, speed, angle, angleWidth);
            }
        }
    }
    /**
     * Return a `Vector` instance.
     * @param x
     * @param y
     * @returns
     */
    function vec(x, y) {
        return new Vector(x, y);
    }
    /**
     * Play a sound effect.
     * Specify in the type argument either a type defined in SoundEffectType or
     * a type defined in correspondence with external sound files in `audioFiles`.
     * ```js
     * audioFiles = {
     * bgm: "./jugglingchain/audios/bgm.mp3",
     * tap: "./jugglingchain/audios/tap.mp3",
     * crush: "./jugglingchain/audios/crush.mp3",
     * };
     * ```
     *
     * @param type
     * @param options
     * @param options.seed Random seed (default = 0)
     * @param options.numberOfSounds Number of simultaneous sounds (default = 2)
     * @param options.volume Sound volume (default = 1)
     * @param options.pitch MIDI note number
     * @param options.freq Frequency (Hz)
     * @param options.note Note string (e.g. "C4", "F#3", "Ab5")
     */
    function play(type, options) {
        if (!isWaitingRewind && !isRewinding) {
            play$1(type, options);
        }
    }
    /** @ignore */
    function startRecording() {
        start(canvas, audioContext, [gainNodeForAudioFiles, algoChipGainNode, sssGainNode], size);
    }
    /** @ignore */
    function stopRecording() {
        stop();
    }
    /**
     * Save and load game frame states. Used for realizing a rewind function.
     * @param frameState
     * @returns
     */
    /** @ignore */
    function frameState(frameState) {
        if (isWaitingRewind) {
            const rs = getLastFrameState(random);
            const bs = rs.baseState;
            exports.score = bs.score;
            exports.ticks = bs.ticks;
            return cloneDeep(rs.gameState);
        }
        else if (isRewinding) {
            const rs = rewind$1(random);
            const bs = rs.baseState;
            exports.score = bs.score;
            exports.ticks = bs.ticks;
            return rs.gameState;
        }
        else if (exports.isReplaying) {
            const rs = getFrameStateForReplay();
            return rs.gameState;
        }
        else if (state === "inGame") {
            const baseState = { score: exports.score, ticks: exports.ticks };
            recordFrameState(frameState, baseState, random);
        }
        return frameState;
    }
    /**
     * Rewind the game.
     */
    /** @ignore */
    function rewind() {
        if (isRewinding) {
            return;
        }
        if (!exports.isReplaying && currentOptions.isRewindEnabled) {
            initRewind();
        }
        else {
            end();
        }
    }
    const defaultOptions = {
        isPlayingBgm: false,
        isCapturing: false,
        isCapturingGameCanvasOnly: false,
        captureCanvasScale: 1,
        captureDurationSec: 5,
        isShowingScore: true,
        isShowingTime: false,
        isReplayEnabled: false,
        isRewindEnabled: false,
        isDrawingParticleFront: false,
        isDrawingScoreFront: false,
        isUsingSmallText: true,
        isMinifying: false,
        isSoundEnabled: true,
        viewSize: { x: 100, y: 100 },
        audioSeed: 0,
        seed: 0,
        audioVolume: 1,
        theme: "simple",
        colorPalette: undefined,
        textEdgeColor: {
            score: undefined,
            floatingScore: undefined,
            title: undefined,
            description: undefined,
            gameOver: undefined,
        },
        bgmName: "bgm",
        bgmVolume: 1,
        audioTempo: 120,
        isRecording: false,
    };
    const seedRandom = new Random();
    const random = new Random();
    let state;
    let updateFunc = {
        title: updateTitle,
        inGame: updateInGame,
        gameOver: updateGameOver,
        rewind: updateRewind,
        error: updateRuntimeError,
    };
    let hiScore = 0;
    let fastestTime;
    let isNoTitle = true;
    let currentOptions;
    let scoreBoards;
    let isWaitingRewind = false;
    let isRewinding = false;
    let rewindButton;
    let giveUpButton;
    let gameOverText;
    let gameScriptFile;
    let localStorageKey;
    let runtimeErrorLines;
    /** @ignore */
    function init(settings) {
        window.update = settings.update;
        window.title = settings.title;
        window.description = settings.description;
        window.characters = settings.characters;
        window.options = settings.options;
        window.audioFiles = settings.audioFiles;
        onLoad();
    }
    /** @ignore */
    function onLoad() {
        if (typeof options !== "undefined" && options != null) {
            currentOptions = Object.assign(Object.assign({}, defaultOptions), options);
        }
        else {
            currentOptions = defaultOptions;
        }
        if (currentOptions.isMinifying) {
            showMinifiedScript();
        }
        init$2(_init, _update, currentOptions.isCapturing);
    }
    /** @ignore */
    function onUnload() {
        stop$1();
        stopRecording();
        unload();
        window.update = undefined;
        window.title = undefined;
        window.description = undefined;
        window.characters = undefined;
        window.options = undefined;
        window.audioFiles = undefined;
    }
    async function _init() {
        const theme = {
            name: currentOptions.theme,
            isUsingPixi: false,
            isDarkColor: false,
        };
        if (currentOptions.theme !== "simple" && currentOptions.theme !== "dark") {
            theme.isUsingPixi = true;
        }
        if (currentOptions.theme === "pixel" ||
            currentOptions.theme === "shapeDark" ||
            currentOptions.theme === "crt" ||
            currentOptions.theme === "dark") {
            theme.isDarkColor = true;
        }
        const bodyBackground = theme.isDarkColor ? "#101010" : "#e0e0e0";
        const viewBackground = theme.isDarkColor ? "blue" : "white";
        init$9(theme.isDarkColor, currentOptions.colorPalette);
        init$8(currentOptions.viewSize, bodyBackground, viewBackground, currentOptions.isCapturing, currentOptions.isCapturingGameCanvasOnly, currentOptions.captureCanvasScale, currentOptions.captureDurationSec, theme);
        init$4(() => {
            resume();
        });
        init$7();
        let audioSeed = currentOptions.audioSeed + currentOptions.seed;
        if (typeof description !== "undefined" &&
            description != null &&
            description.trim().length > 0) {
            isNoTitle = false;
            audioSeed += getHash(description);
        }
        if (typeof title !== "undefined" &&
            title != null &&
            title.trim().length > 0) {
            isNoTitle = false;
            document.title = title;
            audioSeed += getHash(title);
            localStorageKey = `crisp-game-${encodeURIComponent(title)}-${audioSeed}`;
            hiScore = loadHighScore();
        }
        if (typeof characters !== "undefined" && characters != null) {
            defineCharacters(characters, "a");
        }
        if (currentOptions.isSoundEnabled) {
            currentOptions.isSoundEnabled = await init$3({
                audioSeed,
                audioVolume: currentOptions.audioVolume,
                audioTempo: currentOptions.audioTempo,
                bgmName: currentOptions.bgmName,
                bgmVolume: currentOptions.bgmVolume,
            });
        }
        setColor("black");
        if (isNoTitle) {
            initInGame();
            exports.ticks = 0;
        }
        else {
            initTitle();
        }
    }
    function _update() {
        if (state === "error") {
            updateRuntimeError();
            return;
        }
        exports.df = exports.difficulty = exports.ticks / 3600 + 1;
        exports.tc = exports.ticks;
        const prevScore = exports.score;
        const prevTime = exports.time;
        exports.sc = exports.score;
        const prevSc = exports.sc;
        exports.inp = {
            p: pos,
            ip: isPressed,
            ijp: isJustPressed,
            ijr: isJustReleased,
        };
        clear();
        try {
            updateFunc[state]();
        }
        catch (error) {
            handleUpdateError(error);
            return;
        }
        if (theme.isUsingPixi) {
            endFill();
            if (theme.name === "crt") {
                updateCrtFilter();
            }
        }
        exports.ticks++;
        if (exports.isReplaying) {
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
        init$1();
        const s = Math.floor(exports.score);
        if (s > hiScore) {
            hiScore = s;
        }
        if (currentOptions.isShowingTime && exports.time != null) {
            if (fastestTime == null || fastestTime > exports.time) {
                fastestTime = exports.time;
            }
        }
        exports.score = 0;
        exports.time = 0;
        scoreBoards = [];
        if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
            playBgm();
        }
        const randomSeed = seedRandom.getInt(999999999);
        random.setSeed(randomSeed);
        if (currentOptions.isReplayEnabled || currentOptions.isRewindEnabled) {
            initRecord(randomSeed);
            initFrameStates();
            exports.isReplaying = false;
        }
    }
    function updateInGame() {
        clear$1();
        if (!currentOptions.isDrawingParticleFront) {
            update$2();
        }
        if (!currentOptions.isDrawingScoreFront) {
            updateScoreBoards();
        }
        if (currentOptions.isReplayEnabled || currentOptions.isRewindEnabled) {
            recordInput({
                pos: vec(pos),
                isPressed: isPressed,
                isJustPressed: isJustPressed,
                isJustReleased: isJustReleased,
            });
        }
        if (typeof update === "function") {
            update();
        }
        if (currentOptions.isDrawingParticleFront) {
            update$2();
        }
        if (currentOptions.isDrawingScoreFront) {
            updateScoreBoards();
        }
        drawScoreOrTime();
        if (currentOptions.isShowingTime && exports.time != null) {
            exports.time++;
        }
        if (currentOptions.isRecording && !isRecording()) {
            startRecording();
        }
    }
    function initTitle() {
        state = "title";
        exports.ticks = -1;
        init$1();
        clear$1();
        if (isRecorded()) {
            initReplay(random);
            exports.isReplaying = true;
        }
    }
    function updateTitle() {
        if (isJustPressed) {
            initInGame();
            return;
        }
        clear$1();
        if (currentOptions.isReplayEnabled && isRecorded()) {
            replayInput();
            exports.inp = {
                p: pos,
                ip: isPressed,
                ijp: isJustPressed,
                ijr: isJustReleased,
            };
            if (!currentOptions.isDrawingParticleFront) {
                update$2();
            }
            update();
            if (currentOptions.isDrawingParticleFront) {
                update$2();
            }
        }
        drawScoreOrTime();
        if (typeof title !== "undefined" && title != null) {
            let maxLineLength = 0;
            title.split("\n").forEach((l) => {
                if (l.length > maxLineLength) {
                    maxLineLength = l.length;
                }
            });
            const x = Math.floor((size.x - maxLineLength * letterSize) / 2);
            title.split("\n").forEach((l, i) => {
                print(l, x, Math.floor(size.y * 0.25) + i * letterSize, {
                    edgeColor: currentOptions.textEdgeColor.title,
                });
            });
        }
        if (typeof description !== "undefined" && description != null) {
            let maxLineLength = 0;
            description.split("\n").forEach((l) => {
                if (l.length > maxLineLength) {
                    maxLineLength = l.length;
                }
            });
            const lw = currentOptions.isUsingSmallText ? smallLetterWidth : letterSize;
            const x = Math.floor((size.x - maxLineLength * lw) / 2);
            description.split("\n").forEach((l, i) => {
                print(l, x, Math.floor(size.y / 2) + i * letterSize, {
                    isSmallText: currentOptions.isUsingSmallText,
                    edgeColor: currentOptions.textEdgeColor.description,
                });
            });
        }
    }
    function initGameOver() {
        state = "gameOver";
        if (!exports.isReplaying) {
            clearJustPressed();
        }
        exports.ticks = -1;
        drawGameOver();
        if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
            stopBgm();
        }
        const s = Math.floor(exports.score);
        if (s > hiScore) {
            saveHighScore(s);
        }
    }
    function updateGameOver() {
        if (exports.ticks === 0 && !theme.isUsingPixi) {
            drawGameOver();
        }
        if ((exports.isReplaying || exports.ticks > 20) && isJustPressed) {
            stopRecorder();
            initInGame();
        }
        else if (exports.ticks === (currentOptions.isReplayEnabled ? 120 : 300) &&
            !isNoTitle) {
            stopRecorder();
            initTitle();
        }
    }
    function stopRecorder() {
        if (!currentOptions.isRecording || exports.isReplaying) {
            return;
        }
        stopRecording();
    }
    function drawGameOver() {
        if (exports.isReplaying) {
            return;
        }
        print(gameOverText, Math.floor((size.x - gameOverText.length * letterSize) / 2), Math.floor(size.y / 2), { edgeColor: currentOptions.textEdgeColor.gameOver });
    }
    function initRewind() {
        state = "rewind";
        isWaitingRewind = true;
        rewindButton = get({
            pos: { x: size.x - 39, y: 11 },
            size: { x: 36, y: 7 },
            text: "Rewind",
            isSmallText: currentOptions.isUsingSmallText,
        });
        giveUpButton = get({
            pos: { x: size.x - 39, y: size.y - 19 },
            size: { x: 36, y: 7 },
            text: "GiveUp",
            isSmallText: currentOptions.isUsingSmallText,
        });
        if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
            stopBgm();
        }
        if (theme.isUsingPixi) {
            draw(rewindButton);
            draw(giveUpButton);
        }
    }
    function updateRewind() {
        clear$1();
        update();
        drawScoreOrTime();
        restoreInput();
        if (isRewinding) {
            draw(rewindButton);
            if (isFrameStateEmpty() || !isPressed) {
                stopRewind();
            }
        }
        else {
            update$1(rewindButton);
            update$1(giveUpButton);
            if (rewindButton.isPressed) {
                isRewinding = true;
                isWaitingRewind = false;
            }
        }
        if (giveUpButton.isPressed) {
            isWaitingRewind = isRewinding = false;
            end();
        }
        if (currentOptions.isShowingTime && exports.time != null) {
            exports.time++;
        }
    }
    function stopRewind() {
        isRewinding = false;
        state = "inGame";
        init$1();
        if (currentOptions.isPlayingBgm && currentOptions.isSoundEnabled) {
            playBgm();
        }
    }
    function drawScoreOrTime() {
        if (currentOptions.isShowingTime) {
            drawTime(exports.time, 3, 3);
            drawTime(fastestTime, size.x -
                7 * (currentOptions.isUsingSmallText ? smallLetterWidth : letterSize), 3);
        }
        else if (currentOptions.isShowingScore) {
            print(`${Math.floor(exports.score)}`, 3, 3, {
                isSmallText: currentOptions.isUsingSmallText,
                edgeColor: currentOptions.textEdgeColor.score,
            });
            const hs = `HI ${hiScore}`;
            print(hs, size.x -
                hs.length *
                    (currentOptions.isUsingSmallText ? smallLetterWidth : letterSize), 3, {
                isSmallText: currentOptions.isUsingSmallText,
                edgeColor: currentOptions.textEdgeColor.score,
            });
        }
    }
    function handleUpdateError(error) {
        console.error("Error inside update():", error);
        if (state === "error" && runtimeErrorLines != null) {
            updateRuntimeError();
            return;
        }
        runtimeErrorLines = createRuntimeErrorLines(error);
        state = "error";
        stopBgmForError();
        updateRuntimeError();
    }
    function updateRuntimeError() {
        if (runtimeErrorLines == null || runtimeErrorLines.length === 0) {
            runtimeErrorLines = ["UPDATE ERROR", "See console for details."];
        }
        const optionsForText = currentOptions !== null && currentOptions !== void 0 ? currentOptions : defaultOptions;
        const lw = optionsForText.isUsingSmallText ? smallLetterWidth : letterSize;
        const totalHeight = runtimeErrorLines.length * letterSize;
        const startY = Math.max(0, Math.floor((size.y - totalHeight) / 2));
        safeResetViewColor();
        clear$1();
        runtimeErrorLines.forEach((line, index) => {
            const x = Math.max(0, Math.floor((size.x - line.length * lw) / 2));
            print(line, x, startY + index * letterSize, {
                isSmallText: optionsForText.isUsingSmallText,
                edgeColor: optionsForText.textEdgeColor.gameOver,
            });
        });
    }
    function safeResetViewColor() {
        try {
            setColor("black");
        }
        catch (
        /** ignore */
        _error) {
            // Ignore; we simply leave the previous color in place.
        }
    }
    function stopBgmForError() {
        if ((currentOptions === null || currentOptions === void 0 ? void 0 : currentOptions.isPlayingBgm) &&
            currentOptions.isSoundEnabled &&
            typeof stopBgm === "function") {
            stopBgm();
        }
    }
    function createRuntimeErrorLines(error) {
        const message = extractRuntimeErrorMessage(error);
        const lines = wrapRuntimeErrorMessage(message);
        const fullLines = ["UPDATE ERROR", ...lines];
        fullLines.push("See console for details.");
        return fullLines;
    }
    function extractRuntimeErrorMessage(error) {
        var _a, _b;
        if (error instanceof Error) {
            const message = (_a = error.message) === null || _a === void 0 ? void 0 : _a.trim();
            if (error.name && message && message.length > 0) {
                return `${error.name}: ${message}`;
            }
            return (_b = message !== null && message !== void 0 ? message : error.name) !== null && _b !== void 0 ? _b : "Unknown error";
        }
        if (typeof error === "string") {
            return error;
        }
        try {
            return JSON.stringify(error);
        }
        catch (
        /** ignore */
        _) {
            return "Unknown error";
        }
    }
    function wrapRuntimeErrorMessage(message) {
        const optionsForText = currentOptions !== null && currentOptions !== void 0 ? currentOptions : defaultOptions;
        const lw = optionsForText.isUsingSmallText ? smallLetterWidth : letterSize;
        const maxCharsPerLine = Math.max(6, Math.floor(size.x / lw) - 2);
        const maxLines = 4;
        const normalizedSegments = message
            .split(/\r?\n/)
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);
        if (normalizedSegments.length === 0) {
            normalizedSegments.push("Unknown error");
        }
        const lines = [];
        normalizedSegments.forEach((segment) => {
            if (lines.length >= maxLines) {
                return;
            }
            lines.push(...wrapSegment(segment, maxCharsPerLine, maxLines - lines.length));
        });
        return lines;
    }
    function wrapSegment(segment, maxCharsPerLine, remainingLineBudget) {
        if (segment.length <= maxCharsPerLine) {
            return [segment];
        }
        const results = [];
        let rest = segment;
        while (rest.length > 0 && results.length < remainingLineBudget) {
            if (rest.length <= maxCharsPerLine) {
                results.push(rest);
                rest = "";
                break;
            }
            let splitIndex = rest.lastIndexOf(" ", maxCharsPerLine);
            if (splitIndex <= 0) {
                splitIndex = maxCharsPerLine;
            }
            results.push(rest.slice(0, splitIndex).trim());
            rest = rest.slice(splitIndex).trim();
        }
        if (rest.length > 0 && results.length < remainingLineBudget) {
            results.push(rest);
        }
        return results;
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
        print(ts, x, y, {
            isSmallText: currentOptions.isUsingSmallText,
            edgeColor: currentOptions.textEdgeColor.score,
        });
    }
    function getPaddedNumber(v, digit) {
        return ("0000" + v).slice(-digit);
    }
    function updateScoreBoards() {
        saveCurrentColor();
        setColor("black");
        scoreBoards = scoreBoards.filter((sb) => {
            print(sb.str, sb.pos.x, sb.pos.y, {
                isSmallText: currentOptions.isUsingSmallText,
                edgeColor: currentOptions.textEdgeColor.floatingScore,
            });
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
    function saveHighScore(highScore) {
        if (localStorageKey == null) {
            return;
        }
        try {
            const gameState = { highScore };
            localStorage.setItem(localStorageKey, JSON.stringify(gameState));
        }
        catch (error) {
            console.warn("Unable to save high score:", error);
        }
    }
    function loadHighScore() {
        try {
            const gameStateString = localStorage.getItem(localStorageKey);
            if (gameStateString) {
                const gameState = JSON.parse(gameStateString);
                return gameState.highScore;
            }
        }
        catch (error) {
            console.warn("Unable to load high score:", error);
        }
        return 0;
    }
    function isObject(arg) {
        return arg != null && arg.constructor === Object;
    }
    /** @ignore */
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
    /** @ignore */
    exports.inp = void 0;
    /** @ignore */
    function clr(...args) {
        return color.apply(this, args);
    }
    /** @ignore */
    function ply(...args) {
        return play.apply(this, args);
    }
    /** @ignore */
    function tms(...args) {
        return times.apply(this, args);
    }
    /** @ignore */
    function rmv(...args) {
        return remove.apply(this.args);
    }
    /** @ignore */
    exports.tc = void 0;
    /** @ignore */
    exports.df = void 0;
    /** @ignore */
    exports.sc = void 0;
    /** @ignore */
    const tr = "transparent";
    /** @ignore */
    const wh = "white";
    /** @ignore */
    const rd = "red";
    /** @ignore */
    const gr = "green";
    /** @ignore */
    const yl = "yellow";
    /** @ignore */
    const bl = "blue";
    /** @ignore */
    const pr = "purple";
    /** @ignore */
    const cy = "cyan";
    /** @ignore */
    const lc = "black";
    /** @ignore */
    const cn = "coin";
    /** @ignore */
    const ls = "laser";
    /** @ignore */
    const ex = "explosion";
    /** @ignore */
    const pw = "powerUp";
    /** @ignore */
    const ht = "hit";
    /** @ignore */
    const jm = "jump";
    /** @ignore */
    const sl = "select";
    /** @ignore */
    const uc = "lucky";
    /** @ignore */
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
    // Test-only helper functions (guarded by NODE_ENV check)
    // These allow testing of critical code paths that would otherwise be untestable
    /**
     * Test helper to set the isReplaying state.
     * This enables testing of replay guard behavior in functions like addScore.
     * @ignore
     */
    function __testSetReplaying(value) {
        if (process.env.NODE_ENV === "test") {
            exports.isReplaying = value;
        }
    }
    /**
     * Test helper to initialize currentOptions.
     * This enables testing of option-dependent behavior like isUsingSmallText.
     * @ignore
     */
    function __testInitOptions(options) {
        if (process.env.NODE_ENV === "test") {
            currentOptions = Object.assign(Object.assign({}, defaultOptions), options);
            // Initialize scoreBoards if it's not already initialized
            if (!scoreBoards) {
                scoreBoards = [];
            }
        }
    }

    exports.PI = PI;
    exports.__testInitOptions = __testInitOptions;
    exports.__testSetReplaying = __testSetReplaying;
    exports.abs = abs;
    exports.addGameScript = addGameScript;
    exports.addScore = addScore;
    exports.addWithCharCode = addWithCharCode;
    exports.arc = arc;
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
    exports.init = init;
    exports.input = input;
    exports.jm = jm;
    exports.keyboard = keyboard;
    exports.lc = lc;
    exports.line = line;
    exports.ls = ls;
    exports.max = max;
    exports.min = min;
    exports.minifyReplaces = minifyReplaces;
    exports.onLoad = onLoad;
    exports.onUnload = onUnload;
    exports.particle = particle;
    exports.play = play;
    exports.playBgm = playBgm;
    exports.ply = ply;
    exports.pointer = pointer;
    exports.pow = pow;
    exports.pr = pr;
    exports.pw = pw;
    exports.range = range;
    exports.rd = rd;
    exports.rect = rect;
    exports.remove = remove;
    exports.rewind = rewind;
    exports.rmv = rmv;
    exports.rnd = rnd;
    exports.rndi = rndi;
    exports.rnds = rnds;
    exports.round = round;
    exports.setAudioSeed = setSeed;
    exports.sin = sin;
    exports.sl = sl;
    exports.sqrt = sqrt;
    exports.startRecording = startRecording;
    exports.stopBgm = stopBgm;
    exports.stopRecording = stopRecording;
    exports.text = text;
    exports.times = times;
    exports.tms = tms;
    exports.tr = tr;
    exports.uc = uc;
    exports.updateButton = update$1;
    exports.vec = vec;
    exports.wh = wh;
    exports.wrap = wrap;
    exports.yl = yl;

})(window || {});
