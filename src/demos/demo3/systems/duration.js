import Game from '../../../Game';
import components from '../components';

const { Duration } = components;

export default {
  components: [Duration],

  each(e) {
    e.duration.time -= Game.timer.delta;
    if (e.duration.time <= 0) {
      e.release();
    }
  }
}