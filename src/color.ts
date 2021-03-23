import { fromEntities } from "./util";

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
  "light_black",
] as const;
export type Color = typeof colors[number];
export const colorChars = "twrgybpclRGYBPCL";
type RgbValues = {
  [key in Color]: { r: number; g: number; b: number; a: number };
};
let values: RgbValues;

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

export function init(isDarkColor: boolean) {
  const [wr, wb, wg] = getRgb(0, isDarkColor);
  values = fromEntities(
    colors.map((c, i) => {
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
    })
  ) as RgbValues;
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

function getRgb(i: number, isDarkColor: boolean) {
  if (isDarkColor) {
    if (i === 0) {
      i = 7;
    } else if (i === 7) {
      i = 0;
    }
  }
  const n = rgbNumbers[i];
  return [(n & 0xff0000) >> 16, (n & 0xff00) >> 8, n & 0xff];
}

export function colorToNumber(colorName: Color, ratio = 1) {
  const v = values[colorName];
  return (
    (Math.floor(v.r * ratio) << 16) |
    (Math.floor(v.g * ratio) << 8) |
    Math.floor(v.b * ratio)
  );
}

export function colorToStyle(colorName: Color, ratio = 1) {
  const v = values[colorName];
  const r = Math.floor(v.r * ratio);
  const g = Math.floor(v.g * ratio);
  const b = Math.floor(v.b * ratio);
  return v.a < 1 ? `rgba(${r},${g},${b},${v.a})` : `rgb(${r},${g},${b})`;
}
