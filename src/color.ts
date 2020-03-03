import { context as viewContext } from "./view";
import { fromEntities, entries } from "./util";

type RgbValues = {
  [key in Color]: { r: number; g: number; b: number; a: number };
};
export let values: RgbValues;
type RgbStyles = { [key in Color]: string };
export let styles: RgbStyles;
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
] as const;
export type Color = typeof colors[number];
export let currentColor: Color;
export const colorChars = "twrgybpclRGYBPCL";

const rgbNumbers = [
  0xeeeeee,
  0xe91e63,
  0x4caf50,
  0xffc107,
  0x3f51b5,
  0x9c27b0,
  0x03a9f4,
  0x616161
];

export function init() {
  const [wr, wb, wg] = getRgb(0);
  values = fromEntities(
    colors.map((c, i) => {
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
          a: 1
        }
      ];
    })
  ) as RgbValues;
  styles = fromEntities(
    entries(values).map(e => {
      const k = e[0];
      const v = e[1];
      const s =
        v.a < 1
          ? `rgba(${v.r},${v.g},${v.b},${v.a})`
          : `rgb(${v.r},${v.g},${v.b})`;
      return [k, s];
    })
  ) as RgbStyles;
}

function getRgb(i: number) {
  const n = rgbNumbers[i];
  return [(n & 0xff0000) >> 16, (n & 0xff00) >> 8, n & 0xff];
}

export function setColor(colorName: Color, isSettingCurrent = true, context?) {
  if (isSettingCurrent) {
    currentColor = colorName;
  }
  (context != null ? context : viewContext).fillStyle = styles[colorName];
}
