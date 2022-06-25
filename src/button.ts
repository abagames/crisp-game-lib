import * as pointer from "./pointer";
import { Vector, VectorLike } from "./vector";
import * as input from "./input";
import { setColor } from "./view";
import { rect } from "./rect";
import { text } from "./letter";

export type Button = {
  pos: VectorLike;
  size: VectorLike;
  text: string;
  isToggle: boolean;
  onClick: () => void;
  isPressed: boolean;
  isSelected: boolean;
  isHovered: boolean;
  toggleGroup: Button[];
};

/** @ignore */
export function get({
  pos,
  size,
  text,
  isToggle = false,
  onClick = () => {},
}: {
  pos: VectorLike;
  size: VectorLike;
  text: string;
  isToggle?: boolean;
  onClick?: () => void;
}): Button {
  return {
    pos,
    size,
    text,
    isToggle,
    onClick,
    isPressed: false,
    isSelected: false,
    isHovered: false,
    toggleGroup: [],
  };
}

/** @ignore */
export function update(button: Button) {
  const o = new Vector(input.pos).sub(button.pos);
  button.isHovered = o.isInRect(0, 0, button.size.x, button.size.y);
  if (button.isHovered && pointer.isJustPressed) {
    button.isPressed = true;
  }
  if (button.isPressed && !button.isHovered) {
    button.isPressed = false;
  }
  if (button.isPressed && pointer.isJustReleased) {
    button.onClick();
    button.isPressed = false;
    if (button.isToggle) {
      if (button.toggleGroup.length === 0) {
        button.isSelected = !button.isSelected;
      } else {
        button.toggleGroup.forEach((b) => {
          b.isSelected = false;
        });
        button.isSelected = true;
      }
    }
  }
  draw(button);
}

export function draw(button: Button) {
  setColor(button.isPressed ? "blue" : "light_blue");
  rect(button.pos.x, button.pos.y, button.size.x, button.size.y);
  if (button.isToggle && !button.isSelected) {
    setColor("white");
    rect(
      button.pos.x + 1,
      button.pos.y + 1,
      button.size.x - 2,
      button.size.y - 2
    );
  }
  setColor(button.isHovered ? "black" : "blue");
  text(button.text, button.pos.x + 3, button.pos.y + 3);
}
