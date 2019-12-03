export let isPressed = false;
export let isJustPressed = false;
export let isJustReleased = false;

type Options = {
  onKeyDown?: Function;
};
const defaultOptions: Options = {
  onKeyDown: undefined
};
let options: Options;

let isKeyPressing = false;
let isKeyPressed = false;
let isKeyReleased = false;

export function init(_options?: Options) {
  options = { ...defaultOptions, ..._options };
  document.addEventListener("keydown", e => {
    isKeyPressing = isKeyPressed = true;
    if (options.onKeyDown != null) {
      options.onKeyDown();
    }
  });
  document.addEventListener("keyup", e => {
    isKeyPressing = false;
    isKeyReleased = true;
  });
}

export function update() {
  isJustPressed = !isPressed && isKeyPressed;
  isJustReleased = isPressed && isKeyReleased;
  isKeyPressed = isKeyReleased = false;
  isPressed = isKeyPressing;
}

export function clearJustPressed() {
  isJustPressed = false;
  isPressed = true;
}
