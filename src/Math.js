export const PI = Math.PI;
export const TAU = Math.PI * 2;

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function angleBetween(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function sqrdist(x1, y1, x2, y2) {
  const x = x2 - x1
  const y = y2 - y1
  return x * x + y * y;
}

export function dist(x1, y1, x2, y2) {
  return Math.sqrt(sqrdist(x1, y1, x2, y2));
}

export function clamp(x, min, max) {
  if (x < min) { return min; }
  if (x > max) { return max; }
  return x;
}

export function wrap(x, min, max) {
  const range = max - min;
  while (x < min) { x += range }
  while (x > max) { x -= range }
  return x;
}

export function wrapRotation(r) {
  return wrap(r, 0, TAU);
}

export function turningAngle(start, target) {
  const theta = target - start;

  if (-PI <= theta && theta <= PI) {
    return theta;
  } else if (theta > PI) {
    return theta - TAU;
  } else {
    return theta + TAU;
  }
}

export function intersects(sprite1, sprite2) {
  const w1 = sprite1.width / 2;
  const w2 = sprite2.width / 2;
  const h1 = sprite1.height / 2;
  const h2 = sprite2.height / 2;

  const a = (sprite1.x + w1) < (sprite2.x - w2); 
  const b = (sprite1.x - w1) > (sprite2.x + w2);
  const c = (sprite1.y + h1) < (sprite2.y - h2);
  const d = (sprite1.y - h1) > (sprite2.y + h2);

  return !(a || b || c || d);
}