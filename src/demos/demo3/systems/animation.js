import Game from '../../../Game';
import components from '../components';
const { Animation, Sprite } = components;

export default {
  components: [Animation, Sprite],

  each(e) {
    const dt = Game.timer.delta;
    const a = e.animation;
    const s = e.sprite;

    a.elapsed += dt;

    if (a.active || !a.data.idle[a.frame]) {
      if (a.elapsed >= a.data.speed) {
        a.frame = (a.frame + 1) % a.data.frames.length;
        a.elapsed = 0;
      }
    }

    s.texture = a.data.frames[a.frame];

    const scaleX = Math.abs(s.scaleX);
    s.scaleX = a.data.flip ? -scaleX : scaleX;
  }
}