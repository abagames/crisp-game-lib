import * as view from "./view";

export let rgbObjects: { r: number; g: number; b: number }[];
export const colors = [
  "transparent",
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "purple",
  "cyan",
  "white",
  "dark_red",
  "dark_green",
  "dark_yellow",
  "dark_blue",
  "dark_purple",
  "dark_cyan",
  "dark_white"
];
export type Color =
  | "transparent"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "purple"
  | "cyan"
  | "white"
  | "dark_red"
  | "dark_green"
  | "dark_yellow"
  | "dark_blue"
  | "dark_purple"
  | "dark_cyan"
  | "dark_white";
export let currentColor: Color;
export const colorChars = "tlrgybpcwRGYBPCW";

const rgbNumbers = [
  undefined,
  0x616161,
  0xe91e63,
  0x4caf50,
  0xffeb3b,
  0x3f51b5,
  0x9c27b0,
  0x03a9f4,
  0xeeeeee
];

export function init() {
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

export function setColor(colorName: Color, isSettingCurrent = true, context?) {
  if (isSettingCurrent) {
    currentColor = colorName;
  }
  const c = rgbObjects[colors.indexOf(colorName)];
  (context != null
    ? context
    : view.context
  ).fillStyle = `rgb(${c.r},${c.g},${c.b})`;
}
