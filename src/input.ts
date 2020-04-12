import * as keyboard from "./keyboard";
import * as pointer from "./pointer";
import * as view from "./view";
import { Vector } from "./vector";
declare const sss;

export let pos = new Vector();
export let isPressed = false;
export let isJustPressed = false;
export let isJustReleased = false;

export function init() {
  keyboard.init({
    onKeyDown: sss.playEmpty,
  });
  pointer.init(view.canvas, view.size, {
    onPointerDownOrUp: sss.playEmpty,
    anchor: new Vector(0.5, 0.5),
  });
}

export function update() {
  keyboard.update();
  pointer.update();
  pos = pointer.pos;
  isPressed = keyboard.isPressed || pointer.isPressed;
  isJustPressed = keyboard.isJustPressed || pointer.isJustPressed;
  isJustReleased = keyboard.isJustReleased || pointer.isJustReleased;
}

export function clearJustPressed() {
  keyboard.clearJustPressed();
  pointer.clearJustPressed();
}

export function set(state: {
  pos: Vector;
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
}) {
  pos.set(state.pos);
  isPressed = state.isPressed;
  isJustPressed = state.isJustPressed;
  isJustReleased = state.isJustReleased;
}
