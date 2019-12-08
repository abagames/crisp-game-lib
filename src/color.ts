import { context as viewContext } from "./view";

export let rgbObjects: { r: number; g: number; b: number }[];
export const colors = [
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
  "light_black"
];
export type Color =
  | "transparent"
  | "white"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "purple"
  | "cyan"
  | "black"
  | "light_red"
  | "light_green"
  | "light_yellow"
  | "light_blue"
  | "light_purple"
  | "light_cyan"
  | "light_black";
export let currentColor: Color;
export const colorChars = "twrgybpclRGYBPCL";

const rgbNumbers = [
  undefined,
  0xeeeeee,
  0xe91e63,
  0x4caf50,
  0xffeb3b,
  0x3f51b5,
  0x9c27b0,
  0x03a9f4,
  0x616161
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
      r: Math.floor(
        rgbObjects[1].r - (rgbObjects[1].r - ((n & 0xff0000) >> 16)) * 0.5
      ),
      g: Math.floor(
        rgbObjects[1].r - (rgbObjects[1].r - ((n & 0xff00) >> 8)) * 0.5
      ),
      b: Math.floor(rgbObjects[1].r - (rgbObjects[1].r - (n & 0xff)) * 0.5)
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
    : viewContext
  ).fillStyle = `rgb(${c.r},${c.g},${c.b})`;
}
