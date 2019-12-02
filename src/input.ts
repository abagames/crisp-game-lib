import * as keyboard from "./keyboard";
import * as pointer from "./pointer";
import * as view from "./view";
import * as text from "./text";
import { Vector } from "./vector";
import { wrap } from "./math";
declare const sss;

export let stickAngle = 0;
export let pos = new Vector();
export let isPressed = false;
export let isJustPressed = false;
export let isJustReleased = false;
let isUsingVirtualPad: boolean;
let isFourWaysStick: boolean;
let centerPos = new Vector();
let offsetFromCenter = new Vector();

export function init(_isUsingVirtualPad = true, _isFourWaysStick = false) {
  isUsingVirtualPad = _isUsingVirtualPad;
  isFourWaysStick = _isFourWaysStick;
  centerPos.set(view.size.x / 2, view.size.y / 2);
  keyboard.init({
    onKeyDown: sss.playEmpty,
    isUsingStickKeysAsButton: true,
    isFourWaysStick
  });
  pointer.init(view.canvas, view.size, {
    onPointerDownOrUp: sss.playEmpty,
    anchor: new Vector(0.5, 0.5)
  });
}

export function update() {
  stickAngle = -1;
  keyboard.update();
  if (keyboard.stickAngle >= 0) {
    stickAngle = keyboard.stickAngle;
  }
  pointer.update();
  pos = pointer.pos;
  if (pointer.isPressed) {
    if (pointer.isJustPressed) {
      pointer.setTargetPos(centerPos);
    }
    if (isUsingVirtualPad) {
      offsetFromCenter.set(pointer.targetPos).sub(centerPos);
      if (offsetFromCenter.length > 10) {
        const oa = offsetFromCenter.getAngle() / (Math.PI / 4);
        stickAngle = wrap(Math.round(oa), 0, 8);
        if (isFourWaysStick) {
          stickAngle = Math.floor(stickAngle / 2) * 2;
        }
      }
    }
  }
  isPressed = keyboard.isPressed || pointer.isPressed;
  isJustPressed = keyboard.isJustPressed || pointer.isJustPressed;
  isJustReleased = keyboard.isJustReleased || pointer.isJustReleased;
}

export function draw() {
  if (isUsingVirtualPad && pointer.isPressed) {
    text.print("c", view.size.x / 2 - 2, view.size.y / 2 - 2, {
      colorPattern: "b",
      backgroundColorPattern: "t",
      symbolPattern: "s",
      alpha: 0.5
    });
    let cc = "c";
    let rc = "k";
    if (stickAngle >= 0) {
      cc = stickAngle % 2 === 0 ? "a" : "z";
      rc = "kljh".charAt(Math.floor(stickAngle / 2));
    }
    text.print(cc, pointer.targetPos.x - 2, pointer.targetPos.y - 2, {
      colorPattern: "g",
      backgroundColorPattern: "t",
      symbolPattern: "s",
      rotationPattern: rc,
      alpha: 0.5
    });
  }
}

export function clearJustPressed() {
  keyboard.clearJustPressed();
  pointer.clearJustPressed();
}
