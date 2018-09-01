import Game from '../../../Game';
import components from '../components';
import { getOrientationFromRotation } from '../util';

const { SteeringControl, State, Force } = components;

export default {
  components: [SteeringControl, State, Force],

  each(e) {
    const { rotation, accelerate } = e.steeringControl;
    const f = e.force;
    const dt = Game.timer.delta;

    e.state.moving = false;

    if (accelerate) {
      e.state.orientation = getOrientationFromRotation(rotation);
      e.state.moving = true;
      const dx = Math.cos(rotation);
      const dy = Math.sin(rotation);

      f.x += dx;
      f.y += dy;
    }
  }
}