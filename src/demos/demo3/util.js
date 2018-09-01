export const RIGHT = 'right';
export const LEFT = 'left';
export const UP = 'up';
export const DOWN = 'down';

export function getOrientationFromRotation(rotation) {
  const step = Math.PI / 8;

  if (rotation <= Math.PI/4 || rotation >= Math.PI/4*7) {
    return RIGHT;
  }

  else if (rotation >= Math.PI/4 && rotation <= Math.PI/4*3 ) {
    return DOWN;
  }

  else if (rotation >= Math.PI/4*3 && rotation <= Math.PI/4*5) {
    return LEFT;
  }

  else if (rotation >= Math.PI/4*5 && rotation <= Math.PI/4*7) {
    return UP;
  }
}