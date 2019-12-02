import * as view from "./view";

export let rgbObjects: { r: number; g: number; b: number }[];
export const colorChars = "tlrgybpcwRGYBPCW";
export type ColorChar =
  | "t"
  | "l"
  | "r"
  | "g"
  | "y"
  | "b"
  | "p"
  | "c"
  | "w"
  | "R"
  | "G"
  | "Y"
  | "B"
  | "P"
  | "C"
  | "W";
export const colors = [
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
export type Color =
  | "transparent"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "purple"
  | "cyan"
  | "white";
export let currentColor: Color;

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

export function setColor(colorName: Color) {
  currentColor = colorName;
  const f = rgbObjects[colors.indexOf(colorName)];
  view.context.fillStyle = `rgb(${f.r},${f.g},${f.b})`;
}
