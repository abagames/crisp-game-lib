import { fromEntities, entries } from "./util";

export let isPressed = false;
export let isJustPressed = false;
export let isJustReleased = false;

export const codes = [
  "Escape",
  "Digit0",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Minus",
  "Equal",
  "Backspace",
  "Tab",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "BracketLeft",
  "BracketRight",
  "Enter",
  "ControlLeft",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
  "Quote",
  "Backquote",
  "ShiftLeft",
  "Backslash",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
  "Period",
  "Slash",
  "ShiftRight",
  "NumpadMultiply",
  "AltLeft",
  "Space",
  "CapsLock",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "Pause",
  "ScrollLock",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "NumpadSubtract",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "NumpadAdd",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad0",
  "NumpadDecimal",
  "IntlBackslash",
  "F11",
  "F12",
  "F13",
  "F14",
  "F15",
  "F16",
  "F17",
  "F18",
  "F19",
  "F20",
  "F21",
  "F22",
  "F23",
  "F24",
  "IntlYen",
  "Undo",
  "Paste",
  "MediaTrackPrevious",
  "Cut",
  "Copy",
  "MediaTrackNext",
  "NumpadEnter",
  "ControlRight",
  "LaunchMail",
  "AudioVolumeMute",
  "MediaPlayPause",
  "MediaStop",
  "Eject",
  "AudioVolumeDown",
  "AudioVolumeUp",
  "BrowserHome",
  "NumpadDivide",
  "PrintScreen",
  "AltRight",
  "Help",
  "NumLock",
  "Pause",
  "Home",
  "ArrowUp",
  "PageUp",
  "ArrowLeft",
  "ArrowRight",
  "End",
  "ArrowDown",
  "PageDown",
  "Insert",
  "Delete",
  "OSLeft",
  "OSRight",
  "ContextMenu",
  "BrowserSearch",
  "BrowserFavorites",
  "BrowserRefresh",
  "BrowserStop",
  "BrowserForward",
  "BrowserBack"
];
export type Code = typeof codes[number];

export type CodeState = {
  [key in Code]: {
    isPressed: boolean;
    isJustPressed: boolean;
    isJustReleased: boolean;
  };
};

export let code: CodeState;

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
let pressingCode: { [key: string]: boolean } = {};
let pressedCode: { [key: string]: boolean } = {};
let releasedCode: { [key: string]: boolean } = {};

export function init(_options?: Options) {
  options = { ...defaultOptions, ..._options };
  code = fromEntities(
    codes.map(c => [
      c,
      {
        isPressed: false,
        isJustPressed: false,
        isJustReleased: false
      }
    ])
  );
  document.addEventListener("keydown", e => {
    isKeyPressing = isKeyPressed = true;
    pressingCode[e.code] = pressedCode[e.code] = true;
    if (options.onKeyDown != null) {
      options.onKeyDown();
    }
    if (e.code === "AltLeft" || e.code === "AltRight") {
      e.preventDefault();
    }
  });
  document.addEventListener("keyup", e => {
    isKeyPressing = false;
    isKeyReleased = true;
    pressingCode[e.code] = false;
    releasedCode[e.code] = true;
  });
}

export function update() {
  isJustPressed = !isPressed && isKeyPressed;
  isJustReleased = isPressed && isKeyReleased;
  isKeyPressed = isKeyReleased = false;
  isPressed = isKeyPressing;
  entries(code).forEach(([c, s]) => {
    s.isJustPressed = !s.isPressed && pressedCode[c];
    s.isJustReleased = s.isPressed && releasedCode[c];
    s.isPressed = !!pressingCode[c];
  });
  pressedCode = {};
  releasedCode = {};
}

export function clearJustPressed() {
  isJustPressed = false;
  isPressed = true;
}
