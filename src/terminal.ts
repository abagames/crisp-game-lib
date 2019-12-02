import * as text from "./text";
import { range } from "./math";
import { Vector, VectorLike } from "./vector";

export class Terminal {
  size = new Vector();
  charGrid: string[][];
  colorGrid: string[][];
  backgroundColorGrid: string[][];
  rotationGrid: string[][];
  symbolGrid: string[][];

  constructor(_size: VectorLike) {
    this.size.set(_size);
    this.charGrid = range(this.size.x).map(() =>
      range(this.size.y).map(() => undefined)
    );
    this.colorGrid = range(this.size.x).map(() =>
      range(this.size.y).map(() => undefined)
    );
    this.backgroundColorGrid = range(this.size.x).map(() =>
      range(this.size.y).map(() => undefined)
    );
    this.rotationGrid = range(this.size.x).map(() =>
      range(this.size.y).map(() => undefined)
    );
    this.symbolGrid = range(this.size.x).map(() =>
      range(this.size.y).map(() => undefined)
    );
  }

  print(_str: string, _x: number, _y: number, options: text.Options = {}) {
    let x = Math.floor(_x);
    let y = Math.floor(_y);
    const bx = x;
    let colorLines =
      options.colorPattern != null
        ? options.colorPattern.split("\n")
        : undefined;
    const backgroundColorLines =
      options.backgroundColorPattern != null
        ? options.backgroundColorPattern.split("\n")
        : undefined;
    const rotationLines =
      options.rotationPattern != null
        ? options.rotationPattern.split("\n")
        : undefined;
    const symbolLines =
      options.symbolPattern != null
        ? options.symbolPattern.split("\n")
        : undefined;
    let str = _str;
    if (options.charAndColorPattern != null) {
      const [_lines, _colorLines] = text.getColorLines(
        options.charAndColorPattern
      );
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
          : text.getCharFromLines(colorLines, lx, ly);
      this.backgroundColorGrid[x][y] =
        options.backgroundColor != null
          ? options.backgroundColor
          : text.getCharFromLines(backgroundColorLines, lx, ly);
      this.rotationGrid[x][y] =
        options.rotation != null
          ? options.rotation
          : text.getCharFromLines(rotationLines, lx, ly);
      this.symbolGrid[x][y] =
        options.symbol != null
          ? options.symbol
          : text.getCharFromLines(symbolLines, lx, ly);
      x++;
      lx++;
    }
  }

  getCharAt(_x: number, _y: number) {
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
    return { char, options: text.getCharOption(cg, bg, rg, sg) };
  }

  setCharAt(_x: number, _y: number, char: string, options?: text.CharOptions) {
    if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
      return;
    }
    const x = Math.floor(_x);
    const y = Math.floor(_y);
    this.charGrid[x][y] = char;
    if (options == null) {
      this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[
        x
      ][y] = undefined;
      return;
    }
    this.colorGrid[x][y] = options.color;
    this.backgroundColorGrid[x][y] = options.backgroundColor;
    if (options.angleIndex == null) {
      this.rotationGrid[x][y] = undefined;
    } else {
      let ri = options.angleIndex;
      if (options.isMirrorX) {
        ri |= 4;
      }
      if (options.isMirrorY) {
        ri |= 8;
      }
      this.rotationGrid[x][y] = text.rotationChars.charAt(ri);
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
        text.printChar(c, x * text.letterSize, y * text.letterSize, {
          ...text.getCharOption(cg, bg, rg, sg),
          ...{ scale: 1, alpha: 1 }
        });
      }
    }
  }

  clear() {
    for (let x = 0; x < this.size.x; x++) {
      for (let y = 0; y < this.size.y; y++) {
        this.charGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[
          x
        ][y] = this.rotationGrid[x][y] = this.symbolGrid[x][y] = undefined;
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
      this.charGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][
        y
      ] = this.rotationGrid[x][y] = this.symbolGrid[x][y] = undefined;
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
