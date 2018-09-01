import Game from '../../../Game';
import components from '../components';
const { Flash, Sprite } = components;

export default {
  components: [Flash, Sprite],

  each (e) {
    e.flash.time += Game.timer.delta;
    if (e.flash.time >= e.flash.duration) {
      e.sprite._sprite.tint = 0xFFFFFF;
      e.removeComponent(Flash);
    } else {
      e.sprite._sprite.tint = Math.floor(0xFFFFFF - (0xFFFFFF * e.flash.time / e.flash.duration));
    }  
  }
}