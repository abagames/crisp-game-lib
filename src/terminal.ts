import * as letter from "./letter";
import { range } from "./util";
import { Vector, VectorLike } from "./vector";
import { Color } from "./color";

export class Terminal {
  size = new Vector();
  letterGrid: string[][];
  colorGrid: Color[][];
  backgroundColorGrid: Color[][];
  rotationGrid: number[][];
  characterGrid: boolean[][];

  constructor(_size: VectorLike) {
    this.size.set(_size);
    this.letterGrid = range(this.size.x).map(() =>
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
    this.characterGrid = range(this.size.x).map(() =>
      range(this.size.y).map(() => undefined)
    );
  }

  print(str: string, _x: number, _y: number, _options: letter.Options = {}) {
    const options: letter.Options = { ...letter.defaultOptions, ..._options };
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

  getCharAt(_x: number, _y: number) {
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

  setCharAt(_x: number, _y: number, char: string, _options?: letter.Options) {
    if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
      return;
    }
    const options: letter.Options = { ...letter.defaultOptions, ..._options };
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
        letter.printChar(c, x * letter.letterSize, y * letter.letterSize, {
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
        this.letterGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[
          x
        ][y] = this.rotationGrid[x][y] = this.characterGrid[x][y] = undefined;
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
      this.letterGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[
        x
      ][y] = this.rotationGrid[x][y] = this.characterGrid[x][y] = undefined;
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
