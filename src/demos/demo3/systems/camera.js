import { camera, stage, rng } from '../shared';

export default {
  run() {
    const { x: x1, y: y1, target, threshold, offset, trauma } = camera;

    stage.pivot.x = x1;
    stage.pivot.y = y1;
    stage.rotation = 0;

    if (trauma > 0) {  
      const traumaCoefficient = Math.pow(trauma / 10, 2);
      const traumaX = traumaCoefficient * (rng.nextFloat(-1, 1));
      const traumaY = traumaCoefficient * (rng.nextFloat(-1, 1));
      const traumaRotation = traumaCoefficient * (rng.nextFloat(-0.02, 0.02));

      stage.pivot.x += traumaX;
      stage.pivot.y += traumaY;
      stage.rotation += traumaRotation;
      camera.trauma = Math.max(trauma - 0.1, 0);
    }

    const { orientation } = target.state;
    let { x: x2, y: y2 } = target.transform;

    switch (orientation) {
      case 'right':
        x2 += offset;
        break;
      case 'left':
        x2 -= offset; 
        break;
      case 'up':
        y2 -= offset;
        break;
      case 'down':
        y2 += offset;
        break;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    camera.x += (dx / threshold) * 0.15;
    camera.y += (dy / threshold) * 0.15;
  }
}