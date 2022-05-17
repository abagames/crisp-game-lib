import * as keyboard from "./keyboard";
import * as pointer from "./pointer";
import * as view from "./view";
import { Vector } from "./vector";

/** A pressed position of mouse or touch screen. */
export let pos = new Vector();
/** A variable that becomes `true` while the button is pressed. */
export let isPressed = false;
/** A variable that becomes `true` when the button is just pressed. */
export let isJustPressed = false;
/** A variable that becomes `true` when the button is just released. */
export let isJustReleased = false;

/** @ignore */
export function init(onInputDownOrUp: Function) {
  keyboard.init({
    onKeyDown: onInputDownOrUp,
  });
  pointer.init(view.canvas, view.size, {
    onPointerDownOrUp: onInputDownOrUp,
    anchor: new Vector(0.5, 0.5),
  });
}

/** @ignore */
export function update() {
  keyboard.update();
  pointer.update();
  pos = pointer.pos;
  isPressed = keyboard.isPressed || pointer.isPressed;
  isJustPressed = keyboard.isJustPressed || pointer.isJustPressed;
  isJustReleased = keyboard.isJustReleased || pointer.isJustReleased;
}

/** @ignore */
export function clearJustPressed() {
  keyboard.clearJustPressed();
  pointer.clearJustPressed();
}

/** @ignore */
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
